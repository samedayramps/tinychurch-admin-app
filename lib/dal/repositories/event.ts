import { BaseRepository } from '../base/repository'
import type { Event, EventAttendee } from './types'
import type { Database } from '@/database.types'

export class EventRepository extends BaseRepository<Event> {
  protected tableName = 'events' as const
  protected organizationField = 'organization_id'

  // Find upcoming events
  async findUpcoming(options: {
    startDate?: Date
    endDate?: Date
    visibility?: 'public' | 'members_only' | 'staff_only' | 'private'
  } = {}): Promise<Event[]> {
    let query = this.baseQuery() as any

    if (options.startDate) {
      query = query.gte('start_date', options.startDate.toISOString())
    }

    if (options.endDate) {
      query = query.lte('end_date', options.endDate.toISOString())
    }

    if (options.visibility) {
      query = query.eq('visibility_level', options.visibility)
    }

    const { data } = await query
      .select(`
        *,
        organizer:organizer_id (
          id,
          email,
          full_name
        ),
        location:location_id (*)
      `)
      .order('start_date', { ascending: true })

    return (data || []) as Event[]
  }

  // Find event by ID with full details
  async findById(id: string): Promise<Event | null> {
    const { data } = await (this.baseQuery() as any)
      .eq('id', id)
      .select(`
        *,
        organizer:organizer_id (
          id,
          email,
          full_name
        ),
        location:location_id (*),
        attendees:event_attendees (
          user_id,
          status,
          profiles (
            id,
            email,
            full_name,
            avatar_url
          )
        )
      `)
      .single()

    return data
  }

  // Update event status
  async updateStatus(id: string, status: Event['status']): Promise<void> {
    await this.update(id, { status })
  }

  // Add attendee to event
  async addAttendee(
    eventId: string, 
    userId: string, 
    status: EventAttendee['status'] = 'pending'
  ): Promise<void> {
    await (this.baseQuery() as any)
      .from('event_attendees')
      .insert({
        event_id: eventId,
        user_id: userId,
        status,
        created_at: new Date().toISOString()
      })
  }

  // Update attendee status
  async updateAttendeeStatus(
    eventId: string, 
    userId: string, 
    status: EventAttendee['status']
  ): Promise<void> {
    await (this.baseQuery() as any)
      .from('event_attendees')
      .update({ 
        status,
        updated_at: new Date().toISOString()
      })
      .eq('event_id', eventId)
      .eq('user_id', userId)
  }
} 