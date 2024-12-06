import { UserInviteForm } from '@/components/superadmin/users/user-invite-form'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'

export default async function InviteUserPage() {
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  const organizations = await repository.findAll()

  if (!organizations) {
    throw new Error('Failed to load organizations')
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Invite User</h1>
      <UserInviteForm organizations={organizations} />
    </div>
  )
} 