'use client'

import { useState } from 'react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { format } from "date-fns"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit2, Trash } from "lucide-react"
import { CalendarEvent, formatLocation, isLocationJson } from './shared-types'
import { EventDetailsDialog } from './event-details-dialog'
import { DeleteEventDialog } from './delete-event-dialog'
import { useToast } from '@/components/ui/use-toast'

interface EventsListProps {
  events: CalendarEvent[]
  organizations: { id: string; name: string }[]
}

export function EventsList({ events: initialEvents, organizations }: EventsListProps) {
  const [events, setEvents] = useState(initialEvents)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [eventToDelete, setEventToDelete] = useState<CalendarEvent | null>(null)
  const { toast } = useToast()

  const handleEditSuccess = (updatedEvent: CalendarEvent) => {
    setEvents(events.map(event => 
      event.id === updatedEvent.id ? updatedEvent : event
    ))
    setSelectedEvent(null)
    toast({
      title: "Event updated",
      description: "The event has been updated successfully.",
    })
  }

  const handleDeleteSuccess = (deletedEventId: string) => {
    setEvents(events.filter(event => event.id !== deletedEventId))
    setEventToDelete(null)
    toast({
      title: "Event deleted",
      description: "The event has been deleted successfully.",
    })
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date & Time</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Organization</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Frequency</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell>
                <div>
                  <div className="font-medium">{event.title}</div>
                  {event.description && (
                    <div className="text-sm text-muted-foreground">
                      {event.description}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <div className="text-sm">
                  <div>{format(new Date(event.start_date), 'PPP')}</div>
                  <div className="text-muted-foreground">
                    {format(new Date(`${event.start_date}T${event.start_time}`), 'p')} - 
                    {format(new Date(`${event.end_date || event.start_date}T${event.end_time}`), 'p')}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                {event.location ? (
                  <div className="text-sm">
                    {formatLocation(event.location)}
                  </div>
                ) : (
                  '—'
                )}
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
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSelectedEvent(event)}
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setEventToDelete(event)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
          {events.length === 0 && (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6 text-muted-foreground">
                No events found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      {/* Edit Dialog */}
      <EventDetailsDialog
        event={selectedEvent}
        organizations={organizations}
        onClose={() => setSelectedEvent(null)}
        onSuccess={handleEditSuccess}
      />

      {/* Delete Dialog */}
      <DeleteEventDialog
        event={eventToDelete}
        open={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onSuccess={() => handleDeleteSuccess(eventToDelete?.id!)}
      />
    </div>
  )
} 