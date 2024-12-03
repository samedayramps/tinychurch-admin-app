import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'

export const createAuditLog = async (data: {
  category: 'auth' | 'organization' | 'member' | 'security' | 'system'
  action: string
  organizationId: string
  actorId: string
  targetType?: string
  targetId?: string
  description: string
  metadata?: Record<string, any>
  severity?: 'info' | 'notice' | 'warning' | 'alert' | 'critical'
}) => {
  const supabase = await createClient()
  const { error } = await supabase
    .from('audit_logs')
    .insert({
      ...data,
      severity: data.severity || 'info'
    })
    
  return !error
}

export const getAuditLogsByTarget = cache(async (targetType: string, targetId: string) => {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .eq('target_type', targetType)
    .eq('target_id', targetId)
    .order('created_at', { ascending: false })
    
  if (error) return null
  return data
}) 