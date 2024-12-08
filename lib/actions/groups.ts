'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'
import type { Database } from '@/database.types'
import type { Json } from '@/database.types'
import { DalError } from '@/lib/dal/errors'
import { createServerUtils } from '@/lib/utils/supabase/server-utils'
import { checkPermission } from '@/lib/utils/permissions'
import { sendEmail, getGroupInvitationEmailContent } from '@/lib/utils/email'

type GroupSettings = {
  name: string
  description?: string | null
  visibility: Database['public']['Enums']['group_visibility']
  max_members?: number | null
}

type GroupWithOrganization = Database['public']['Tables']['groups']['Row'] & {
  organization: {
    id: string
    name: string
  }
}

// Update group settings
export async function updateGroupSettings(
  groupId: string,
  data: GroupSettings
) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user has permission to update group
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')
    
    const userMember = group.members.find(m => m.user_id === user.id)
    if (!userMember || userMember.role !== 'leader') {
      throw new Error('Unauthorized - Only group leaders can update settings')
    }

    // Update the group
    await groupRepo.updateGroup(groupId, {
      name: data.name,
      description: data.description,
      visibility: data.visibility,
      max_members: data.max_members,
      updated_at: new Date().toISOString()
    })

    // Revalidate the group pages
    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error updating group settings:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update settings' }
  }
}

// Process a join request
export async function processJoinRequest(
  requestId: string,
  action: 'approved' | 'rejected',
  groupId: string
) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user has permission
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    // Check group leadership
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')
    
    const userMember = group.members.find(m => m.user_id === user.id)
    if (!userMember || userMember.role !== 'leader') {
      throw new Error('Unauthorized - Only group leaders can process join requests')
    }

    // Process the request
    await groupRepo.processJoinRequest(requestId, action, user.id)

    // Revalidate relevant pages
    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    return { success: true }
  } catch (error) {
    console.error('Error processing join request:', error)
    return { error: error instanceof Error ? error.message : 'Failed to process request' }
  }
}

