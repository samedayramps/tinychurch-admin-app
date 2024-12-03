import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getPrayerRequests = cache(async (options: {
  organizationId: string
  visibility?: 'public' | 'members_only' | 'staff_only' | 'private'
  limit?: number
  offset?: number
}) => {
  const user = await getCurrentUser()
  if (!user) return null
  
  const supabase = await createClient()
  let query = supabase
    .from('prayer_requests')
    .select(`
      *,
      profiles:author_id (*)
    `)
    .eq('organization_id', options.organizationId)
    .order('created_at', { ascending: false })
    
  if (options.visibility) {
    query = query.eq('visibility_level', options.visibility)
  }
  
  if (options.limit) {
    query = query.limit(options.limit)
  }
  
  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 10) - 1)
  }
  
  const { data, error } = await query
  if (error) return null
  return data
}) 