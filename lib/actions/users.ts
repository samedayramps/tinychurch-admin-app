'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'
import { type Database } from '@/database.types'
import { getOrganizationInvitationEmailContent } from '@/lib/utils/email'
import { createServerUtils } from '@/lib/utils/supabase/server-utils'

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

  revalidatePath('/superadmin/users')
  revalidatePath(`/superadmin/users/${userId}`)
}

export async function deleteUserAction(userId: string) {
  try {
    // 1. Create admin client and verify superadmin status
    const supabase = await createClient(true) // Using service role key
    const currentUser = await getCurrentUser()
    
    if (!currentUser?.is_superadmin) {
      throw new Error('Unauthorized - Superadmin access required')
    }

    // 2. Get user info for audit log
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

    // 3. Soft delete in correct order
    // First remove organization memberships
    const { error: membershipError } = await supabase
      .from('organization_members')
      .update({ 
        deleted_at: now,
        updated_at: now
      })
      .eq('user_id', userId)
    
    if (membershipError) throw membershipError

    // Then update profile status
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ 
        deleted_at: now,
        is_active: false,
        status: 'deleted',
        updated_at: now
      })
      .eq('id', userId)
    
    if (profileError) throw profileError

    // Finally disable auth user
    const { error: authError } = await supabase.auth.admin.updateUserById(
      userId,
      { 
        ban_duration: '876000h' // 100 years
      }
    )
    
    if (authError) throw authError

    // 4. Create audit log entry
    await supabase.from('audit_logs').insert({
      user_id: currentUser.id,
      target_user_id: userId,
      event_type: 'user.deleted',
      details: `User ${user.email} deleted by ${currentUser.email}`,
      metadata: {
        deleted_at: now,
        deleted_by: currentUser.id
      }
    })

    revalidatePath('/superadmin/users')
    return { success: true }

  } catch (error) {
    console.error('Delete user error:', error)
    throw error
  }
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

  // Get organization name
  const { data: organization } = await supabase
    .from('organizations')
    .select('name')
    .eq('id', data.organization_id)
    .single()

  if (!organization) throw new Error('Organization not found')

  // Get the current user's profile
  const { data: inviterProfile } = await supabase
    .from('profiles')
    .select('email, full_name')
    .eq('id', currentUser.id)
    .single()

  if (!inviterProfile) throw new Error('Inviter profile not found')

  // Send invitation using Supabase's built-in invite function
  const { data: authUser, error: inviteError } = await supabase.auth.admin.inviteUserByEmail(
    data.email,
    {
      data: {
        organization_id: data.organization_id,
        organization_name: organization.name,
        role: data.role,
        first_name: data.first_name,
        last_name: data.last_name,
        invited_by: inviterProfile.full_name || inviterProfile.email
      },
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/setup`
    }
  )

  if (inviteError) throw inviteError

  // Create profile
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
      status: 'invited'
    })

  if (profileError) throw profileError

  // Create organization membership
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

export async function fixUserStatuses() {
  const supabase = await createServerUtils(true)
  
  // Get all users marked as invited
  const { data: invitedUsers } = await supabase
    .from('profiles')
    .select('id, email')
    .eq('status', 'invited')
  
  if (!invitedUsers) return
  
  for (const user of invitedUsers) {
    // Check actual auth status
    const { data: authUser } = await supabase.auth.admin.getUserById(user.id)
    
    if (authUser?.user?.email_confirmed_at) {
      // User has confirmed email, update status to active
      await supabase
        .from('profiles')
        .update({
          status: 'active',
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
    }
  }
}  