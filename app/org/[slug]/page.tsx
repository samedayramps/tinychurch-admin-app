import { headers } from 'next/headers'
import { createClient } from '@/utils/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { UsersIcon, CalendarIcon, BookOpenIcon, SettingsIcon } from 'lucide-react'

export default async function OrganizationPage() {
  const headersList = await headers()
  const orgRole = headersList.get('x-organization-role')
  const orgSlug = headersList.get('x-organization-slug')
  
  const supabase = await createClient()
  
  // Fetch organization details
  const { data: org } = await supabase
    .from('organizations')
    .select(`
      *,
      organization_members (
        profiles (id)
      )
    `)
    .eq('slug', orgSlug)
    .single()
    
  if (!org) return null
  
  // Get member count
  const memberCount = org.organization_members?.length || 0
  
  // Fetch recent activity counts
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const { count: recentEventsCount } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    .eq('organization_id', org.id)
    .gte('start_time', thirtyDaysAgo.toISOString())

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">{org.name}</h1>
        {(orgRole === 'admin' || orgRole === 'staff') && (
          <Button variant="outline" asChild>
            <Link href={`/org/${orgSlug}/settings`}>
              <SettingsIcon className="w-4 h-4 mr-2" />
              Settings
            </Link>
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UsersIcon className="w-4 h-4" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberCount}</div>
            <Button variant="link" className="mt-2 p-0" asChild>
              <Link href={`/org/${orgSlug}/users`}>View all members</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CalendarIcon className="w-4 h-4" />
              Recent Events
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentEventsCount}</div>
            <Button variant="link" className="mt-2 p-0" asChild>
              <Link href={`/org/${orgSlug}/events`}>View calendar</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpenIcon className="w-4 h-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {(orgRole === 'admin' || orgRole === 'staff') && (
              <>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/org/${orgSlug}/users/invite`}>Invite Member</Link>
                </Button>
                <Button variant="secondary" className="w-full" asChild>
                  <Link href={`/org/${orgSlug}/events/new`}>Create Event</Link>
                </Button>
              </>
            )}
            <Button variant="secondary" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/directory`}>Member Directory</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {(orgRole === 'admin' || orgRole === 'staff') && (
        <Card>
          <CardHeader>
            <CardTitle>Administrative Tools</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/ministries`}>
                Manage Ministries
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/groups`}>
                Small Groups
              </Link>
            </Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/org/${orgSlug}/communications`}>
                Communications
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 