// app/(default)/org/[slug]/groups/[groupId]/page.tsx
import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { GroupRepository } from '@/lib/dal/repositories/group'
import { createClient } from '@/lib/utils/supabase/server'
import { GroupOverviewTab } from '@/components/groups/group-overview-tab'
import { GroupMembersTab } from '@/components/groups/group-members-tab'
import GroupRequestsTab from '@/components/groups/group-requests-tab'
import GroupSettingsTab from '@/components/groups/group-settings-tab'

interface PageProps {
  params: Promise<{ slug: string; groupId: string }>
}

// Helper to check if user is group leader
async function isGroupLeader(groupId: string, userId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('group_members')
    .select('role')
    .eq('group_id', groupId)
    .eq('user_id', userId)
    .single()

  return data?.role === 'leader'
}

async function GroupDetailsPage({ params }: PageProps) {
  const { slug, groupId } = await params;

  const supabase = await createClient();
  
  // Get current user and check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    notFound();
  }

  // Get organization and group details
  const [{ data: org }, { data: group }] = await Promise.all([
    supabase
      .from('organizations')
      .select('id, name')
      .eq('slug', slug)
      .single(),
    supabase
      .from('groups')
      .select(`
        *,
        members:group_members(
          *,
          profile:profiles(
            id,
            email,
            full_name,
            avatar_url
          )
        )
      `)
      .eq('id', groupId)
      .single()
  ]);

  if (!org || !group) {
    notFound();
  }

  // Check user's role in the group
  const isLeader = await isGroupLeader(group.id, user.id);
  const groupRepo = new GroupRepository(supabase);

  // Get both pending requests and invitations if user is leader
  const [pendingRequests, pendingInvitations] = isLeader 
    ? await Promise.all([
        groupRepo.getPendingRequests(groupId),
        groupRepo.getPendingInvitations(groupId)
      ])
    : [[], []];

  // Add debug logging
  console.log('Is leader:', isLeader)
  console.log('Pending invitations in page:', pendingInvitations)

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{group.name}</h1>
        <p className="text-muted-foreground">{group.description}</p>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="members">Members</TabsTrigger>
          {isLeader && (
            <>
              <TabsTrigger value="requests">
                Requests
                {pendingRequests.length > 0 && (
                  <span className="ml-2 rounded-full bg-primary/10 px-2 py-0.5 text-xs">
                    {pendingRequests.length}
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="overview">
          <GroupOverviewTab 
            group={group} 
            organizationId={org.id}
            isLeader={isLeader}
          />
        </TabsContent>

        <TabsContent value="members">
          <GroupMembersTab 
            group={group}
            isLeader={isLeader}
            currentUserId={user.id}
          />
        </TabsContent>

        {isLeader && (
          <>
            <TabsContent value="requests">
              <GroupRequestsTab 
                group={group}
                requests={pendingRequests || []}
                invitations={pendingInvitations || []}
              />
            </TabsContent>

            <TabsContent value="settings">
              <GroupSettingsTab 
                group={group}
                organizationId={org.id}
              />
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  );
}

// Wrap in Suspense for loading state
export default async function GroupDetailsPageWrapper(props: PageProps) {
  const { slug, groupId } = await props.params;

  return (
    <Suspense fallback={<div>Loading group details...</div>}>
      <GroupDetailsPage {...props} />
    </Suspense>
  )
}