import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import { GroupOverviewTab } from '@/components/groups/group-overview-tab'
import { GroupMembersTab } from '@/components/groups/group-members-tab'
import GroupRequestsTab from '@/components/groups/group-requests-tab'
import GroupSettingsTab from '@/components/groups/group-settings-tab'
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface PageProps {
  params: Promise<{ id: string; groupId: string }>
}

async function GroupDetailsPage({ params }: PageProps) {
  const { id: organizationId, groupId } = await params
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user?.is_superadmin) {
    redirect('/')
  }

  const groupRepo = new GroupRepository(supabase)
  const orgRepo = new OrganizationRepository(supabase)

  // Get organization and group details
  const [organization, group] = await Promise.all([
    orgRepo.findById(organizationId),
    groupRepo.getGroupWithMembers(groupId)
  ])

  if (!organization || !group) {
    notFound()
  }

  // Assuming you have a way to get pending requests
  const pendingRequests = await groupRepo.getPendingRequests(groupId)

  // Add this to fetch invitable members
  const invitableMembers = await groupRepo.getInvitableMembers(groupId, organizationId)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href={`/superadmin/organizations/${organizationId}`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">{group.name}</h1>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="requests">Join Requests</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <GroupOverviewTab 
            group={group}
            organizationId={organizationId}
            isLeader={true}
          />
        </TabsContent>

        <TabsContent value="members">
          <GroupMembersTab 
            group={group}
            isLeader={true} // Assuming the user is a leader
            currentUserId={user.id}
          />
        </TabsContent>

        <TabsContent value="requests">
          <GroupRequestsTab 
            group={group}
            requests={pendingRequests}
          />
        </TabsContent>

        <TabsContent value="settings">
          <GroupSettingsTab 
            group={group}
            organizationId={organizationId}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default function GroupDetailsPageWrapper(props: PageProps) {
  return (
    <Suspense fallback={<div>Loading group details...</div>}>
      <GroupDetailsPage {...props} />
    </Suspense>
  )
}