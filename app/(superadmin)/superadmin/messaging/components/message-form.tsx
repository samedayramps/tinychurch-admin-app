'use client'

import { useState } from 'react'
import { format, addHours, isBefore, addMinutes } from 'date-fns'
import { CalendarIcon, Clock } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { TimePicker } from '@/components/ui/time-picker'
import { MessageEditor } from '@/components/message-editor'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'
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
  onSubjectChange: (value: string) => void
  onBodyChange: (value: string) => void
  onScheduleChange: (value: Date | undefined) => void
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
  const [isTimePickerOpen, setIsTimePickerOpen] = useState(false)
  
  // Calculate the maximum allowed scheduling date (72 hours from now)
  const maxScheduleDate = addHours(new Date(), 72)
  
  // Disable dates that are more than 72 hours away or in the past
  const disableDate = (date: Date) => {
    const now = new Date()
    return isBefore(date, now) || isBefore(maxScheduleDate, date)
  }

  // Handle date selection
  const handleDateSelect = (date: Date | undefined) => {
    if (!date) {
      onScheduleChange(undefined)
      return
    }

    // If we already have a scheduled time, preserve it
    if (scheduledAt) {
      const newDate = new Date(date)
      newDate.setHours(scheduledAt.getHours())
      newDate.setMinutes(scheduledAt.getMinutes())
      onScheduleChange(newDate)
    } else {
      // Default to current time if no time was previously selected
      const now = new Date()
      date.setHours(now.getHours())
      date.setMinutes(now.getMinutes())
      onScheduleChange(date)
    }
  }

  // Handle time selection
  const handleTimeChange = (timeString: string) => {
    if (!scheduledAt) return

    const [hours, minutes] = timeString.split(':').map(Number)
    const newDate = new Date(scheduledAt)
    newDate.setHours(hours)
    newDate.setMinutes(minutes)

    // Ensure the selected time is not in the past
    const now = new Date()
    if (isBefore(newDate, now)) {
      newDate.setDate(newDate.getDate() + 1)
    }

    onScheduleChange(newDate)
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
        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn(
                "justify-start text-left font-normal w-[240px]",
                !scheduledAt && "text-muted-foreground"
              )}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {scheduledAt ? format(scheduledAt, 'PPP') : "Schedule for later"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={scheduledAt}
                onSelect={handleDateSelect}
                disabled={disableDate}
                initialFocus
              />
              <div className="p-3 border-t">
                <small className="text-muted-foreground">
                  Messages can only be scheduled up to 72 hours in advance
                </small>
              </div>
            </PopoverContent>
          </Popover>

          {scheduledAt && (
            <Popover open={isTimePickerOpen} onOpenChange={setIsTimePickerOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-[120px]">
                  <Clock className="mr-2 h-4 w-4" />
                  {format(scheduledAt, 'HH:mm')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <div className="p-3">
                  <TimePicker
                    value={format(scheduledAt, 'HH:mm')}
                    onChange={handleTimeChange}
                    minTime={isBefore(scheduledAt, new Date()) ? format(addMinutes(new Date(), 5), 'HH:mm') : undefined}
                  />
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>

        {scheduledAt && (
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onScheduleChange(undefined)}
            >
              Clear schedule
            </Button>
            <p className="text-sm text-muted-foreground">
              Will be sent {format(scheduledAt, 'PPPp')}
            </p>
          </div>
        )}
      </div>
    </div>
  )
} 