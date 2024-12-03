import { createClient } from '@/utils/supabase/server'
import { cache } from 'react'
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['audit_logs']['Row']

export const getAuditLogs = cache(async ({ limit = 10 }: { limit?: number } = {}) => {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit)
    
  if (error) {
    console.error('Error fetching audit logs:', error)
    return null
  }
  
  return data as AuditLog[]
})

// System-wide organization ID for events not tied to a specific org
const SYSTEM_ORG_ID = '00000000-0000-0000-0000-000000000000'

type AuditEvent = {
  action: 'impersonation_start' | 'impersonation_end'
  actorId: string
  actorEmail: string
  targetId: string
  organizationId?: string
}

export async function logImpersonationEvent(data: AuditEvent) {
  const supabase = await createClient(true)
  
  try {
    const { error } = await supabase.from('audit_logs').insert({
      category: 'auth',
      action: data.action,
      actor_id: data.actorId,
      target_id: data.targetId,
      description: `Superadmin ${data.actorEmail} ${
        data.action === 'impersonation_start' ? 'started' : 'stopped'
      } impersonating user ${data.targetId}`,
      severity: 'notice',
      metadata: {
        actor_email: data.actorEmail,
        target_id: data.targetId
      }
    })

    if (error) throw error
    return true
  } catch (error) {
    console.error('Failed to log audit event:', error)
    return false
  }
} 