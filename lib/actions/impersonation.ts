'use server'

import { z } from 'zod'
import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { logImpersonationEvent } from '@/lib/dal/audit'
import type { SupabaseClient } from '@supabase/supabase-js'

const impersonationSchema = z.object({
  targetUserId: z.string().uuid(),
})

export async function startImpersonation(targetUserId: string) {
  try {
    console.log(' Starting impersonation process:', { targetUserId })
    
    const supabase = await createClient(true)
    
    // Get current user and verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('👤 Current user:', { id: user?.id, email: user?.email })
    
    if (authError || !user) {
      console.error('❌ Authentication error:', authError)
      throw new Error('Authentication required')
    }

    // Get target user's organization for context
    const { data: targetUser } = await supabase
      .from('profiles')
      .select(`
        *,
        organization_members!inner (
          organization_id
        )
      `)
      .eq('id', targetUserId)
      .single()

    const organizationId = targetUser?.organization_members?.[0]?.organization_id
    if (!organizationId) {
      throw new Error('Target user has no organization')
    }

    // Verify superadmin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_superadmin, email')
      .eq('id', user.id)
      .single()

    console.log('🔑 Superadmin check:', { 
      isSuperadmin: profile?.is_superadmin,
      error: profileError?.message 
    })

    if (profileError || !profile?.is_superadmin) {
      console.error('❌ Unauthorized access attempt')
      throw new Error('Unauthorized - Superadmin access required')
    }

    // Set impersonation metadata using admin API
    console.log('📝 Setting impersonation metadata...')
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      user.id,
      {
        app_metadata: {
          impersonation: {
            impersonating: targetUserId,
            original_user: user.id,
            started_at: Date.now()
          }
        }
      }
    )

    if (updateError) {
      console.error('❌ Failed to update user metadata:', updateError)
      throw updateError
    }

    // After setting metadata
    const isMetadataSet = await verifyImpersonationMetadata(supabase, user.id, targetUserId)
    if (!isMetadataSet) {
      console.error('❌ Metadata verification failed')
      throw new Error('Failed to set impersonation metadata')
    }

    // Set cookies
    console.log('🍪 Setting impersonation cookies...')
    const cookieStore = await cookies()
    cookieStore.set('impersonating_user_id', targetUserId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/'
    })

    // Log the event with organization context
    console.log('📋 Logging impersonation event...')
    await logImpersonationEvent({
      action: 'impersonation_start',
      actorId: user.id,
      actorEmail: profile.email || user.email || '',
      targetId: targetUserId,
      organizationId: organizationId
    })

    // Force refresh session
    console.log('🔄 Refreshing session...')
    await supabase.auth.refreshSession()

    console.log('✅ Impersonation started successfully')
    revalidatePath('/dashboard')
    revalidatePath('/api/auth/impersonation-status')

    // Revalidate all paths at once
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
    revalidatePath('/api/auth/impersonation-status')
    revalidatePath('/superadmin/dashboard')

    // Return success with the user ID to trigger the event on the client
    return { success: true, userId: targetUserId }
  } catch (error) {
    console.error('❌ Impersonation failed:', error)
    if (error instanceof z.ZodError) {
      return { error: 'Invalid input data' }
    }
    return { error: 'Failed to start impersonation' }
  }
}

export async function stopImpersonation() {
  try {
    const supabase = await createClient(true)
    const cookieStore = await cookies()
    const impersonatingId = cookieStore.get('impersonating_user_id')?.value
    
    if (impersonatingId) {
      // Get current user and target user's organization
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      if (!user || userError) {
        throw new Error('Failed to get user')
      }

      // Get target user's organization for context
      const { data: targetUser } = await supabase
        .from('profiles')
        .select(`
          *,
          organization_members!inner (
            organization_id
          )
        `)
        .eq('id', impersonatingId)
        .single()

      const organizationId = targetUser?.organization_members?.[0]?.organization_id
      if (!organizationId) {
        throw new Error('Target user has no organization')
      }

      // Get profile for logging
      const { data: profile } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', user.id)
        .single()

      // Call the RPC function to stop impersonation
      const { error: rpcError } = await supabase.rpc('manage_impersonation', {
        action: 'stop',
        target_user_id: impersonatingId
      })

      if (rpcError) {
        console.error('Failed to stop impersonation:', rpcError)
        throw rpcError
      }

      // Force refresh session
      await supabase.auth.refreshSession()

      // Clear cookie
      cookieStore.delete('impersonating_user_id')

      // Log the event with organization context
      await logImpersonationEvent({
        action: 'impersonation_end',
        actorId: user.id,
        actorEmail: profile?.email || user.email || '',
        targetId: impersonatingId,
        organizationId: organizationId
      })

      // Revalidate all paths immediately
      revalidatePath('/', 'layout')
      revalidatePath('/dashboard')
      revalidatePath('/api/auth/impersonation-status')
      revalidatePath('/superadmin/dashboard')

      // Force another session refresh to ensure changes are picked up
      await supabase.auth.refreshSession()
    }
    
    return { success: true }
  } catch (error) {
    console.error('Failed to stop impersonation:', error)
    return { error: error instanceof Error ? error.message : 'Failed to stop impersonation' }
  }
} 

async function verifyImpersonationMetadata(supabase: SupabaseClient, userId: string, targetUserId: string) {
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    console.error('❌ Failed to verify metadata - no user')
    return false
  }
  
  const metadata = user.app_metadata?.impersonation
  console.log('🔍 Verifying metadata:', {
    expected: {
      impersonating: targetUserId,
      original_user: userId
    },
    actual: metadata
  })
  
  return metadata?.impersonating === targetUserId && metadata?.original_user === userId
} 