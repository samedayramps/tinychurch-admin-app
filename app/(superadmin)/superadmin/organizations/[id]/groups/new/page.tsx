import { Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/utils/supabase/server'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'
import { getCurrentUser } from '@/lib/dal'
import { redirect, notFound } from 'next/navigation'
import { GroupForm } from '@/components/groups/group-form'
import { createGroup } from '@/lib/actions/groups'
import type { Json } from '@/database.types'
import { Database } from '@/database.types'

interface PageProps {
  params: Promise<{ id: string }>
}

async function NewGroupPage({ params }: PageProps) {
  const { id: organizationId } = await params
  const supabase = await createClient()
  const user = await getCurrentUser()

  if (!user?.is_superadmin) {
    redirect('/')
  }

  // Verify organization exists
  const orgRepo = new OrganizationRepository(supabase)
  const organization = await orgRepo.findById(organizationId)

  if (!organization) {
    notFound()
  }

  return (
    <div className="container mx-auto py-6">
      <Card>
        <CardHeader>
          <CardTitle>Create New Group</CardTitle>
        </CardHeader>
        <CardContent>
          <GroupForm 
            organizationId={organizationId}
            redirectPath={`/superadmin/organizations/${organizationId}`}
            onSubmit={async (data) => {
              'use server'
              try {
                console.log('Form submission data:', data)

                const result = await createGroup({
                  organization_id: organizationId,
                  name: data.name,
                  type: data.type as Database['public']['Enums']['group_type'],
                  visibility: data.visibility as Database['public']['Enums']['group_visibility'],
                  description: data.description || null,
                  max_members: data.max_members === undefined ? null : data.max_members,
                  settings: {
                    allow_join_requests: true,
                    require_approval: true
                  }
                })

                if (result.error) {
                  throw new Error(result.error)
                }

                // Instead of using redirect, return a success response
                return { success: true }
              } catch (error) {
                console.error('Error in group creation:', {
                  error,
                  formData: data,
                  organizationId
                })
                throw error
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function NewGroupPageWrapper(props: PageProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <NewGroupPage {...props} />
    </Suspense>
  )
} 