// Invite a user to join the group
export async function inviteToGroup(
  groupId: string,
  userId: string,
  role: Database['public']['Enums']['group_member_role'] = 'member'
) {
  try {
    const supabase = await createServerUtils(true)
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')

    // Get the group and organization details with proper typing
    const { data: group } = await supabase
      .from('groups')
      .select(`
        id,
        name,
        organization_id,
        organization:organizations!inner (
          id,
          name
        )
      `)
      .eq('id', groupId)
      .single<GroupWithOrganization>()

    if (!group) throw new Error('Group not found')

    // Get the invited user's profile with proper typing
    const { data: invitedUser } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', userId)
      .single()

    if (!invitedUser) throw new Error('Invited user not found')

    // Get the current user's profile for the invitation
    const { data: inviterProfile } = await supabase
      .from('profiles')
      .select('id, email, full_name')
      .eq('id', currentUser.id)
      .single()

    if (!inviterProfile) throw new Error('Inviter profile not found')

    // Check for existing pending invitation
    const { data: existingInvite } = await supabase
      .from('group_invitations')
      .select('id')
      .eq('group_id', groupId)
      .eq('invited_user', userId)
      .eq('status', 'pending')
      .is('used_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (existingInvite) {
      return { 
        error: 'User already has a pending invitation',
        existingInvite: true
      }
    }

    // Generate invitation token
    const token = crypto.randomUUID()

    // Create the invitation with proper typing
    const { error: inviteError } = await supabase
      .from('group_invitations')
      .insert({
        group_id: groupId,
        organization_id: group.organization_id,
        invited_by: currentUser.id,
        invited_user: userId,
        role: role,
        status: 'pending' as const,
        token,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      })

    if (inviteError) throw inviteError

    // Send invitation email with proper typing
    const acceptUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invitations/${token}`
    
    await sendEmail({
      to: invitedUser.email,
      subject: `Invitation to join ${group.name}`,
      html: getGroupInvitationEmailContent({
        invitedByName: inviterProfile.full_name || inviterProfile.email,
        groupName: group.name,
        organizationName: group.organization.name,
        acceptUrl
      })
    })

    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    return { success: true }

  } catch (error) {
    console.error('Error inviting user to group:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to send invitation'
    }
  }
}

// Update member role
export async function updateMemberRole(
  groupId: string,
  userId: string,
  newRole: Database['public']['Enums']['group_member_role']
) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the group and check permissions
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')

    // Check if user is superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    // Check if user is org admin/staff
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', group.organization_id)
      .single()

    // Check if user is group leader
    const userMember = group.members.find(m => m.user_id === user.id)
    const isGroupLeader = userMember?.role === 'leader'

    // Verify permissions
    const canUpdateRoles = 
      profile?.is_superadmin || 
      orgMember?.role === 'admin' ||
      orgMember?.role === 'staff' ||
      isGroupLeader

    if (!canUpdateRoles) {
      throw new Error('Unauthorized - Only superadmins, organization admins, staff, or group leaders can update roles')
    }

    // Update the role
    await groupRepo.updateMemberRole(groupId, userId, newRole)
    
    return { success: true }
  } catch (error) {
    console.error('Error updating member role:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to update role',
      details: error
    }
  }
}

// Remove member from group
export async function removeMember(
  groupId: string,
  memberId: string
) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user has permission
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')
    
    const userMember = group.members.find(m => m.user_id === user.id)
    if (!userMember || userMember.role !== 'leader') {
      throw new Error('Unauthorized - Only group leaders can remove members')
    }

    // Get member details before removal
    const { data: memberToRemove } = await supabase
      .from('group_members')
      .select('user_id, role')
      .eq('id', memberId)
      .single()

    if (!memberToRemove) {
      throw new Error('Member not found')
    }

    // Remove the member
    await groupRepo.removeMember(groupId, memberToRemove.user_id)

    // Log the removal
    await supabase.from('group_activity_logs').insert({
      group_id: groupId,
      actor_id: user.id,
      action: 'member_removed',
      details: `Member removed from group`,
      target_user: memberToRemove.user_id
    })

    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    return { success: true }
  } catch (error) {
    console.error('Error removing member:', error)
    return { error: error instanceof Error ? error.message : 'Failed to remove member' }
  }
}

// Add this new action
export async function createGroup(data: GroupSettings & { 
  organization_id: string,
  type: Database['public']['Enums']['group_type'],
  settings?: Json | null
}) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user has permission to create group
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    // Check if user is superadmin or organization admin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', data.organization_id)
      .single()

    if (!profile?.is_superadmin && (!orgMember || orgMember.role !== 'admin')) {
      throw new Error('Unauthorized - Only superadmins and organization admins can create groups')
    }
    
    // Create the group with required fields
    const group = await groupRepo.createGroup({
      organization_id: data.organization_id,
      name: data.name,
      type: data.type,
      visibility: data.visibility,
      description: data.description || null,
      max_members: data.max_members || null,
      settings: data.settings || null
    })

    // Just revalidate paths, don't redirect
    revalidatePath(`/superadmin/organizations/${data.organization_id}`)
    revalidatePath(`/superadmin/organizations/${data.organization_id}/groups`)
    
    return { data: group }
  } catch (error) {
    console.error('Error creating group:', {
      error,
      errorMessage: error instanceof Error ? error.message : 'Unknown error',
      errorStack: error instanceof Error ? error.stack : undefined,
      data
    })

    return { 
      error: error instanceof DalError && error.code === 'VALIDATION_ERROR'
        ? error.message
        : 'Failed to create group'
    }
  }
}

// Add this new action alongside your existing group actions

export async function addGroupMember(
  groupId: string,
  userId: string,
  role: Database['public']['Enums']['group_member_role']
) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the group and check permissions
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')
    
    // Check if user is superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    // Check if user is org admin/staff
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', group.organization_id)
      .single()

    // Check if user is group leader
    const userMember = group.members.find(m => m.user_id === user.id)
    const isGroupLeader = userMember?.role === 'leader'

    // Verify permissions
    const canAddMembers = 
      profile?.is_superadmin || 
      orgMember?.role === 'admin' ||
      orgMember?.role === 'staff' ||
      isGroupLeader

    if (!canAddMembers) {
      throw new Error('Unauthorized - Only superadmins, organization admins, staff, or group leaders can add members')
    }

    // Add the member
    await groupRepo.addMember(groupId, userId, {
      role,
      joined_at: new Date().toISOString(),
      status: 'active'
    })

    // Revalidate the group pages
    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error adding group member:', error)
    return { 
      error: error instanceof DalError && error.code === 'VALIDATION_ERROR'
        ? error.message
        : 'Failed to add member'
    }
  }
}

// Add these new actions
export async function removeGroupMember(groupId: string, userId: string) {
  try {
    const supabase = await createClient()
    const groupRepo = new GroupRepository(supabase)
    
    // Verify user is authenticated
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    // Get the group and check permissions
    const group = await groupRepo.getGroupWithMembers(groupId)
    if (!group) throw new Error('Group not found')

    // Check if user is superadmin
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_superadmin')
      .eq('id', user.id)
      .single()

    // Check if user is org admin/staff
    const { data: orgMember } = await supabase
      .from('organization_members')
      .select('role')
      .eq('user_id', user.id)
      .eq('organization_id', group.organization_id)
      .single()

    // Check if user is group leader
    const userMember = group.members.find(m => m.user_id === user.id)
    const isGroupLeader = userMember?.role === 'leader'

    // Verify permissions
    const canRemoveMembers = 
      profile?.is_superadmin || 
      orgMember?.role === 'admin' ||
      orgMember?.role === 'staff' ||
      isGroupLeader

    if (!canRemoveMembers) {
      throw new Error('Unauthorized - Only superadmins, organization admins, staff, or group leaders can remove members')
    }

    // Remove the member
    await groupRepo.removeMember(groupId, userId)

    // Revalidate the group pages
    revalidatePath(`/org/[slug]/groups/${groupId}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error removing group member:', error)
    return { error: error instanceof Error ? error.message : 'Failed to remove member' }
  }
}

