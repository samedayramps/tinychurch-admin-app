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
import type { Database } from '@/database.types'

type AuditLog = Database['public']['Tables']['user_activity_logs']['Row']

interface UserAuditLogProps {
  logs: AuditLog[]
}

export function UserAuditLog({ logs }: UserAuditLogProps) {
  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Timestamp</TableHead>
            <TableHead>User</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Details</TableHead>
            <TableHead>Organization</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="whitespace-nowrap">
                {formatDistanceToNow(new Date(log.created_at!), { addSuffix: true })}
              </TableCell>
              <TableCell>{log.user_id}</TableCell>
              <TableCell>{log.event_type}</TableCell>
              <TableCell>{log.details}</TableCell>
              <TableCell>{log.organization_id || '—'}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
} 