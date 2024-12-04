import { UserInviteForm } from '@/components/superadmin/users/user-invite-form'
import { getAllOrganizations } from '@/lib/dal/repositories/organization'

export default async function InviteUserPage() {
  const organizations = await getAllOrganizations()

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