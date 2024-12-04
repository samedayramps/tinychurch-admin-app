import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'

export const getSuperAdminStatus = cache(async (): Promise<boolean> => {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return false

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', user.id)
    .single()
    
  return !!profile?.is_superadmin
})

export const requireSuperAdmin = cache(async (): Promise<Profile> => {
  const supabase = await createClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('Not authenticated')
  }
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  if (!profile?.is_superadmin) {
    throw new Error('Not authorized')
  }

  return profile as Profile
}) 