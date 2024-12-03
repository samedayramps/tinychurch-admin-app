import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const getAttendanceRecords = cache(async (options: {
  organizationId: string
  eventId?: string
  ministryId?: string
  startDate?: Date
  endDate?: Date
}) => {
  const supabase = await createClient()
  let query = supabase
    .from('attendance_records')
    .select(`
      *,
      event:event_id (*),
      ministry:ministry_id (*),
      attendee:attendee_id (*)
    `)
    .eq('organization_id', options.organizationId)
    
  if (options.eventId) {
    query = query.eq('event_id', options.eventId)
  }
  
  if (options.ministryId) {
    query = query.eq('ministry_id', options.ministryId)
  }
  
  if (options.startDate) {
    query = query.gte('check_in_time', options.startDate.toISOString())
  }
  
  if (options.endDate) {
    query = query.lte('check_in_time', options.endDate.toISOString())
  }
  
  const { data, error } = await query
  if (error) return null
  return data
}) 