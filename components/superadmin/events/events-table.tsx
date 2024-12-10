'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { formatDistanceToNow } from 'date-fns'
import type { Database } from '@/database.types'
import { CalendarEvent } from './shared-types'

interface EventsTableProps {
  events: CalendarEvent[]
}

export function EventsTable({ events }: EventsTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Title</TableHead>
          <TableHead>Date Created</TableHead>
          <TableHead>Organization</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Frequency</TableHead>
          <TableHead>Description</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {events.map((event) => (
          <TableRow key={event.id}>
            <TableCell>{event.title}</TableCell>
            <TableCell className="whitespace-nowrap">
              {formatDistanceToNow(new Date(event.created_at), { addSuffix: true })}
            </TableCell>
            <TableCell>{event.organizations?.name || '—'}</TableCell>
            <TableCell>
              <Badge 
                variant={event.status === 'cancelled' ? 'destructive' : 'default'}
              >
                {event.status}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant="outline">
                {event.frequency === 'once' ? 'One-time' : `Repeats ${event.frequency}`}
              </Badge>
            </TableCell>
            <TableCell className="max-w-[300px] truncate">
              {event.description || '—'}
            </TableCell>
          </TableRow>
        ))}
        {events.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
              No events found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
} 