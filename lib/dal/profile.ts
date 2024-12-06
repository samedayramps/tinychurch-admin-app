import { createClient } from '@/lib/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'

export const getCurrentUser = cache(async () => {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) return null
  
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()
    
  return profile as Profile
})

export const getUserProfile = cache(async (userId?: string) => {
  if (!userId) {
    return getCurrentUser()
  }
  
  const supabase = await createClient()
  const { data } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
    
  return data as Profile | null
}) 