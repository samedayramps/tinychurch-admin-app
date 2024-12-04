'use server'

import { createClient } from '@/utils/supabase/server'
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
  
  if (!currentUser) {
    throw new Error('Unauthorized')
  }

  if (!currentUser.email) {
    throw new Error('User email is required')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', currentUser.id)
    .single()

  if (!profile?.is_superadmin) {
    throw new Error('Unauthorized - Superadmin access required')
  }

  const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    data.email,
    {
      data: {
        first_name: data.first_name,
        last_name: data.last_name,
        is_active: data.is_active,
        is_superadmin: data.is_superadmin,
        organization_id: data.organization_id,
        role: data.role,
        invited_by: currentUser.email
      }
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
      is_active: data.is_active,
      is_superadmin: data.is_superadmin
    })

  if (profileError) throw profileError

  const { error: membershipError } = await supabase
    .from('organization_members')
    .insert({
      user_id: authUser.user.id,
      organization_id: data.organization_id,
      role: data.role,
      joined_date: new Date().toISOString()
    })

  if (membershipError) throw membershipError

  revalidatePath('/superadmin/users')
} 