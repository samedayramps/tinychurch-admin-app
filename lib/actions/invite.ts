'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'
import { type Database } from '@/database.types'

export async function inviteUserAction(data: {
  email: string
  first_name: string
  last_name: string
  is_active: boolean
  is_superadmin: boolean
  organization_id: string
  role: Database['public']['Enums']['user_role']
}) {
  const supabase = await createClient(true)
  const currentUser = await getCurrentUser()
  
  if (!currentUser?.is_superadmin) {
    throw new Error('Unauthorized - Superadmin access required')
  }

  const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    data.email,
    {
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        full_name: `${data.first_name} ${data.last_name}`.trim(),
        organization_id: data.organization_id,
        role: data.role
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  )

  if (inviteError) throw inviteError

  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: `${data.first_name} ${data.last_name}`.trim(),
      is_active: data.is_active,
      is_superadmin: data.is_superadmin,
      status: 'invited',
      invited_at: new Date().toISOString()
    })

  if (profileError) throw profileError

  const { error: membershipError } = await supabase
    .from('organization_members')
    .insert({
      user_id: authUser.user.id,
      organization_id: data.organization_id,
      role: data.role
    })

  if (membershipError) throw membershipError

  revalidatePath('/superadmin/users')
} 