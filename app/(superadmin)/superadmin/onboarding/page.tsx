import { TenantOnboardingForm } from '@/components/superadmin/onboarding/tenant-onboarding-form'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { Card, CardContent } from '@/components/ui/card'

export const metadata = {
  title: 'Tenant Onboarding - Superadmin',
  description: 'Onboard new tenant organizations',
}

export default async function TenantOnboardingPage() {
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  const organizations = await repository.findAll()

  const breadcrumbs = [
    { title: 'Superadmin', href: '/superadmin' },
    { title: 'Tenant Onboarding', href: '/superadmin/onboarding' },
  ]

  return (
    <div className="space-y-6">
      
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h2 className="text-2xl font-bold tracking-tight">Tenant Onboarding</h2>
          <p className="text-muted-foreground">
            Create a new organization and set up its admin user
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <TenantOnboardingForm existingOrganizations={organizations} />
        </CardContent>
      </Card>
    </div>
  )
} 