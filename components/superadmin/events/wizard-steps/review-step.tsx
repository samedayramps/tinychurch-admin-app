'use client'

import { useWizard } from '../wizard-context'
import { format } from 'date-fns'
import { Badge } from '@/components/ui/badge'

interface ReviewStepProps {
  organizations: { id: string; name: string }[]
}

export function ReviewStep({ organizations }: ReviewStepProps) {
  const { form: { getValues } } = useWizard()
  const data = getValues()
  const organization = organizations.find(org => org.id === data.organization_id)

  const formatAddress = (location: typeof data.location) => {
    const { address, specific_location } = location
    const parts = [
      address.street,
      address.city,
      address.state,
      address.postal_code,
      address.country
    ].filter(Boolean)
    
    return [parts.join(', '), specific_location].filter(Boolean).join(' - ')
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Event Details</h3>
        <dl className="mt-2 divide-y divide-border">
          <div className="py-3 grid grid-cols-3">
            <dt className="font-medium">Title</dt>
            <dd className="col-span-2">{data.title}</dd>
          </div>
          {data.description && (
            <div className="py-3 grid grid-cols-3">
              <dt className="font-medium">Description</dt>
              <dd className="col-span-2 whitespace-pre-wrap">{data.description}</dd>
            </div>
          )}
          {data.location && (
            <div className="py-3 grid grid-cols-3">
              <dt className="font-medium">Location</dt>
              <dd className="col-span-2">{formatAddress(data.location)}</dd>
            </div>
          )}
          <div className="py-3 grid grid-cols-3">
            <dt className="font-medium">Organization</dt>
            <dd className="col-span-2">{organization?.name}</dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="text-lg font-medium">Schedule</h3>
        <dl className="mt-2 divide-y divide-border">
          <div className="py-3 grid grid-cols-3">
            <dt className="font-medium">Date</dt>
            <dd className="col-span-2">
              {format(data.start_date, 'PPP')}
              {data.end_date && data.end_date !== data.start_date && (
                <> - {format(data.end_date, 'PPP')}</>
              )}
            </dd>
          </div>
          <div className="py-3 grid grid-cols-3">
            <dt className="font-medium">Time</dt>
            <dd className="col-span-2">
              {format(new Date(`2000-01-01T${data.start_time}`), 'h:mm a')} - 
              {format(new Date(`2000-01-01T${data.end_time}`), 'h:mm a')}
            </dd>
          </div>
          <div className="py-3 grid grid-cols-3">
            <dt className="font-medium">Frequency</dt>
            <dd className="col-span-2">
              <Badge variant="outline">
                {data.frequency === 'once' ? 'One-time event' : `Repeats ${data.frequency}`}
              </Badge>
              {data.recurring_until && (
                <span className="ml-2 text-muted-foreground">
                  until {format(data.recurring_until, 'PPP')}
                </span>
              )}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="text-lg font-medium">Participants</h3>
        <dl className="mt-2 divide-y divide-border">
          <div className="py-3 grid grid-cols-3">
            <dt className="font-medium">Access</dt>
            <dd className="col-span-2">
              {data.participant_type === 'all' && 'Entire Organization'}
              {data.participant_type === 'groups' && 'Specific Groups'}
              {data.participant_type === 'individuals' && 'Specific Individuals'}
            </dd>
          </div>
        </dl>
      </div>

      <div>
        <h3 className="text-lg font-medium">Settings</h3>
        <dl className="mt-2 divide-y divide-border">
          <div className="py-3 grid grid-cols-3">
            <dt className="font-medium">Visibility</dt>
            <dd className="col-span-2 space-y-1">
              {data.is_public && <Badge>Public Event</Badge>}
              {data.show_on_website && <Badge>Shown on Website</Badge>}
              {!data.is_public && !data.show_on_website && 'Private Event'}
            </dd>
          </div>
          <div className="py-3 grid grid-cols-3">
            <dt className="font-medium">Registration</dt>
            <dd className="col-span-2">
              {data.requires_registration ? (
                <div className="space-y-1">
                  <Badge>Registration Required</Badge>
                  {data.max_participants && (
                    <div className="text-sm text-muted-foreground">
                      Limited to {data.max_participants} participants
                    </div>
                  )}
                </div>
              ) : (
                'No registration required'
              )}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  )
} 