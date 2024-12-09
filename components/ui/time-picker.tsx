'use client'

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"
import { formatTime } from "@/lib/utils/format"

interface TimePickerProps {
  value?: string
  onChange: (time: string) => void
  minTime?: string
}

export function TimePicker({ value, onChange, minTime }: TimePickerProps) {
  // Generate hours (00-23)
  const hours = Array.from({ length: 24 }, (_, i) => 
    i.toString().padStart(2, '0')
  )
  
  // Generate minutes (00, 15, 30, 45)
  const minutes = ['00', '15', '30', '45']

  const [hour, minute] = value?.split(':') || ['09', '00']
  const [minHour, minMinute] = minTime?.split(':') || ['00', '00']

  // Function to check if a time is disabled
  const isTimeDisabled = (h: string, m: string) => {
    if (!minTime) return false
    return h < minHour || (h === minHour && m < minMinute)
  }

  return (
    <div className="flex gap-2">
      <Select
        value={hour}
        onValueChange={(newHour) => {
          // If the new hour is valid, update the time
          if (!isTimeDisabled(newHour, minute)) {
            onChange(`${newHour}:${minute}`)
          }
        }}
      >
        <SelectTrigger className="w-[120px]">
          <SelectValue placeholder="Hour" />
        </SelectTrigger>
        <SelectContent>
          {hours.map((h) => {
            const disabled = isTimeDisabled(h, '00')
            return (
              <SelectItem 
                key={h} 
                value={h}
                disabled={disabled}
                className={disabled ? 'text-muted-foreground' : ''}
              >
                {formatTime(`${h}:00`).split(':')[0]} {formatTime(`${h}:00`).split(' ')[1]}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>

      <Select
        value={minute}
        onValueChange={(newMinute) => {
          // If the new minute is valid, update the time
          if (!isTimeDisabled(hour, newMinute)) {
            onChange(`${hour}:${newMinute}`)
          }
        }}
      >
        <SelectTrigger className="w-[100px]">
          <SelectValue placeholder="Minute" />
        </SelectTrigger>
        <SelectContent>
          {minutes.map((m) => {
            const disabled = isTimeDisabled(hour, m)
            return (
              <SelectItem 
                key={m} 
                value={m}
                disabled={disabled}
                className={disabled ? 'text-muted-foreground' : ''}
              >
                :{m}
              </SelectItem>
            )
          })}
        </SelectContent>
      </Select>
    </div>
  )
} 