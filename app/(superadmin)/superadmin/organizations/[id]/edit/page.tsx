import { notFound } from 'next/navigation'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationEditForm } from '@/components/superadmin/organizations/organization-edit-form'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditOrganizationPage({ params }: PageProps) {
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
          <h2 className="text-2xl font-bold tracking-tight">Edit {organization.name}</h2>
          <p className="text-sm text-muted-foreground">
            Update organization details and settings
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Organization Details</CardTitle>
          <CardDescription>
            Make changes to {organization.name}'s information
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrganizationEditForm organization={organization} />
        </CardContent>
      </Card>
    </div>
  )
} 