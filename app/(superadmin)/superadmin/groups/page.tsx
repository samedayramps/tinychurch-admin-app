import { Suspense } from 'react'
import { SuperadminGroupsList } from '@/components/superadmin/groups/superadmin-groups-list'
import { createClient } from '@/lib/utils/supabase/server'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { getCurrentUser } from '@/lib/dal'
import { redirect } from 'next/navigation'
import type { Database } from '@/database.types'

// Add this type definition
type Organization = Database['public']['Tables']['organizations']['Row']

async function SuperadminGroupsPage() {
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user?.is_superadmin) {
    redirect('/')
  }

  // Get all organizations for the selector
  const orgRepo = new OrganizationRepository(supabase)
  const organizations = await orgRepo.findAll() as Organization[]

  // Get groups from all organizations initially
  const groupRepo = new GroupRepository(supabase)
  const groups = await groupRepo.getAllGroups()

  return (
    <div className="container mx-auto py-6">
      <SuperadminGroupsList 
        groups={groups}
        organizations={organizations}
      />
    </div>
  )
}

export default function SuperadminGroupsPageWrapper() {
  return (
    <Suspense fallback={<div>Loading groups...</div>}>
      <SuperadminGroupsPage />
    </Suspense>
  )
} 