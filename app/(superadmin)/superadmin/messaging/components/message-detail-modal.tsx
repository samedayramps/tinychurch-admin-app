'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDate } from "@/lib/utils/format"
import type { MessageQueryResponse } from "@/lib/dal/repositories/message"
import { useState } from "react"
import { toast } from "@/components/hooks/use-toast"
import { cancelScheduledMessage } from "@/lib/actions/messaging"

interface MessageDetailModalProps {
  message: MessageQueryResponse | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onMessageUpdate?: () => void
}

export function MessageDetailModal({
  message,
  open,
  onOpenChange,
  onMessageUpdate
}: MessageDetailModalProps) {
  const [canceling, setCanceling] = useState(false)

  if (!message) return null

  const handleCancelMessage = async () => {
    try {
      setCanceling(true)
      await cancelScheduledMessage(message.id)
      toast({
        title: "Message Cancelled",
        description: "The scheduled message has been cancelled.",
      })
      onMessageUpdate?.()
      onOpenChange(false)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel the message",
        variant: "destructive",
      })
    } finally {
      setCanceling(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{message.subject}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Message Details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Status:</span>{' '}
              <Badge variant={
                message.status === 'sent' ? 'success' : 
                message.status === 'failed' ? 'destructive' : 
                message.status === 'scheduled' ? 'warning' :
                'secondary'
              }>
                {message.status.charAt(0).toUpperCase() + message.status.slice(1)}
              </Badge>
            </div>
            <div>
              <span className="font-medium">Date:</span>{' '}
              {formatDate(message.created_at)}
            </div>
            {message.scheduled_for && (
              <div>
                <span className="font-medium">Scheduled For:</span>{' '}
                {formatDate(message.scheduled_for, 'full')}
              </div>
            )}
            <div>
              <span className="font-medium">From:</span>{' '}
              {message.sender.full_name || message.sender.email}
            </div>
            <div>
              <span className="font-medium">To:</span>{' '}
              {message.recipient?.email || message.group?.name || message.organization?.name}
            </div>
          </div>

          {/* Message Body */}
          <div className="space-y-2">
            <h4 className="font-medium">Message</h4>
            <ScrollArea className="h-[300px] w-full rounded-md border p-4">
              <div className="whitespace-pre-wrap">{message.body}</div>
            </ScrollArea>
          </div>

          {/* Additional Metadata */}
          <div className="text-sm text-muted-foreground">
            <div><span className="font-medium">Message ID:</span> {message.id}</div>
            {message.error && (
              <div className="text-destructive">
                <span className="font-medium">Error:</span> {message.error}
              </div>
            )}
          </div>
        </div>

        {message.status === 'scheduled' && (
          <DialogFooter>
            <Button
              variant="destructive"
              onClick={handleCancelMessage}
              disabled={canceling}
            >
              {canceling ? 'Cancelling...' : 'Cancel Scheduled Message'}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  )
} 