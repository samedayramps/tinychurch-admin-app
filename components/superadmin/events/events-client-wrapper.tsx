'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { EventsCalendar } from './events-calendar'
import { EventsList } from './events-list'
import { EventFilters } from './event-filters'
import { DateRange } from "react-day-picker"
import type { CalendarEvent } from './shared-types'

interface EventsClientWrapperProps {
  events: CalendarEvent[]
  organizations: { id: string; name: string }[]
}

export function EventsClientWrapper({ events: initialEvents, organizations }: EventsClientWrapperProps) {
  const [filteredEvents, setFilteredEvents] = useState<CalendarEvent[]>(initialEvents)
  const searchParams = useSearchParams()
  const view = searchParams.get('view') || 'list'

  useEffect(() => {
    setFilteredEvents(initialEvents)
  }, [initialEvents])

  const handleSearch = (query: string) => {
    if (!query) {
      setFilteredEvents(initialEvents)
      return
    }

    const filtered = initialEvents.filter(event => 
      event.title.toLowerCase().includes(query.toLowerCase()) ||
      event.description?.toLowerCase().includes(query.toLowerCase())
    )
    setFilteredEvents(filtered)
  }

  const handleStatusChange = (status: string) => {
    if (status === 'all') {
      setFilteredEvents(initialEvents)
      return
    }

    const filtered = initialEvents.filter(event => event.status === status)
    setFilteredEvents(filtered)
  }

  const handleDateRangeChange = (range: DateRange | undefined) => {
    if (!range?.from) {
      setFilteredEvents(initialEvents)
      return
    }

    const from = range.from
    const to = range.to || from

    const filtered = initialEvents.filter(event => {
      const eventDate = new Date(event.start_date)
      return eventDate >= from && eventDate <= to
    })
    setFilteredEvents(filtered)
  }

  return (
    <>
      <EventFilters 
        onSearch={handleSearch}
        onStatusChange={handleStatusChange}
        onDateRangeChange={handleDateRangeChange}
      />

      <div className="mt-4">
        {view === 'calendar' ? (
          <EventsCalendar 
            events={filteredEvents} 
            organizations={organizations}
          />
        ) : (
          <EventsList 
            events={filteredEvents}
            organizations={organizations}
          />
        )}
      </div>
    </>
  )
} 