import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Link,
  Preview,
  Section,
  Text,
} from '@react-email/components'
import { format } from 'date-fns'
import type { CalendarEvent, LocationJson } from '@/components/superadmin/events/shared-types'
import { formatLocation } from '@/lib/utils/format-location'
import { isLocationJson } from '@/components/superadmin/events/shared-types'

interface EventEmailTemplateProps {
  event: CalendarEvent
  recipientName: string
  calendarLink: string
  organizationBranding: {
    logo_url?: string
    primary_color?: string
  }
  organizationName: string
}

export function EventEmailTemplate({
  event,
  recipientName,
  calendarLink,
  organizationBranding,
  organizationName
}: EventEmailTemplateProps) {
  return (
    <Html>
      <Head />
      <Preview>{organizationName}: You're invited to {event.title}</Preview>
      <Body style={{
        ...main,
        backgroundColor: organizationBranding.primary_color || '#ffffff'
      }}>
        <Container>
          {organizationBranding.logo_url && (
            <img src={organizationBranding.logo_url} alt={organizationName} />
          )}
          <Heading>Event Invitation</Heading>
          <Text>Hi {recipientName},</Text>
          <Text>You're invited to attend {event.title}!</Text>

          <Section>
            <Text style={label}>When:</Text>
            <Text>
              {format(new Date(`${event.start_date}T${event.start_time}`), 'PPpp')}
              {event.end_date && ` - ${format(new Date(`${event.end_date}T${event.end_time}`), 'PPpp')}`}
            </Text>

            {event.location && isLocationJson(event.location) && (
              <>
                <Text style={label}>Where:</Text>
                <Text>{formatLocation(event.location as LocationJson)}</Text>
              </>
            )}

            {event.description && (
              <>
                <Text style={label}>Description:</Text>
                <Text>{event.description}</Text>
              </>
            )}
          </Section>

          <Section>
            <Button href={calendarLink}>
              Add to Google Calendar
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#ffffff',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,Oxygen-Sans,Ubuntu,Cantarell,"Helvetica Neue",sans-serif',
}

const label = {
  fontWeight: 'bold',
  marginBottom: '4px',
} 