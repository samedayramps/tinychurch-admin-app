import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getEvents = cache(async (options: {
  organizationId: string
  startDate?: Date
  endDate?: Date
  visibility?: 'public' | 'members_only' | 'staff_only' | 'private'
}) => {
  const supabase = await createClient()
  let query = supabase
    .from('events')
    .select(`
      *,
      organizer:organizer_id (id, email, full_name),
      location:location_id (*)
    `)
    .eq('organization_id', options.organizationId)
    
  if (options.startDate) {
    query = query.gte('start_date', options.startDate.toISOString())
  }
  
  if (options.endDate) {
    query = query.lte('end_date', options.endDate.toISOString())
  }
  
  if (options.visibility) {
    query = query.eq('visibility_level', options.visibility)
  }
  
  const { data, error } = await query
  if (error) return null
  return data
}) 