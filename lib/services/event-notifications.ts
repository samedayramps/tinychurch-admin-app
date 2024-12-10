import { createClient } from '@/lib/utils/supabase/server'
import { Resend } from 'resend'
import { createGoogleCalendarEvent } from '@/lib/utils/google-calendar'
import type { CalendarEvent } from '@/components/superadmin/events/shared-types'
import { EventEmailTemplate } from '@/components/emails/event-invitation'
import type { Database } from '@/database.types'

const resend = new Resend(process.env.RESEND_API_KEY)

export class EventNotificationService {
  private supabase

  private constructor(supabase: any) {
    this.supabase = supabase
  }

  static async create() {
    const supabase = await createClient()
    return new EventNotificationService(supabase)
  }

  private async checkRateLimit(organizationId: string): Promise<boolean> {
    const { count } = await this.supabase
      .from('email_logs')
      .select('id', { count: 'exact' })
      .eq('organization_id', organizationId)
      .gte('created_at', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())

    const { data: limits } = await this.supabase
      .from('organizations')
      .select('settings->limits->daily_email_limit')
      .eq('id', organizationId)
      .single()

    return count < (limits?.daily_email_limit || 1000)
  }

  private async logEmailSent(data: {
    organization_id: string
    event_id: string
    recipient_email: string
    status: 'sent' | 'failed'
    error?: string
  }) {
    await this.supabase
      .from('email_logs')
      .insert({
        ...data,
        created_at: new Date().toISOString()
      })
  }

  private async validateSchedulingTime(event: CalendarEvent) {
    const eventDateTime = new Date(`${event.start_date}T${event.start_time}`)
    const now = new Date()
    const maxScheduleTime = new Date(now.getTime() + (72 * 60 * 60 * 1000)) // 72 hours from now

    if (eventDateTime > maxScheduleTime) {
      throw new Error('Events can only be scheduled up to 72 hours in advance due to email provider limitations')
    }
  }

  async sendEventNotifications(event: CalendarEvent) {
    if (!event.organization_id) {
      throw new Error('Event must have an organization_id')
    }

    await this.validateSchedulingTime(event)

    const recipients = await this.getEventRecipients(event)
    const googleCalendarEvent = await createGoogleCalendarEvent(event)

    for (const recipient of recipients) {
      try {
        await this.sendEventEmail(
          recipient.email,
          event,
          recipient.full_name || recipient.email,
          googleCalendarEvent.htmlLink
        )
        
        await this.logEmailSent({
          organization_id: event.organization_id,
          event_id: event.id,
          recipient_email: recipient.email,
          status: 'sent'
        })
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        
        await this.logEmailSent({
          organization_id: event.organization_id,
          event_id: event.id,
          recipient_email: recipient.email,
          status: 'failed',
          error: errorMessage
        })
        throw error
      }
    }
  }

  private async getEventRecipients(event: CalendarEvent) {
    let recipients: { email: string; full_name: string | null }[] = []

    if (event.participant_type === 'all') {
      const { data } = await this.supabase
        .from('organization_members')
        .select(`
          profiles (
            email,
            full_name
          )
        `)
        .eq('organization_id', event.organization_id)
        .is('deleted_at', null)

      recipients = data?.map((d: { profiles: { email: string; full_name: string | null } }) => d.profiles) || []
    } else if (event.participant_type === 'groups' && event.participant_groups) {
      const { data } = await this.supabase
        .from('group_members')
        .select(`
          profiles (
            email,
            full_name
          )
        `)
        .in('group_id', event.participant_groups)
        .is('deleted_at', null)

      recipients = data?.map((d: { profiles: { email: string; full_name: string | null } }) => d.profiles) || []
    } else if (event.participant_type === 'individuals' && event.participant_users) {
      const { data } = await this.supabase
        .from('profiles')
        .select('email, full_name')
        .in('id', event.participant_users)

      recipients = data || []
    }

    return recipients
  }

  private async sendEventEmail(
    to: string,
    event: CalendarEvent,
    recipientName: string,
    calendarLink: string | null | undefined
  ) {
    if (!event.organization_id) {
      throw new Error('Event must have an organization_id')
    }

    if (!calendarLink) {
      console.warn('No calendar link available for event:', event.id)
    }

    const { data: org } = await this.supabase
      .from('organizations')
      .select('name, settings')
      .eq('id', event.organization_id)
      .single()

    const eventDateTime = new Date(`${event.start_date}T${event.start_time}`)
    const now = new Date()
    
    const shouldSchedule = eventDateTime > now
    const emailOptions: any = {
      from: `${org.name} <noreply@tinychurch.app>`,
      to,
      subject: `Event Invitation: ${event.title}`,
      react: EventEmailTemplate({
        event,
        recipientName,
        calendarLink: calendarLink || '#',
        organizationBranding: org.settings?.branding || {},
        organizationName: org.name
      })
    }

    if (shouldSchedule) {
      const scheduledTime = new Date(Math.min(
        eventDateTime.getTime() - (24 * 60 * 60 * 1000), // 24 hours before event
        now.getTime() + (10 * 60 * 1000) // or 10 minutes from now if event is soon
      ))
      emailOptions.scheduledAt = scheduledTime.toISOString()
    }

    const { data, error } = await resend.emails.send(emailOptions)

    if (error) {
      console.error('Failed to send email:', error)
      throw error
    }

    return data
  }

  private async getOrganizationEmailSettings(organizationId: string) {
    const { data } = await this.supabase
      .from('organizations')
      .select('settings->email_settings')
      .eq('id', organizationId)
      .single()

    return {
      fromName: data?.email_settings?.from_name || 'TinyChurch',
      replyTo: data?.email_settings?.reply_to,
      footer: data?.email_settings?.email_footer,
      // Add other org-specific settings
    }
  }
} 