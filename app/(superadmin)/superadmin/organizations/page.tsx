import { OrganizationsTable } from '@/components/superadmin/organizations/organizations-table'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'

export default async function OrganizationsPage() {
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  const organizations = await repository.findAll()

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Organizations</h2>
          <p className="text-muted-foreground">
            Manage your organizations and their settings
          </p>
        </div>
        {/* Add New Organization button here */}
      </div>
      <OrganizationsTable organizations={organizations} />
    </div>
  )
} 