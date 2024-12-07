import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { createClient } from '@/lib/utils/supabase/server'
import { notFound } from 'next/navigation'
import { BreadcrumbsProvider } from '@/lib/contexts/breadcrumbs-context'

export default async function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ id: string }>
}) {
  const resolvedParams = await params;
  const supabase = await createClient()
  const repository = new OrganizationRepository(supabase)
  const organization = await repository.findById(resolvedParams.id)

  console.log('Organization Layout Debug:', {
    resolvedParams,
    organizationName: organization?.name
  })

  if (!organization) {
    notFound()
  }

  return (
    <BreadcrumbsProvider 
      organizationName={organization.name}
      groupName={undefined}
    >
      {children}
    </BreadcrumbsProvider>
  )
} 