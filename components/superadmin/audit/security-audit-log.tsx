'use client'

import { Card } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { formatDistanceToNow } from 'date-fns'
import { Badge } from '@/components/ui/badge'
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']
type AuditEventType = Database['public']['Enums']['audit_event_type']

interface SecurityAuditLogProps {
  logs: AuditLog[]
}

// Helper function to determine badge variant
function getBadgeVariant(eventType: AuditEventType, details: string): 'destructive' | 'default' {
  if (eventType === 'error' || eventType === 'security') {
    return 'destructive'
  }
  
  // Check details for auth failures
  if (eventType === 'auth' && details.toLowerCase().includes('failed')) {
    return 'destructive'
  }
  
  return 'default'
}

export function SecurityAuditLog({ logs }: SecurityAuditLogProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>Event</TableHead>
            <TableHead>User</TableHead>
            <TableHead>IP Address</TableHead>
            <TableHead>Details</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {formatDistanceToNow(new Date(log.created_at!), { addSuffix: true })}
              </TableCell>
              <TableCell>
                <Badge variant={getBadgeVariant(log.event_type, log.details)}>
                  {log.event_type}
                </Badge>
              </TableCell>
              <TableCell>{log.user_id}</TableCell>
              <TableCell>{(log.metadata as any)?.ip_address || '—'}</TableCell>
              <TableCell>{log.details}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 