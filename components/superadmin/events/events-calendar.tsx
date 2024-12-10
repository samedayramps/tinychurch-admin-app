'use client'

import { useState } from 'react'
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { enUS } from 'date-fns/locale'
import { EventDetailsDialog } from './event-details-dialog'
import { CalendarEvent } from './shared-types'
import { cn } from "@/lib/utils"
import 'react-big-calendar/lib/css/react-big-calendar.css'

interface EventsCalendarProps {
  events: CalendarEvent[]
  organizations: { id: string; name: string }[]
}

const locales = {
  'en-US': enUS,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
})

export function EventsCalendar({ events, organizations }: EventsCalendarProps) {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const calendarEvents = events.map(event => ({
    ...event,
    start: new Date(`${event.start_date}T${event.start_time}`),
    end: new Date(`${event.end_date || event.start_date}T${event.end_time}`),
    title: event.title,
    className: cn(
      "rounded-md px-2 py-1",
      event.frequency !== 'once' ? 'recurring-event' : undefined,
      event.status === 'cancelled' ? 'cancelled-event' : undefined
    ),
  }))

  return (
    <>
      <Calendar
        localizer={localizer}
        events={calendarEvents}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 700 }}
        onSelectEvent={(event) => setSelectedEvent(event as CalendarEvent)}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        defaultView={Views.MONTH}
        popup
        selectable
        className="bg-background shadow-sm"
      />

      <EventDetailsDialog
        event={selectedEvent}
        organizations={organizations}
        onClose={() => setSelectedEvent(null)}
      />

      <style jsx global>{`
        .rbc-calendar {
          @apply bg-background text-foreground font-sans;
        }

        .rbc-toolbar {
          @apply mb-4 gap-2;
        }

        .rbc-toolbar button {
          @apply h-9 rounded-md px-3 text-sm font-medium ring-offset-background transition-colors 
          focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2
          disabled:pointer-events-none disabled:opacity-50
          bg-secondary text-secondary-foreground hover:bg-secondary/80;
        }

        .rbc-toolbar button.rbc-active {
          @apply bg-primary text-primary-foreground hover:bg-primary/90;
        }

        .rbc-toolbar-label {
          @apply font-semibold;
        }

        .rbc-header {
          @apply py-2 font-medium border-b border-border;
        }

        .rbc-event {
          @apply bg-primary/90 text-primary-foreground border-none rounded-md px-2 py-1
          shadow-sm transition-colors hover:bg-primary;
        }

        .rbc-event.recurring-event {
          @apply bg-primary/70 border-2 border-primary;
        }

        .rbc-event.cancelled-event {
          @apply bg-muted text-muted-foreground line-through;
        }

        .rbc-event-content {
          @apply text-sm font-medium;
        }

        .rbc-today {
          @apply bg-accent/50;
        }

        .rbc-off-range-bg {
          @apply bg-muted/30;
        }

        .rbc-month-view,
        .rbc-time-view,
        .rbc-agenda-view {
          @apply border-none overflow-hidden;
        }

        .rbc-month-row {
          @apply border-b border-border last:border-0;
        }

        .rbc-date-cell {
          @apply text-sm p-1;
        }

        .rbc-date-cell.rbc-now {
          @apply font-semibold text-primary;
        }

        .rbc-time-header-content {
          @apply border-l border-border;
        }

        .rbc-time-content {
          @apply border-l border-border;
        }

        .rbc-time-slot {
          @apply text-sm;
        }

        .rbc-day-slot .rbc-time-slot {
          @apply border-border/50;
        }

        .rbc-timeslot-group {
          @apply border-b border-border;
        }

        .rbc-time-gutter.rbc-time-column {
          @apply bg-muted/30;
        }

        .rbc-agenda-view table.rbc-agenda-table {
          @apply border-none;
        }

        .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
          @apply border-b border-border p-3 last:border-0;
        }

        .rbc-agenda-view table.rbc-agenda-table .rbc-agenda-time-cell {
          @apply text-muted-foreground;
        }

        .rbc-agenda-view table.rbc-agenda-table thead > tr > th {
          @apply border-b border-border bg-muted/50 p-3 font-medium;
        }

        .rbc-show-more {
          @apply text-xs text-primary hover:text-primary/90 hover:underline;
        }

        .rbc-overlay {
          @apply bg-background border border-border rounded-md shadow-lg p-2;
        }

        .rbc-month-view .rbc-month-row + .rbc-month-row {
          @apply border-t border-border;
        }

        .rbc-month-view .rbc-day-bg + .rbc-day-bg {
          @apply border-l border-border;
        }
      `}</style>
    </>
  )
} 