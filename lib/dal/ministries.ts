import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getMinistries = cache(async (organizationId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ministries')
    .select(`
      *,
      leader:leader_id (id, email, full_name),
      ministry_members (
        *,
        profiles (*)
      )
    `)
    .eq('organization_id', organizationId)
    
  if (error) return null
  return data
})

export const getUserMinistries = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('ministry_members')
    .select(`
      *,
      ministries (
        *,
        leader:leader_id (*)
      )
    `)
    .eq('user_id', user.id)
    
  if (error) return null
  return data
}) 