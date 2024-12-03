import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { OrganizationMember } from '@/lib/types/auth'
import { getCurrentUser } from './auth'

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
  return data as OrganizationMember
})

export const getAllOrganizations = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organizations')
    .select('*')
    .order('name')
    
  if (error) return null
  return data
})

export const getOrganizationMembers = cache(async (organizationId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('organization_members')
    .select(`
      *,
      profiles (*)
    `)
    .eq('organization_id', organizationId)
    
  if (error) return null
  return data
})

export const getOrganizationStats = cache(async () => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  
  // Get organization membership first
  const { data: membership } = await supabase
    .from('organization_members')
    .select('organization_id')
    .eq('user_id', user.id)
    .single()
    
  if (!membership) return null
  
  // Get various stats in parallel
  const [members, ministries, events, attendance] = await Promise.all([
    supabase
      .from('organization_members')
      .select('count', { count: 'exact' })
      .eq('organization_id', membership.organization_id),
      
    supabase
      .from('ministries')
      .select('count', { count: 'exact' })
      .eq('organization_id', membership.organization_id),
      
    supabase
      .from('events')
      .select('count', { count: 'exact' })
      .eq('organization_id', membership.organization_id),
      
    supabase
      .from('attendance_records')
      .select('count', { count: 'exact' })
      .eq('organization_id', membership.organization_id)
  ])
  
  return {
    totalMembers: members.count || 0,
    totalMinistries: ministries.count || 0,
    totalEvents: events.count || 0,
    totalAttendance: attendance.count || 0
  }
}) 