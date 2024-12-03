import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { Profile } from '@/lib/types/auth'

export const getCurrentUser = cache(async () => {
  const headersList = await headers()
  const impersonatingId = headersList.get('x-impersonating-id')
  
  const supabase = await createClient()
  
  if (impersonatingId) {
    const { data: impersonatedUser, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', impersonatingId)
      .single()
      
    if (error || !impersonatedUser) return null
    return impersonatedUser
  }
  
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user) return null
  
  return user
})

export const getRealUser = cache(async () => {
  const headersList = await headers()
  const realUserId = headersList.get('x-real-user-id')
  
  if (!realUserId) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', realUserId)
    .single()
    
  if (error) return null
  return data as Profile
}) 