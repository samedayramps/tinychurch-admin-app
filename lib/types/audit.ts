import type { Database } from '@/database.types'

export type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']
export type AuditEventType = Database['public']['Enums']['audit_event_type']
export type AuditSeverity = Database['public']['Enums']['audit_severity']

// JSON value type for metadata
export type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }

// Audit log creation parameters
export interface CreateAuditLogParams {
  userId: string
  eventType: AuditEventType
  details: string
  severity?: AuditSeverity
  metadata?: Record<string, JsonValue>
  organizationId?: string
  correlationId?: string
  sessionId?: string
}

// Audit log filters
export interface AuditLogFilters {
  search: string
  dateRange: { from?: Date; to?: Date } | null
  severity: string
  organizationId?: string
  correlationId?: string
}

// Audit log response structure
export interface AuditLogResponse {
  systemLogs: AuditLog[]
  userLogs: AuditLog[]
  securityLogs: AuditLog[]
}

// Event category helper function
export function getEventCategory(eventType: AuditEventType): 'system' | 'user_action' | 'security' {
  if (eventType.startsWith('system.') || eventType === 'system') {
    return 'system'
  }
  if (eventType.startsWith('security.') || eventType === 'security' || eventType === 'auth') {
    return 'security'
  }
  return 'user_action'
}

// Constants for event types
export const SYSTEM_EVENTS = [
  'system.startup',
  'system.shutdown',
  'system.config_change',
  'system.maintenance',
] as const

export const SECURITY_EVENTS = [
  'security.login',
  'security.logout',
  'security.password_change',
  'security.access_denied',
  'auth.success',
  'auth.failure',
] as const

export const USER_ACTION_EVENTS = [
  'user.create',
  'user.update',
  'user.delete',
  'user.login',
  'user.logout',
] as const 