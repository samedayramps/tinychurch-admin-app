import { createClient } from '@/lib/utils/supabase/server'
import type { Database } from '@/database.types'
import { v4 as uuidv4 } from 'uuid'

type AuditEventType = Database['public']['Enums']['audit_event_type']
type AuditSeverity = Database['public']['Enums']['audit_severity']

interface LogActivityOptions {
  userId: string
  eventType: AuditEventType
  details: string
  severity?: AuditSeverity
  metadata?: Record<string, any>
  organizationId?: string
  correlationId?: string
  sessionId?: string
}

export async function logActivity({
  userId,
  eventType,
  details,
  severity = 'info',
  metadata = {},
  organizationId,
  correlationId = uuidv4(),
  sessionId,
}: LogActivityOptions) {
  const supabase = await createClient()

  const enrichedMetadata = {
    ...metadata,
    correlation_id: correlationId,
    session_id: sessionId,
    ip_address: metadata.ip_address,
    user_agent: metadata.user_agent,
  }

  const { error } = await supabase
    .from('user_activity_logs')
    .insert({
      user_id: userId,
      event_type: eventType,
      details,
      severity,
      metadata: enrichedMetadata,
      organization_id: organizationId,
      created_at: new Date().toISOString()
    })

  if (error) {
    console.error('Error logging activity:', error)
  }
} 