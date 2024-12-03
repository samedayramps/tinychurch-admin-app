import { createClient } from '@/utils/supabase/server'
import { OrganizationUsersTable } from '@/components/organization/users/users-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'

export default async function OrganizationUsersPage({
  params
}: {
  params: { slug: string }
}) {
  const supabase = await createClient()
  
  const { data: users } = await supabase
    .from('organization_members')
    .select(`
      *,
      profiles (
        id,
        email,
        full_name,
        avatar_url,
        is_active
      )
    `)
    .eq('organizations.slug', params.slug)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Users</h1>
        <Button asChild>
          <Link href={`/org/${params.slug}/users/invite`}>
            <PlusIcon className="w-4 h-4 mr-2" />
            Invite User
          </Link>
        </Button>
      </div>
      
      <OrganizationUsersTable users={users || []} organizationSlug={params.slug} />
    </div>
  )
} 