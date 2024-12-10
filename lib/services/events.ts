import { createClient } from '@/lib/utils/supabase/server'
import type { Database } from '@/database.types'
import { addDays, addWeeks, addMonths, addYears, isBefore } from 'date-fns'

type CalendarEvent = Database['public']['Tables']['calendar_events']['Row']
type CalendarEventInput = Omit<
  Database['public']['Tables']['calendar_events']['Insert'],
  'id' | 'created_at' | 'updated_at'
>

export class EventsService {
  private supabase

  private constructor(supabase: any) {
    this.supabase = supabase
  }

  static async create() {
    const supabase = await createClient()
    return new EventsService(supabase)
  }

  async createEvent(data: CalendarEventInput) {
    const { error } = await this.supabase
      .from('calendar_events')
      .insert({
        ...data,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (error) throw error
  }

  async updateEvent(id: string, data: Partial<CalendarEventInput>) {
    const { error } = await this.supabase
      .from('calendar_events')
      .update({
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (error) throw error
  }

  async getEvents(options: {
    organizationId?: string
    startDate?: Date
    endDate?: Date
    includeRecurring?: boolean
  } = {}) {
    let query = this.supabase
      .from('calendar_events')
      .select(`
        *,
        organizations (name),
        profiles (email, full_name)
      `)

    if (options.organizationId) {
      query = query.eq('organization_id', options.organizationId)
    }

    if (options.startDate) {
      query = query.gte('start_date', options.startDate.toISOString().split('T')[0])
    }

    if (options.endDate) {
      query = query.lte('start_date', options.endDate.toISOString().split('T')[0])
    }

    const { data, error } = await query

    if (error) throw error

    if (options.includeRecurring && data) {
      return this.expandRecurringEvents(data, options.startDate, options.endDate)
    }

    return data
  }

  private expandRecurringEvents(
    events: CalendarEvent[],
    startDate?: Date,
    endDate?: Date
  ) {
    const expandedEvents: CalendarEvent[] = []

    events.forEach(event => {
      if (event.frequency === 'once') {
        expandedEvents.push(event)
        return
      }

      const start = new Date(event.start_date)
      const until = event.recurring_until ? new Date(event.recurring_until) : 
                    endDate || addYears(start, 1)

      let current = start
      while (isBefore(current, until)) {
        // Skip if before requested start date
        if (startDate && isBefore(current, startDate)) {
          current = this.getNextDate(current, event.frequency)
          continue
        }

        // For weekly events, check if day is in recurring_days
        if (
          event.frequency === 'weekly' && 
          event.recurring_days && 
          !event.recurring_days.includes(current.getDay())
        ) {
          current = addDays(current, 1)
          continue
        }

        expandedEvents.push({
          ...event,
          start_date: current.toISOString().split('T')[0],
          end_date: event.end_date ? 
            addDays(current, 
              (new Date(event.end_date).getTime() - start.getTime()) / (1000 * 60 * 60 * 24)
            ).toISOString().split('T')[0] : 
            null
        })

        current = this.getNextDate(current, event.frequency)
      }
    })

    return expandedEvents.sort((a, b) => 
      new Date(a.start_date).getTime() - new Date(b.start_date).getTime()
    )
  }

  private getNextDate(date: Date, frequency: string): Date {
    switch (frequency) {
      case 'daily':
        return addDays(date, 1)
      case 'weekly':
        return addWeeks(date, 1)
      case 'monthly':
        return addMonths(date, 1)
      case 'yearly':
        return addYears(date, 1)
      default:
        return date
    }
  }

  async deleteEvent(id: string) {
    const { error } = await this.supabase
      .from('calendar_events')
      .delete()
      .eq('id', id)

    if (error) throw error
  }
} 