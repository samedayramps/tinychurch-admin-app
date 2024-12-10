'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { EventNotificationService } from '@/lib/services/event-notifications'
import type { EventFormData } from '@/components/superadmin/events/types'

export async function createEvent(data: EventFormData) {
  const supabase = await createClient()

  try {
    const { data: event, error } = await supabase
      .from('calendar_events')
      .insert([{
        title: data.title,
        description: data.description,
        organization_id: data.organization_id,
        location: data.location,
        use_different_address: data.use_different_address,
        start_date: data.start_date.toISOString().split('T')[0],
        end_date: data.end_date?.toISOString().split('T')[0] || null,
        start_time: data.start_time,
        end_time: data.end_time,
        frequency: data.frequency,
        recurring_days: data.recurring_days,
        recurring_until: data.recurring_until?.toISOString().split('T')[0] || null,
        timezone: data.timezone,
        participant_type: data.participant_type,
        participant_groups: data.participant_groups,
        participant_users: data.participant_users,
        status: data.status || 'scheduled',
        metadata: {
          is_public: data.is_public,
          show_on_website: data.show_on_website,
          requires_registration: data.requires_registration,
          max_participants: data.max_participants
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }])
      .select()
      .single()

    if (error) throw error

    // Send notifications
    const notificationService = await EventNotificationService.create()
    await notificationService.sendEventNotifications(event)

    revalidatePath('/superadmin/events')
    return { success: true }
  } catch (error) {
    console.error('Failed to create event:', error)
    return { error: 'Failed to create event' }
  }
}

export async function updateEvent(id: string, data: EventFormData) {
  const supabase = await createClient()

  try {
    const { data: event, error } = await supabase
      .from('calendar_events')
      .update({
        title: data.title,
        description: data.description,
        organization_id: data.organization_id,
        location: data.location,
        use_different_address: data.use_different_address,
        start_date: data.start_date.toISOString().split('T')[0],
        end_date: data.end_date?.toISOString().split('T')[0] || null,
        start_time: data.start_time,
        end_time: data.end_time,
        frequency: data.frequency,
        recurring_days: data.recurring_days,
        recurring_until: data.recurring_until?.toISOString().split('T')[0] || null,
        timezone: data.timezone,
        participant_type: data.participant_type,
        participant_groups: data.participant_groups,
        participant_users: data.participant_users,
        status: data.status || 'scheduled',
        metadata: {
          is_public: data.is_public,
          show_on_website: data.show_on_website,
          requires_registration: data.requires_registration,
          max_participants: data.max_participants
        },
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    // Send notifications for updates
    const notificationService = await EventNotificationService.create()
    await notificationService.sendEventNotifications(event)

    revalidatePath('/superadmin/events')
    return { success: true }
  } catch (error) {
    console.error('Failed to update event:', error)
    return { error: 'Failed to update event' }
  }
} 