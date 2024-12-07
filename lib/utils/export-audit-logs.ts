import { saveAs } from 'file-saver'
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']

export function exportAuditLogs(logs: AuditLog[], format: 'csv' | 'json') {
  if (format === 'csv') {
    const headers = ['Timestamp', 'Event Type', 'Details', 'User ID', 'Organization ID']
    const csvContent = [
      headers.join(','),
      ...logs.map(log => [
        log.created_at,
        log.event_type,
        `"${log.details.replace(/"/g, '""')}"`,
        log.user_id,
        log.organization_id || ''
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
    saveAs(blob, `audit-logs-${new Date().toISOString()}.csv`)
  } else {
    const blob = new Blob([JSON.stringify(logs, null, 2)], { type: 'application/json' })
    saveAs(blob, `audit-logs-${new Date().toISOString()}.json`)
  }
} 