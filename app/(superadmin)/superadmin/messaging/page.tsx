import { Suspense } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from '@/lib/utils/supabase/server'
import { ComposeMessage } from './compose-message'
import { MessagingSettingsTab } from './components/messaging-settings-tab'
import { MessagingHistoryTab } from './components/messaging-history-tab'

async function MessagingPage() {
  const supabase = await createClient()
  
  const { data: organizations } = await supabase
    .from('organizations')
    .select('*')
    .limit(1)
    .single()

  if (!organizations) {
    throw new Error('No organization found')
  }

  const [
    { data: groups },
    { data: templates },
    { data: profilesWithOrgs },
    { data: settings }
  ] = await Promise.all([
    supabase.from('groups').select('*'),
    supabase.from('message_templates').select('*'),
    supabase
      .from('profiles')
      .select(`
        *,
        organization_members!inner(
          organization_id
        )
      `),
    supabase.from('messaging_settings').select('*')
  ])

  console.log('Loaded organizations:', organizations)
  
  const selectedOrgId = organizations?.[0]?.id
  console.log('Selected organization ID:', selectedOrgId)

  // Transform the profiles to include organization_id
  const recipients = profilesWithOrgs?.map(profile => ({
    ...profile,
    organization_id: profile.organization_members[0]?.organization_id
  })) || []

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Messaging</h1>
      
      <Tabs defaultValue="compose" className="space-y-6">
        <TabsList>
          <TabsTrigger value="compose">Compose</TabsTrigger>
          <TabsTrigger value="history">History</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="compose">
          <ComposeMessage 
            organizations={[organizations]}
            groups={groups || []}
            templates={templates || []}
            recipients={recipients}
          />
        </TabsContent>

        <TabsContent value="history">
          <MessagingHistoryTab organizationId={undefined} />
        </TabsContent>

        <TabsContent value="settings">
          <MessagingSettingsTab 
            organizationId={organizations.id}
            settings={settings?.[0] || {
              default_from_name: '',
              default_reply_to: '',
              notifications_enabled: true
            }}
          />
        </TabsContent>
      </Tabs>
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