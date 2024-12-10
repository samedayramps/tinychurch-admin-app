'use client'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/components/ui/use-toast"
import { CalendarEvent } from './shared-types'

interface DeleteEventDialogProps {
  event: CalendarEvent | null
  open: boolean
  onClose: () => void
  onSuccess: () => void
}

export function DeleteEventDialog({
  event,
  open,
  onClose,
  onSuccess
}: DeleteEventDialogProps) {
  const { toast } = useToast()

  const handleDelete = async () => {
    if (!event) return

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete event')

      onSuccess()
    } catch (error) {
      console.error('Failed to delete event:', error)
      toast({
        title: "Error",
        description: "Failed to delete event. Please try again.",
        variant: "destructive",
      })
      onClose()
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete Event</AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete &quot;{event?.title}&quot;? 
            {event?.frequency !== 'once' && " This will delete all recurring instances of this event."}
            This action cannot be undone.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDelete}>Delete</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
} 