import { type SupabaseClient } from '@supabase/supabase-js'
import { createAuditLog } from '@/lib/dal/audit'
import type { Database } from '@/database.types'

type AuditSeverity = Database['public']['Enums']['audit_severity']

export async function verifyInviterPermissions(supabase: SupabaseClient, userId: string) {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_superadmin')
    .eq('id', userId)
    .single()

  if (!profile?.is_superadmin) {
    throw new Error('Unauthorized - Superadmin access required')
  }
}

export async function createAuthUser(supabase: SupabaseClient, data: {
  email: string
  full_name: string
  first_name: string
  last_name: string
  tempPassword: string
}) {
  const { data: authUser, error } = await supabase.auth.admin.createUser({
    email: data.email,
    password: data.tempPassword,
    email_confirm: true,
    user_metadata: {
      full_name: data.full_name,
      first_name: data.first_name,
      last_name: data.last_name
    }
  })
  
  if (error) throw error
  return authUser
}

export async function createUserProfile(supabase: SupabaseClient, data: {
  userId: string
  email: string
  first_name: string
  last_name: string
  full_name: string
  is_active: boolean
  is_superadmin: boolean
}) {
  const { error } = await supabase
    .from('profiles')
    .insert({
      id: data.userId,
      email: data.email,
      first_name: data.first_name,
      last_name: data.last_name,
      full_name: data.full_name,
      is_active: data.is_active,
      is_superadmin: data.is_superadmin
    })
    
  if (error) throw error
}

export async function createOrganizationMembership(supabase: SupabaseClient, data: {
  userId: string
  organizationId: string
  role: string
}) {
  const { error } = await supabase
    .from('organization_members')
    .insert({
      user_id: data.userId,
      organization_id: data.organizationId,
      role: data.role,
      joined_date: new Date().toISOString()
    })

  if (error) throw error
}

export async function sendInviteEmail(supabase: SupabaseClient, data: {
  email: string
  invitedBy: string
  tempPassword: string
}) {
  const { error } = await supabase.auth.admin.inviteUserByEmail(data.email, {
    data: {
      invited_by: data.invitedBy,
      temp_password: data.tempPassword
    }
  })

  if (error) throw error
}

export async function createInviteAuditLog(
  currentUser: { id: string, email?: string },
  targetUserId: string,
  data: {
    email: string
    first_name: string
    last_name: string
    organization_id: string
    role: string
  }
) {
  await createAuditLog({
    user_id: currentUser.id,
    event_type: 'invitation_sent',
    details: `User ${data.email} was invited`,
    organization_id: data.organization_id,
    metadata: {
      ...data,
      invited_by: currentUser.email || 'unknown',
      target_id: targetUserId,
      target_type: 'user'
    }
  })
}