import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import { getCurrentUser } from './auth'

export const getMessages = cache(async (options: {
  organizationId: string
  type?: 'email' | 'sms' | 'notification'
  status?: 'draft' | 'scheduled' | 'sent' | 'failed'
  limit?: number
  offset?: number
}) => {
  const supabase = await createClient()
  let query = supabase
    .from('communications')
    .select(`
      *,
      sender:sender_id (*),
      recipients:communication_recipients (
        *,
        recipient:recipient_id (*)
      )
    `)
    .eq('organization_id', options.organizationId)
    .order('created_at', { ascending: false })
    
  if (options.type) {
    query = query.eq('type', options.type)
  }
  
  if (options.status) {
    query = query.eq('status', options.status)
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