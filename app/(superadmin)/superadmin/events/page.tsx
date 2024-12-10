import { Suspense } from 'react'
import { createClient } from '@/lib/utils/supabase/server'
import { CreateEventButton } from '@/components/superadmin/events/create-event-button'
import { OrganizationSelect } from '@/components/superadmin/events/organization-select'
import { ViewToggle } from '@/components/superadmin/events/view-toggle'
import { EventsClientWrapper } from '@/components/superadmin/events/events-client-wrapper'
import { revalidatePath } from 'next/cache'

export const revalidate = 0 // Disable caching for this page

async function EventsPage() {
  const supabase = await createClient()
  
  const [{ data: events }, { data: organizations }] = await Promise.all([
    supabase
      .from('calendar_events')
      .select(`
        *,
        organizations (
          id,
          name
        )
      `)
      .order('start_date', { ascending: true })
      .order('start_time', { ascending: true }),
    supabase
      .from('organizations')
      .select('id, name, address')
      .order('name')
  ])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Calendar Events</h2>
          <p className="text-muted-foreground">
            Schedule and manage church events
          </p>
        </div>
        <div className="flex items-center gap-4">
          <ViewToggle />
          <OrganizationSelect organizations={organizations || []} />
          <CreateEventButton organizations={organizations || []} />
        </div>
      </div>

      <EventsClientWrapper 
        events={events || []} 
        organizations={organizations || []}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <EventsPage />
    </Suspense>
  )
} 