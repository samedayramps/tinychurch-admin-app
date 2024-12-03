import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { Database } from '@/database.types'

type OrganizationMember = Database['public']['Tables']['organization_members']['Row']

export const getOrganizationMembers = cache(async (organizationId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      profiles (
        id,
        email,
        full_name,
        avatar_url
      )
    `)
    .eq('organization_id', organizationId)
    .order('created_at', { ascending: false })
    
  if (error) {
    console.error('Error fetching organization members:', error)
    return null
  }
  
  return data as OrganizationMember[]
})

export const getMemberById = cache(async (memberId: string) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      profiles (*),
      organizations (*)
    `)
    .eq('id', memberId)
    .single()
    
  if (error) return null
  return data as OrganizationMember
}) 