'use client'

import { Input } from '@/components/ui/input'
import { MessageEditor } from '@/components/message-editor'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { CalendarIcon, Clock } from 'lucide-react'
import { format, isSameDay } from 'date-fns'
import { TimePicker } from '@/components/ui/time-picker'
import type { Database } from '@/database.types'
import { formatTime } from "@/lib/utils/format"
import { useEffect } from 'react'
import { schemas } from '@/lib/validations/schemas'
import { toast } from '@/components/hooks/use-toast'
import * as z from 'zod'

type Template = Database['public']['Tables']['message_templates']['Row']

interface MessageFormProps {
  subject: string
  body: string
  scheduledAt?: Date
  defaultSendTime?: string
  onSubjectChange: (subject: string) => void
  onBodyChange: (body: string) => void
  onScheduleChange: (date?: Date) => void
}

export function MessageForm({
  subject,
  body,
  scheduledAt,
  defaultSendTime,
  onSubjectChange,
  onBodyChange,
  onScheduleChange,
}: MessageFormProps) {
  const handleTimeChange = (timeString: string) => {
    if (!scheduledAt) return
    
    const [hours, minutes] = timeString.split(':').map(Number)
    const newDate = new Date(scheduledAt)
    newDate.setHours(hours, minutes)

    // Validate the new date
    try {
      schemas.messageForm.shape.scheduledAt.parse(newDate.toISOString())
      onScheduleChange(newDate)
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Invalid Time",
          description: "Scheduled time must be in the future",
          variant: "destructive"
        })
      }
    }
  }

  const handleDateSelect = (date?: Date) => {
    if (date && defaultSendTime) {
      const [hours, minutes] = defaultSendTime.split(':').map(Number)
      const newDate = new Date(date)
      newDate.setHours(hours, minutes)

      // Validate the new date
      try {
        schemas.messageForm.shape.scheduledAt.parse(newDate.toISOString())
        onScheduleChange(newDate)
      } catch (error) {
        if (error instanceof z.ZodError) {
          toast({
            title: "Invalid Date",
            description: "Scheduled date must be in the future",
            variant: "destructive"
          })
        }
      }
    } else {
      onScheduleChange(date)
    }
  }

  // Add a function to disable past dates
  const disablePastDates = (date: Date) => {
    const now = new Date()
    now.setHours(0, 0, 0, 0) // Reset time to start of day for date comparison
    return date < now
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Subject</label>
        <Input 
          value={subject}
          onChange={(e) => onSubjectChange(e.target.value)}
          placeholder="Enter message subject"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Message</label>
        <MessageEditor
          content={body}
          onChange={onBodyChange}
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Schedule (Optional)</label>
        <div className="flex gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-[180px]">
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledAt ? format(scheduledAt, 'PP') : 'Pick date'}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduledAt}
                onSelect={handleDateSelect}
                disabled={disablePastDates}
                initialFocus
                fromDate={new Date()} // Only allow dates from today
              />
            </PopoverContent>
          </Popover>

          {scheduledAt && (
            <div className="space-y-1">
              <TimePicker
                value={scheduledAt ? format(scheduledAt, 'HH:mm') : undefined}
                onChange={handleTimeChange}
                minTime={isSameDay(scheduledAt, new Date()) ? format(new Date(), 'HH:mm') : undefined}
              />
              {defaultSendTime && format(scheduledAt, 'HH:mm') === defaultSendTime && (
                <p className="text-xs text-muted-foreground">
                  Using default send time ({formatTime(defaultSendTime)})
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
} 