'use client'

import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupOverviewTab } from '@/components/groups/group-overview-tab'
import { GroupMembersTab } from '@/components/groups/group-members-tab'
import GroupRequestsTab from '@/components/groups/group-requests-tab'
import GroupSettingsTab from '@/components/groups/group-settings-tab'
import type { GroupWithMembers, GroupMember, JoinRequest, GroupInvitation } from '@/lib/dal/repositories/group'

interface GroupDetailsTabsProps {
  group: GroupWithMembers
  organizationId: string
  userId: string
  pendingRequests: JoinRequest[]
  pendingInvitations: GroupInvitation[]
}

export function GroupDetailsTabs({ 
  group: initialGroup,
  organizationId,
  userId,
  pendingRequests = [],
  pendingInvitations = []
}: GroupDetailsTabsProps) {
  const [currentMembers, setCurrentMembers] = useState(initialGroup.members)

  const handleMembersUpdate = (updatedMembers: GroupMember[]) => {
    setCurrentMembers(updatedMembers)
  }

  return (
    <Tabs defaultValue="overview" className="space-y-4">
      <TabsList>
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="members">Members</TabsTrigger>
        <TabsTrigger value="requests">
          Requests
          {pendingRequests.length > 0 && (
            <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
              {pendingRequests.length}
            </span>
          )}
        </TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>

      <TabsContent value="overview">
        <GroupOverviewTab 
          group={{
            ...initialGroup,
            members: currentMembers
          }}
          organizationId={organizationId}
          isLeader={true}
        />
      </TabsContent>

      <TabsContent value="members">
        <GroupMembersTab 
          group={{
            ...initialGroup,
            members: currentMembers
          }}
          isLeader={true}
          currentUserId={userId}
          onMembersUpdate={handleMembersUpdate}
        />
      </TabsContent>

      <TabsContent value="requests">
        <GroupRequestsTab 
          group={initialGroup}
          requests={pendingRequests}
          invitations={pendingInvitations}
        />
      </TabsContent>

      <TabsContent value="settings">
        <GroupSettingsTab 
          group={initialGroup}
          organizationId={organizationId}
        />
      </TabsContent>
    </Tabs>
  )
} 