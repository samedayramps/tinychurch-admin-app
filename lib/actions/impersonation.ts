'use server'

import { ImpersonationService } from '@/lib/services/impersonation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/utils/supabase/server'
import { handleImpersonationError } from '@/lib/utils/error-handling'

export async function startImpersonation(targetUserId: string) {
  try {
    const supabase = await createClient(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      console.error('No authenticated user found')
      throw new Error('Authentication required')
    }

    console.log('Starting impersonation:', {
      actorId: user.id,
      targetId: targetUserId
    })

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    if (profileError) {
      console.error('Error fetching profile:', profileError)
    }

    console.log('Actor profile:', profile)

    if (!profile?.is_superadmin) {
      throw new Error('Superadmin privileges required')
    }

    const { data: targetUser, error: targetError } = await supabase
      .from('profiles')
      .select('id, email')
      .eq('id', targetUserId)
      .single()

    if (targetError) {
      console.error('Error fetching target user:', targetError)
    }

    console.log('Target user:', targetUser)

    if (!targetUser) {
      throw new Error('Target user not found')
    }

    const service = await ImpersonationService.create()
    console.log('Calling service.startImpersonation')
    const result = await service.startImpersonation(user.id, targetUserId)
    console.log('Impersonation result:', result)

    // Revalidate all affected paths
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
    revalidatePath('/api/auth/impersonation-status')
    revalidatePath('/superadmin/dashboard')

    const { data: sessionId, error: sessionError } = await supabase
      .rpc('start_impersonation', {
        p_real_user_id: user.id,
        p_target_user_id: targetUserId
      })

    console.log('Direct RPC call result:', { sessionId, sessionError })

    const { data: directInsert, error: insertError } = await supabase
      .from('impersonation_sessions')
      .insert({
        real_user_id: user.id,
        target_user_id: targetUserId,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
      })
      .select()
      .single()

    console.log('Direct insert result:', { directInsert, insertError })

    return result
  } catch (error) {
    console.error('Impersonation error:', error)
    return handleImpersonationError(error, 'start-impersonation')
  }
}

export async function stopImpersonation() {
  try {
    const supabase = await createClient(true)
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      throw new Error('Authentication required')
    }

    const service = await ImpersonationService.create()
    
    // Get current impersonation status to get the target user ID
    const status = await service.getStatus(user.id)
    if (!status.impersonatingId) {
      throw new Error('No active impersonation session')
    }

    const result = await service.stopImpersonation(user.id, status.impersonatingId)

    // Revalidate all affected paths
    revalidatePath('/', 'layout')
    revalidatePath('/dashboard')
    revalidatePath('/api/auth/impersonation-status')
    revalidatePath('/superadmin/dashboard')

    return result
  } catch (error) {
    return handleImpersonationError(error, 'stop-impersonation')
  }
} 