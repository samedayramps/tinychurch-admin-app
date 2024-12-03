import 'server-only'
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { type Database } from '@/database.types'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('email, is_superadmin')
    .eq('id', user.id)
    .single()
    
  if (!profile) return null
  
  return {
    ...user,
    email: profile.email,
    is_superadmin: profile.is_superadmin
  }
})

export const getUserProfile = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
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
    
  if (error) return null
  return data
})

// Re-export all DAL functions for convenient imports
export * from './auth'
export * from './organizations'
export * from './profiles'
export * from './audit'
export * from './events'
export * from './ministries'
export * from './attendance'
export * from './communications' 