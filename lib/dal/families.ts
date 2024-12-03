import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getFamilyMembers = cache(async (familyId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      *,
      profiles (*),
      relationships (*)
    `)
    .eq('family_id', familyId)
    
  if (error) return null
  return data
})

export const getUserFamilies = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('family_members')
    .select(`
      *,
      families (*)
    `)
    .eq('user_id', user.id)
    
  if (error) return null
  return data
}) 