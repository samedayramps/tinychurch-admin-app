import { Suspense } from 'react'
import { notFound, redirect } from 'next/navigation'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { getCurrentUser } from '@/lib/dal'
import { GroupDetailsTabs } from '@/components/groups/group-details-tabs'
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

  // Get organization, group details, and all pending data
  const [organization, group, pendingRequests, pendingInvitations] = await Promise.all([
    orgRepo.findById(organizationId),
    groupRepo.getGroupWithMembers(groupId),
    groupRepo.getPendingRequests(groupId),
    groupRepo.getPendingInvitations(groupId)
  ])

  if (!organization || !group) {
    notFound()
  }

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

      <GroupDetailsTabs
        group={group}
        organizationId={organizationId}
        userId={user.id}
        pendingRequests={pendingRequests}
        pendingInvitations={pendingInvitations}
      />
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