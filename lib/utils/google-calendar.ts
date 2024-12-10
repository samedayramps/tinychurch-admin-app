import { google } from 'googleapis'
import type { CalendarEvent } from '@/components/superadmin/events/shared-types'
import { formatLocation } from '@/lib/utils/format-location'
import { isLocationJson } from '@/components/superadmin/events/shared-types'
import { LocationJson } from '@/components/superadmin/events/shared-types'
import { OAuth2Client } from 'google-auth-library'

const getAuth = async (): Promise<OAuth2Client> => {
  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/calendar'],
    projectId: process.env.GOOGLE_PROJECT_ID,
    clientOptions: {
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }
  });
  return auth.getClient() as Promise<OAuth2Client>;
};

export async function createGoogleCalendarEvent(event: CalendarEvent) {
  const authClient = await getAuth();
  
  const calendar = google.calendar({ 
    version: 'v3',
    auth: authClient 
  });

  const calendarEvent = {
    summary: event.title,
    description: event.description,
    start: {
      dateTime: `${event.start_date}T${event.start_time}`,
      timeZone: event.timezone,
    },
    end: {
      dateTime: `${event.end_date || event.start_date}T${event.end_time}`,
      timeZone: event.timezone,
    },
    location: event.location && isLocationJson(event.location) 
      ? formatLocation(event.location as LocationJson) 
      : undefined,
    recurrence: getRecurrenceRule(event),
  }

  const { data } = await calendar.events.insert({
    calendarId: 'primary',
    requestBody: calendarEvent,
  })

  return data
}

function getRecurrenceRule(event: CalendarEvent) {
  if (event.frequency === 'once') return undefined

  let rrule = `RRULE:FREQ=${event.frequency.toUpperCase()}`

  if (event.recurring_until) {
    rrule += `;UNTIL=${event.recurring_until.replace(/-/g, '')}`
  }

  if (event.frequency === 'weekly' && event.recurring_days?.length) {
    const days = event.recurring_days
      .map(d => ['SU','MO','TU','WE','TH','FR','SA'][d])
      .join(',')
    rrule += `;BYDAY=${days}`
  }

  return [rrule]
} 