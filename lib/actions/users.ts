'use server'

import { createClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { createAuditLog } from '@/lib/dal/audit-extended'
import { getCurrentUser } from '@/lib/dal'
import { type Database } from '@/database.types'

export async function updateUserAction(userId: string, data: {
  first_name: string
  last_name: string
  email: string
  alternative_email?: string
  phone?: string
  is_active: boolean
  is_superadmin: boolean
  language: string
  theme: string
  role: Database['public']['Enums']['user_role']
  organization_id: string
  notification_preferences: {
    email: boolean
    sms: boolean
    push: boolean
  }
}) {
  const supabase = await createClient(true)
  const currentUser = await getCurrentUser()
  
  if (!currentUser?.is_superadmin) {
    throw new Error('Unauthorized - Superadmin access required')
  }

  // Validate phone format if provided
  if (data.phone && !/^\d{3}-\d{3}-\d{4}$/.test(data.phone)) {
    throw new Error('Invalid phone number format. Use: 123-456-7890')
  }

  const { error: profileError } = await supabase
    .from('profiles')
    .update({
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email,
      alternative_email: data.alternative_email,
      phone: data.phone || null,
      is_active: data.is_active,
      is_superadmin: data.is_superadmin,
      language: data.language,
      theme: data.theme,
      notification_preferences: data.notification_preferences,
      updated_at: new Date().toISOString(),
    })
    .eq('id', userId)
    
  if (profileError) throw profileError

  // Check if user is already in the organization
  const { data: existingMembership } = await supabase
    .from('organization_members')
    .select('id')
    .eq('user_id', userId)
    .eq('organization_id', data.organization_id)
    .single()

  if (existingMembership) {
    // Update existing membership
    const { error: membershipError } = await supabase
      .from('organization_members')
      .update({
        role: data.role,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)
      .eq('organization_id', data.organization_id)

    if (membershipError) throw membershipError
  } else {
    // Remove from old organization
    await supabase
      .from('organization_members')
      .delete()
      .eq('user_id', userId)

    // Create new organization membership
    const { error: newMembershipError } = await supabase
      .from('organization_members')
      .insert({
        user_id: userId,
        organization_id: data.organization_id,
        role: data.role,
        joined_date: new Date().toISOString()
      })

    if (newMembershipError) throw newMembershipError
  }

  // Create audit log
  await createAuditLog({
    category: 'security',
    action: 'user.update',
    organizationId: data.organization_id,
    actorId: currentUser.id,
    targetType: 'user',
    targetId: userId,
    description: `User ${data.email} was updated`,
    metadata: data,
    severity: 'notice'
  })

  revalidatePath('/superadmin/users')
  revalidatePath(`/superadmin/users/${userId}`)
}

export async function deleteUserAction(userId: string) {
  const supabase = await createClient(true)
  const currentUser = await getCurrentUser()
  
  if (!currentUser?.is_superadmin) {
    throw new Error('Unauthorized - Superadmin access required')
  }

  // Get user info for audit log
  const { data: user } = await supabase
    .from('profiles')
    .select(`
      email,
      organization_members (
        organization_id
      )
    `)
    .eq('id', userId)
    .single()

  if (!user) {
    throw new Error('User not found')
  }

  const now = new Date().toISOString()

  // Soft delete in correct order
  // 1. Soft delete organization memberships
  const { error: membershipError } = await supabase
    .from('organization_members')
    .update({ 
      deleted_at: now
    })
    .eq('user_id', userId)
    
  if (membershipError) throw membershipError

  // 2. Soft delete profile
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ 
      deleted_at: now,
      is_active: false 
    })
    .eq('id', userId)
    
  if (profileError) throw profileError

  // 3. Ban the auth user using a valid duration format (100 years)
  const { error: authError } = await supabase.auth.admin.updateUserById(
    userId,
    { 
      ban_duration: '876000h' // 100 years in hours
    }
  )
  
  if (authError) throw authError

  // Create audit log
  await createAuditLog({
    category: 'security',
    action: 'user.delete',
    organizationId: user.organization_members?.[0]?.organization_id || 'system',
    actorId: currentUser.id,
    targetType: 'user',
    targetId: userId,
    description: `User ${user.email} was deleted`,
    metadata: {
      deleted_by: currentUser.email,
      deleted_user: user.email,
      deleted_at: now
    },
    severity: 'alert'
  })

  revalidatePath('/superadmin/users')
}

export async function createUserAction(data: {
  email: string
  full_name: string
  is_active: boolean
  is_superadmin: boolean
}) {
  const supabase = await createClient()
  const currentUser = await getCurrentUser()
  
  // First create auth user
  const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
    email: data.email,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name
    }
  })
  
  if (authError) throw authError
  
  // Then create profile
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      full_name: data.full_name,
      email: data.email,
      is_active: data.is_active,
      is_superadmin: data.is_superadmin
    })
    
  if (profileError) throw profileError

  // Create audit log
  await createAuditLog({
    category: 'security',
    action: 'user.create',
    organizationId: 'system',
    actorId: currentUser?.id || 'system',
    targetType: 'user',
    targetId: authUser.user.id,
    description: `New user ${data.email} was created`,
    metadata: data,
    severity: 'notice'
  })

  revalidatePath('/superadmin/users')
}

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

  // Generate temporary password
  const tempPassword = Math.random().toString(36).slice(-8)
  const full_name = `${data.first_name} ${data.last_name}`.trim()

  // Send invitation using Supabase's built-in invite function
  const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    data.email,
    {
      data: {
        invited_by: currentUser.email,
        temp_password: tempPassword,
        first_name: data.first_name,
        last_name: data.last_name,
        full_name,
        is_active: data.is_active,
        is_superadmin: data.is_superadmin,
        organization_id: data.organization_id,
        role: data.role
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`
    }
  )

  if (inviteError) throw inviteError

  // Create profile after successful invite
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      id: authUser.user.id,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name,
      is_active: data.is_active,
      is_superadmin: data.is_superadmin
    })
    
  if (profileError) throw profileError

  // Create organization membership
  const { error: membershipError } = await supabase
    .from('organization_members')
    .insert({
      user_id: authUser.user.id,
      organization_id: data.organization_id,
      role: data.role,
      joined_date: new Date().toISOString()
    })

  if (membershipError) throw membershipError

  // Create audit log
  await createAuditLog({
    category: 'security',
    action: 'user.invite',
    organizationId: data.organization_id,
    actorId: currentUser.id,
    targetType: 'user',
    targetId: authUser.user.id,
    description: `User ${data.email} was invited`,
    metadata: {
      ...data,
      invited_by: currentUser.email
    },
    severity: 'notice'
  })

  revalidatePath('/superadmin/users')
} 