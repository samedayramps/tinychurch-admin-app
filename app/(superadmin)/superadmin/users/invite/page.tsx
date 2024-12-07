import { UserInviteForm } from '@/components/superadmin/users/user-invite-form'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { notFound } from 'next/navigation'

export default async function InviteUserPage() {
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  
  try {
    const organizations = await repository.findAll()
    
    if (!organizations) {
      throw new Error('Failed to load organizations')
    }

    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold tracking-tight">Invite User</h2>
            <p className="text-muted-foreground">
              Send an invitation to join the platform
            </p>
          </div>
        </div>
        <UserInviteForm organizations={organizations} />
      </div>
    )
  } catch (error) {
    console.error('Error loading organizations:', error)
    notFound()
  }
} 