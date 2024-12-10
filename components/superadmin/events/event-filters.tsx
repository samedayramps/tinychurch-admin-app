'use client'

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import { ChangeEvent } from "react"
import { DateRange } from "react-day-picker"

interface EventFiltersProps {
  onSearch?: (query: string) => void
  onStatusChange?: (status: string) => void
  onDateRangeChange?: (range: DateRange | undefined) => void
}

export function EventFilters({
  onSearch,
  onStatusChange,
  onDateRangeChange
}: EventFiltersProps) {
  return (
    <div className="flex items-center gap-4 mb-4">
      <Input
        placeholder="Search events..."
        className="max-w-xs"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          onSearch?.(e.target.value)
        }}
      />
      
      <Select onValueChange={onStatusChange}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Events</SelectItem>
          <SelectItem value="scheduled">Scheduled</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="cancelled">Cancelled</SelectItem>
        </SelectContent>
      </Select>

      <DateRangePicker
        placeholder="Select date range"
        onChange={onDateRangeChange}
      />
    </div>
  )
} 