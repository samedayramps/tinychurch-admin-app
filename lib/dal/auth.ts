import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'
import { getImpersonatedUser } from './impersonation'

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