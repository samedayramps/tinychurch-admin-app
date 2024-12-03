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