// Add this new function to delete an invitation
export async function deleteGroupInvitation(invitationId: string) {
  try {
    const supabase = await createServerUtils(true)
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')

    // Get the invitation to check permissions
    const { data: invitation, error: fetchError } = await supabase
      .from('group_invitations')
      .select('group_id, status')
      .eq('id', invitationId)
      .single()

    if (fetchError) throw fetchError
    if (!invitation) throw new Error('Invitation not found')
    if (invitation.status !== 'pending') throw new Error('Invitation is no longer pending')

    // Use the centralized permission check
    const hasPermission = await checkPermission(
      currentUser.id,
      'delete',
      'group',
      invitation.group_id
    )

    if (!hasPermission) {
      throw new Error('Unauthorized - Insufficient permissions to delete invitations')
    }

    // Update the invitation status to cancelled
    const { error: updateError } = await supabase
      .from('group_invitations')
      .update({ 
        status: 'cancelled',
        used_at: new Date().toISOString()
      })
      .eq('id', invitationId)

    if (updateError) throw updateError

    // Revalidate relevant paths
    revalidatePath(`/org/[slug]/groups/${invitation.group_id}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error cancelling invitation:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to cancel invitation'
    }
  }
}

// Add this new function to resend an invitation
export async function resendGroupInvitation(invitationId: string) {
  try {
    const supabase = await createServerUtils(true)
    const currentUser = await getCurrentUser()
    if (!currentUser) throw new Error('Not authenticated')

    type InvitationDetails = Database['public']['Tables']['group_invitations']['Row'] & {
      groups: {
        name: string
        organizations: {
          name: string
        }
      }
      invited_user_profile: {
        email: string
        full_name: string | null
      }
      invited_by_profile: {
        email: string
        full_name: string | null
      }
    }

    // Get the invitation with all needed details
    const { data: invitation, error: fetchError } = await supabase
      .from('group_invitations')
      .select(`
        *,
        groups!inner (
          name,
          organizations!inner (
            name
          )
        ),
        invited_user_profile:profiles!group_invitations_invited_user_fkey (
          email,
          full_name
        ),
        invited_by_profile:profiles!group_invitations_invited_by_fkey (
          email,
          full_name
        )
      `)
      .eq('id', invitationId)
      .eq('status', 'pending')
      .single<InvitationDetails>()

    if (fetchError) {
      console.error('Error fetching invitation:', fetchError)
      throw fetchError
    }

    if (!invitation) throw new Error('Invitation not found')
    if (invitation.status !== 'pending') throw new Error('Invitation is no longer pending')

    // Check permissions
    const hasPermission = await checkPermission(
      currentUser.id,
      'update',
      'group',
      invitation.group_id
    )

    if (!hasPermission) {
      throw new Error('Unauthorized - Insufficient permissions to resend invitations')
    }

    // Update the invitation expiration
    const newExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    const { error: updateError } = await supabase
      .from('group_invitations')
      .update({ expires_at: newExpiresAt })
      .eq('id', invitationId)
      .eq('status', 'pending')

    if (updateError) throw updateError

    // Resend the invitation email
    const acceptUrl = `${process.env.NEXT_PUBLIC_SITE_URL}/invitations/${invitation.token}`
    await sendEmail({
      to: invitation.invited_user_profile.email,
      subject: `Invitation to join ${invitation.groups.name} (Resent)`,
      html: getGroupInvitationEmailContent({
        invitedByName: invitation.invited_by_profile.full_name || invitation.invited_by_profile.email,
        groupName: invitation.groups.name,
        organizationName: invitation.groups.organizations.name,
        acceptUrl
      })
    })

    // Revalidate relevant paths
    revalidatePath(`/org/[slug]/groups/${invitation.group_id}`, 'page')
    
    return { success: true }
  } catch (error) {
    console.error('Error resending invitation:', error)
    return { 
      error: error instanceof Error ? error.message : 'Failed to resend invitation'
    }
  }
}
