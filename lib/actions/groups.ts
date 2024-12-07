'use server'

import { createClient } from '@/lib/utils/supabase/server'
import { GroupRepository } from '@/lib/dal/repositories/group'
import { revalidatePath } from 'next/cache'
import { getCurrentUser } from '@/lib/dal'
import type { Database } from '@/database.types'
import type { Json } from '@/database.types'
import { DalError } from '@/lib/dal/errors'

type GroupSettings = {
  name: string
  description?: string | null
  visibility: Database['public']['Enums']['group_visibility']
  max_members?: number | null
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
    revalidatePath(`/org/[slug]/groups/${groupId}`)
    
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
    revalidatePath(`/org/[slug]/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error('Error processing join request:', error)
    return { error: error instanceof Error ? error.message : 'Failed to process request' }
  }
}

// Invite a user to join the group
export async function inviteToGroup(
  groupId: string,
  email: string,
  role: 'member' | 'leader' = 'member'
) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')

    // Get invitee's user ID from email
    const { data: invitee } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single()

    if (!invitee) {
      throw new Error('User not found')
    }

    // Check if already a member
    const { data: existingMember } = await supabase
      .from('group_members')
      .select('id')
      .eq('group_id', groupId)
      .eq('user_id', invitee.id)
      .is('deleted_at', null)
      .single()

    if (existingMember) {
      throw new Error('User is already a member of this group')
    }

    // Create group invitation
    const { error: inviteError } = await supabase
      .from('group_invitations')
      .insert({
        group_id: groupId,
        invited_by: user.id,
        invited_user: invitee.id,
        role: role,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
      })

    if (inviteError) throw inviteError

    // TODO: Send email notification

    revalidatePath(`/org/[slug]/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error('Error inviting user to group:', error)
    return { error: error instanceof Error ? error.message : 'Failed to send invitation' }
  }
}

// Update member role
export async function updateMemberRole(
  groupId: string,
  memberId: string,
  newRole: 'member' | 'leader'
) {
  try {
    const supabase = await createClient()
    const user = await getCurrentUser()
    if (!user) throw new Error('Not authenticated')
    
    // Verify user has permission
    const { data: currentMember } = await supabase
      .from('group_members')
      .select('role')
      .eq('group_id', groupId)
      .eq('user_id', user.id)
      .single()

    if (!currentMember || currentMember.role !== 'leader') {
      throw new Error('Unauthorized - Only group leaders can modify roles')
    }

    // Update member's role
    const { error: updateError } = await supabase
      .from('group_members')
      .update({
        role: newRole,
        updated_at: new Date().toISOString()
      })
      .eq('id', memberId)

    if (updateError) throw updateError

    // Log the role change
    await supabase.from('group_activity_logs').insert({
      group_id: groupId,
      actor_id: user.id,
      action: 'role_change',
      details: `Member role updated to ${newRole}`,
      target_user: memberId
    })

    revalidatePath(`/org/[slug]/groups/${groupId}`)
    return { success: true }
  } catch (error) {
    console.error('Error updating member role:', error)
    return { error: error instanceof Error ? error.message : 'Failed to update role' }
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

    // Prevent removing the last leader
    if (memberToRemove.role === 'leader') {
      const leaders = group.members.filter(m => m.role === 'leader')
      if (leaders.length <= 1) {
        throw new Error('Cannot remove the last group leader')
      }
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

    revalidatePath(`/org/[slug]/groups/${groupId}`)
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
