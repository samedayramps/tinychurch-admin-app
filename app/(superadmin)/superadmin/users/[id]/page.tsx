import { createClient } from '@/utils/supabase/server'
import { UserForm } from '@/components/superadmin/users/user-form'
import { notFound } from 'next/navigation'

type Props = {
  params: Promise<{ id: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function EditUserPage(props: Props) {
  const supabase = await createClient()
  const params = await props.params
  
  const { data: user } = await supabase
    .from('profiles')
    .select(`
      *,
      organization_members (
        role,
        organizations (id, name)
      )
    `)
    .eq('id', params.id)
    .single()
    
  if (!user) {
    notFound()
  }

  // Fetch all organizations
  const { data: organizations } = await supabase
    .from('organizations')
    .select('id, name')
    .order('name')

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Edit User</h1>
      <UserForm 
        user={user} 
        organizations={organizations || []} 
      />
    </div>
  )
} 