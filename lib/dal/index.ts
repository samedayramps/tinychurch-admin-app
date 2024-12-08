import 'server-only'
import { createClient } from '@/lib/utils/supabase/server'
import { cache } from 'react'
import { type Database } from '@/database.types'
import { OrganizationSettingsRepository } from './repositories/organization-settings'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, is_superadmin')
    .eq('id', user.id)
    .single()
    .then(result => ({
      ...result,
      next: { tags: [`user-${user.id}`, 'user'] }
    }))
    
  if (!profile) return null
  
  return {
    ...user,
    email: profile.email,
    is_superadmin: profile.is_superadmin
  }
})

export const getUserProfile = cache(async (userId?: string) => {
  if (!userId) {
    // If no userId provided, fall back to current user
    const user = await getCurrentUser()
    if (!user) return null
    userId = user.id
  }
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    .then(result => ({
      ...result,
      next: { tags: [`profile-${userId}`, 'profile'] }
    }))
    
  if (error) return null
  return data
})

export const getOrganizationMembership = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      organizations (*)
    `)
    .eq('user_id', user.id)
    .single()
    .then(result => ({
      ...result,
      next: { 
        tags: [
          `org-member-${user.id}`, 
          'organization-member',
          `organization-${result.data?.organizations?.id}`
        ] 
      }
    }))
    
  if (error) return null
  return data
})

// Re-export all DAL functions for convenient imports
export * from './repositories/organization'
export * from './repositories/profile'
export * from './repositories/audit-log'
export { OrganizationSettingsRepository }