import { createClient } from '@/utils/supabase/server'
import { UsersTable } from '@/components/superadmin/users/users-table'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { PlusIcon } from 'lucide-react'

export default async function SuperAdminUsersPage() {
  const supabase = await createClient()
  
  const { data: users } = await supabase
    .from('profiles')
    .select(`
      *,
      organization_members (
        role,
        organizations (name)
      )
    `)
    .is('deleted_at', null)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <Button asChild>
          <Link href="/superadmin/users/invite">
            <PlusIcon className="mr-2 h-4 w-4" />
            Invite User
          </Link>
        </Button>
      </div>
      
      <div className="rounded-md border">
        <UsersTable users={users || []} />
      </div>
    </div>
  )
} 