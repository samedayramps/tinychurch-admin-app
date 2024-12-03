import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'

export const getImpersonatedUser = cache(async (userId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  if (error) return null
  return {
    ...data,
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