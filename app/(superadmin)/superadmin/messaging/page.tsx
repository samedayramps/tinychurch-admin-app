import { Suspense } from 'react'
import { createClient } from '@/lib/utils/supabase/server'
import { ComposeMessage } from './compose-message'

async function MessagingPage() {
  const supabase = await createClient()
  
  const [
    { data: organizations }, 
    { data: groups },
    { data: templates },
    { data: profilesWithOrgs }
  ] = await Promise.all([
    supabase.from('organizations').select('*'),
    supabase.from('groups').select('*'),
    supabase.from('message_templates').select('*'),
    supabase
      .from('profiles')
      .select(`
        *,
        organization_members!inner(
          organization_id
        )
      `)
  ])

  // Transform the profiles to include organization_id
  const recipients = profilesWithOrgs?.map(profile => ({
    ...profile,
    organization_id: profile.organization_members[0]?.organization_id
  })) || []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Messaging</h1>
      <ComposeMessage 
        organizations={organizations || []}
        groups={groups || []}
        templates={templates || []}
        recipients={recipients}
      />
    </div>
  )
}

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <MessagingPage />
    </Suspense>
  )
} 