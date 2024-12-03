import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getAuditLogs = cache(async (options: {
  category?: string
  organizationId?: string
  limit?: number
  offset?: number
}) => {
  const supabase = await createClient()
  
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (options.category) {
    query = query.eq('category', options.category)
  }
  
  if (options.organizationId) {
    query = query.eq('organization_id', options.organizationId)
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