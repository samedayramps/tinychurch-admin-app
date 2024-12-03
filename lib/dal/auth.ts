import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'

export const getProfileById = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error) return null
  return profile as Profile
})

export const getImpersonatedUser = cache(async (userId: string) => {
  const profile = await getProfileById(userId)
  if (!profile) return null
  
  return {
    ...profile,
    impersonated: true
  } as Profile
})

export const verifyImpersonationPermissions = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', userId)
    .single()
    
  if (error || !profile?.is_superadmin) return false
  return true
})

export const getCurrentUser = cache(async () => {
  const headersList = await headers()
  const impersonatingId = headersList.get('x-impersonating-id')
  
  // Handle impersonation
  if (impersonatingId) {
    return getImpersonatedUser(impersonatingId)
  }
  
  // Get authenticated user
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  
  // Get profile data
  const profile = await getProfileById(user.id)
  if (!profile) return null
  
  return {
    ...user,
    ...profile
  } as Profile
})

export const getRealUser = cache(async () => {
  const headersList = await headers()
  const realUserId = headersList.get('x-real-user-id')
  
  if (!realUserId) return null
  return getProfileById(realUserId)
})

export const logImpersonationEvent = async (data: {
  action: 'impersonation_start' | 'impersonation_end'
  actorId: string
  actorEmail: string
  targetId: string
}) => {
  const supabase = await createClient()
  const { error } = await supabase.from('audit_logs').insert({
    category: 'auth',
    action: data.action,
    actor_id: data.actorId,
    target_id: data.targetId,
    description: `Superadmin ${data.actorEmail} ${data.action === 'impersonation_start' ? 'started' : 'stopped'} impersonating user ${data.targetId}`,
    severity: 'notice'
  })
  
  return !error
}

export async function startImpersonation(targetUserId: string) {
  const supabase = await createClient(true) // Use admin client
  
  console.log('Starting impersonation process:', { targetUserId })
  
  // Get current user for logging
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    console.error('No authenticated user found')
    throw new Error('Authentication required')
  }
  
  // Call RPC function to start impersonation
  console.log('Calling manage_impersonation RPC:', { 
    action: 'start',
    targetUserId,
    currentUser: user.id 
  })
  
  const { data, error } = await supabase.rpc('manage_impersonation', {
    target_user_id: targetUserId,
    action: 'start'
  })
  
  if (error) {
    console.error('Failed to start impersonation:', error)
    throw error
  }
  
  console.log('Impersonation metadata set:', data)
  
  // Refresh session to get new metadata
  console.log('Refreshing session...')
  const { data: sessionData, error: sessionError } = await supabase.auth.refreshSession()
  
  if (sessionError) {
    console.error('Failed to refresh session:', sessionError)
    throw sessionError
  }
  
  console.log('Session refreshed with new metadata:', {
    impersonation: sessionData.session?.user.app_metadata.impersonation
  })
  
  // Log impersonation event
  await logImpersonationEvent({
    action: 'impersonation_start',
    actorId: user.id,
    actorEmail: user.email || '',
    targetId: targetUserId
  })
  
  console.log('Impersonation started successfully')
  
  return data
}

export async function stopImpersonation() {
  const supabase = await createClient(true)
  
  console.log('Stopping impersonation...')
  
  // Get current impersonation state before stopping
  const { data: { session } } = await supabase.auth.getSession()
  const impersonationData = session?.user?.app_metadata?.impersonation
  
  if (!impersonationData) {
    console.log('No active impersonation found')
    return
  }
  
  console.log('Current impersonation state:', impersonationData)
  
  // Call RPC function to stop impersonation
  console.log('Calling manage_impersonation RPC:', { action: 'stop' })
  
  const { error } = await supabase.rpc('manage_impersonation', {
    action: 'stop'
  })
  
  if (error) {
    console.error('Failed to stop impersonation:', error)
    throw error
  }
  
  // Refresh session to clear metadata
  console.log('Refreshing session...')
  const { error: sessionError } = await supabase.auth.refreshSession()
  
  if (sessionError) {
    console.error('Failed to refresh session:', sessionError)
    throw sessionError
  }
  
  // Log end of impersonation
  await logImpersonationEvent({
    action: 'impersonation_end',
    actorId: session.user.id,
    actorEmail: session.user.email || '',
    targetId: impersonationData.impersonating
  })
  
  console.log('Impersonation stopped successfully')
}

export const getUserProfile = cache(async (userId?: string) => {
  if (!userId) {
    // If no userId provided, fall back to current user
    const user = await getCurrentUser()
    if (!user) return null
    userId = user.id
  }
  
  const supabase = await createClient()
  
  // Get profile data
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    .then(result => ({
      ...result,
      next: { tags: [`profile-${userId}`, 'profile'] }
    }))
    
  if (error) return null
  
  // Check impersonation status
  const { data: { session } } = await supabase.auth.getSession()
  const isImpersonating = !!session?.user?.app_metadata?.impersonation
  
  return {
    ...profile,
    is_impersonating: isImpersonating
  }
}) 