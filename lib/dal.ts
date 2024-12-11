import { createClient } from '@/lib/utils/supabase/server'
import { cache } from 'react'
import type { Database } from '@/database.types'
import type { Profile } from '@/lib/types/auth'

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

export const getUserProfile = cache(async (userId?: string): Promise<Profile | null> => {
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
  return data as Profile
}) 