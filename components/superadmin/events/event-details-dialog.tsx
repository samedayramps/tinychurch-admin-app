'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Pencil, Trash, Copy } from 'lucide-react'
import { EditEventForm } from './edit-event-form'
import { DeleteEventDialog } from './delete-event-dialog'
import { CalendarEvent, formatLocation, isLocationJson } from './shared-types'

interface EventDetailsDialogProps {
  event: CalendarEvent | null
  organizations: { id: string; name: string }[]
  onClose: () => void
  onSuccess?: (updatedEvent: CalendarEvent) => void
}

export function EventDetailsDialog({ 
  event, 
  organizations,
  onClose,
  onSuccess 
}: EventDetailsDialogProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  if (!event) return null

  const formatDateTime = (date: string, time: string) => {
    return format(new Date(`${date}T${time}`), 'PPp')
  }

  const handleEditSuccess = (updatedEvent: CalendarEvent) => {
    setIsEditing(false)
    onSuccess?.(updatedEvent)
    onClose()
  }

  return (
    <Dialog open={!!event} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <div className="flex justify-between items-start">
            <DialogTitle>{event.title}</DialogTitle>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setIsEditing(true)
                }}
              >
                <Copy className="h-4 w-4 mr-2" />
                Clone
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsEditing(true)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setIsDeleting(true)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {!isEditing ? (
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium">Time</h4>
              <p className="text-sm text-muted-foreground">
                {formatDateTime(event.start_date, event.start_time)}
                {event.end_date && ` - ${formatDateTime(event.end_date, event.end_time)}`}
              </p>
            </div>

            {event.location && (
              <div>
                <h4 className="text-sm font-medium">Location</h4>
                <p className="text-sm text-muted-foreground">
                  {isLocationJson(event.location) ? formatLocation(event.location) : '—'}
                </p>
              </div>
            )}

            {event.description && (
              <div>
                <h4 className="text-sm font-medium">Description</h4>
                <p className="text-sm text-muted-foreground">{event.description}</p>
              </div>
            )}

            <div>
              <h4 className="text-sm font-medium">Organization</h4>
              <p className="text-sm text-muted-foreground">
                {event.organizations?.name || 'No organization'}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium">Recurrence</h4>
              <Badge>
                {event.frequency === 'once' ? 'One-time event' : `Repeats ${event.frequency}`}
              </Badge>
            </div>
          </div>
        ) : (
          <EditEventForm
            event={event}
            organizations={organizations}
            onSuccess={handleEditSuccess}
            onCancel={() => setIsEditing(false)}
          />
        )}
      </DialogContent>

      <DeleteEventDialog
        event={event}
        open={isDeleting}
        onClose={() => setIsDeleting(false)}
        onSuccess={() => {
          setIsDeleting(false)
          onClose()
        }}
      />
    </Dialog>
  )
} 