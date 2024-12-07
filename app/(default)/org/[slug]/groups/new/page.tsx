// app/(default)/org/[slug]/groups/new/page.tsx
import { GroupForm } from '@/components/groups/group-form'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { createClient } from '@/lib/utils/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { OrganizationRepository } from '@/lib/dal/repositories/organization'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default async function NewGroupPage({ params }: PageProps) {
  const { slug } = await params;

  const supabase = await createClient()
  const orgRepo = new OrganizationRepository(supabase)
  const groupRepo = new GroupRepository(supabase)
  
  const org = await orgRepo.findBySlug(slug)
  if (!org) {
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
            organizationId={org.id}
            onSubmit={async (data) => {
              'use server'
              await groupRepo.createGroup({
                organization_id: org.id,
                name: data.name,
                type: data.type,
                visibility: data.visibility,
                description: data.description || null,
                max_members: data.max_members || null
              })
            }}
          />
        </CardContent>
      </Card>
    </div>
  )
}