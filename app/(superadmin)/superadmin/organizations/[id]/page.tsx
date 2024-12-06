import { notFound } from 'next/navigation'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { OrganizationProfileTab } from '@/components/superadmin/organizations/organization-profile-tab'
import { OrganizationMembersTab } from '@/components/superadmin/organizations/organization-members-tab'
import { OrganizationSettingsTab } from '@/components/superadmin/organizations/organization-settings-tab'
import { ActivityLog } from '@/components/activity-log'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrganizationPage({ params }: PageProps) {
  const resolvedParams = await params
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  
  const organization = await repository.findWithStats(resolvedParams.id)
  
  if (!organization) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">{organization.name}</h2>
          <p className="text-sm text-muted-foreground">
            Organization Management
          </p>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <OrganizationProfileTab organization={organization} />
        </TabsContent>

        <TabsContent value="members">
          <OrganizationMembersTab organizationId={organization.id} />
        </TabsContent>

        <TabsContent value="settings">
          <OrganizationSettingsTab organization={organization} />
        </TabsContent>

        <TabsContent value="activity">
          <ActivityLog logs={[]} title="Recent Activity" />
        </TabsContent>
      </Tabs>
    </div>
  )
} 