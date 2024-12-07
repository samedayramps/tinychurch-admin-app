import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { Json } from '@/database.types'
import { DalError } from '../errors'
import { PostgrestError } from '@supabase/supabase-js'

// Type definitions
type BaseGroup = Database['public']['Tables']['groups']['Row']
type BaseGroupMember = Database['public']['Tables']['group_members']['Row']
type BaseProfile = Database['public']['Tables']['profiles']['Row']

// Type for Supabase count aggregation
type CountResult = {
  count: number
}

// Update GroupMember type to match what's used in components
export type GroupMember = {
  id: string
  user_id: string
  group_id: string
  role: Database['public']['Enums']['group_member_role']
  status: string
  joined_at: string | null
  deleted_at: string | null
  notifications_enabled: boolean | null
  profile: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export type Group = Omit<BaseGroup, 'members'> & {
  members?: CountResult
}

export type GroupWithCount = Omit<Group, 'members'> & {
  members_count: number
}

export type GroupType = Database['public']['Enums']['group_type']
export type GroupVisibility = Database['public']['Enums']['group_visibility']
export type GroupMemberRole = Database['public']['Enums']['group_member_role']

export interface GroupWithMembers extends Omit<Group, 'members'> {
  members: GroupMember[]
}

export interface GroupSettings {
  allow_join_requests?: boolean
  require_approval?: boolean
  notifications_enabled?: boolean
  custom_fields?: Record<string, Json>
  meeting_schedule?: {
    day?: string
    time?: string
    frequency?: string
    location?: string
  }
  contact_info?: {
    email?: string
    phone?: string
  }
  [key: string]: unknown
}

// Add this type at the top of the file
export interface GroupWithStats extends Omit<BaseGroup, 'settings'> {
  memberCount: number
  settings: Record<string, Json> | null
}

export interface GroupWithOrganization extends BaseGroup {
  members_count: number
  organization: {
    name: string
    slug: string
  }
}

export interface GroupJoinRequest {
  id: string
  group_id: string
  user_id: string
  status: string
  requested_at: string
  processed_at: string | null
  processed_by: string | null
  message: string | null
  user: {
    id: string
    email: string
    full_name: string | null
    avatar_url: string | null
  }
}

export interface GroupWithDetails extends Omit<BaseGroup, 'settings'> {
  settings: GroupSettings | null
  members: GroupMember[]
  stats: {
    total_members: number
    active_members: number
    pending_requests: number
  }
  metadata?: {
    last_meeting?: string
    next_meeting?: string
    created_by?: string
    updated_by?: string
  }
}

// Add Profile type from database types
type Profile = Pick<Database['public']['Tables']['profiles']['Row'], 
  'id' | 'email' | 'full_name' | 'avatar_url'
>

export class GroupRepository extends BaseRepository<'groups'> {
  protected tableName = 'groups' as const
  protected organizationField = 'organization_id' as keyof BaseGroup

  async findWithStats(id: string): Promise<GroupWithStats | null> {
    try {
      const [group, memberCount] = await Promise.all([
        this.findById(id),
        this.getMemberCount(id)
      ])

      if (!group) return null

      // Convert settings to the correct type
      const settings = typeof group.settings === 'object' && group.settings !== null
        ? group.settings as Record<string, Json>
        : null

      return {
        ...group,
        settings,
        memberCount
      }
    } catch (error) {
      throw this.handleError(error, 'findWithStats')
    }
  }

  private async getMemberCount(groupId: string): Promise<number> {
    const { count } = await this.supabase
      .from('group_members')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', groupId)
      .eq('status', 'active')

    return count || 0
  }

  async createGroup(data: {
    organization_id: string
    name: string
    description?: string | null
    type: GroupType
    visibility: GroupVisibility
    max_members?: number | null
    settings?: Json | null
  }): Promise<Group> {
    try {
      // Check if group name already exists in organization
      const { data: existingGroup } = await this.supabase
        .from(this.tableName)
        .select('id')
        .eq('organization_id', data.organization_id)
        .eq('name', data.name)
        .maybeSingle()

      if (existingGroup) {
        throw new DalError(
          `A group named "${data.name}" already exists in this organization`,
          'VALIDATION_ERROR'
        )
      }

      const { data: group, error } = await this.supabase
        .from(this.tableName)
        .insert({
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('*')
        .single()

      if (error) {
        if (error.code === '23505') {
          throw new DalError(
            `A group named "${data.name}" already exists in this organization`,
            'VALIDATION_ERROR'
          )
        }
        throw error
      }

      return group
    } catch (error) {
      if (error instanceof DalError) {
        throw error
      }
      throw this.handleError(error, 'createGroup')
    }
  }

  async findByOrganization(organizationId: string): Promise<GroupWithCount[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          group_members(count)
        `)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('name')

      if (error) throw error

      return (data || []).map(group => ({
        ...group,
        members_count: group.group_members?.[0]?.count || 0
      }))
    } catch (error) {
      throw this.handleError(error, 'findByOrganization')
    }
  }

  // Get all groups for an organization
  async getOrganizationGroups(organizationId: string): Promise<GroupWithCount[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          members:group_members(count)
        `)
        .eq('organization_id', organizationId)
        .is('deleted_at', null)
        .order('name')

      if (error) throw error
      
      return (data || []).map(group => ({
        ...group,
        members_count: ((group.members as unknown as CountResult[])[0]?.count) ?? 0
      }))
    } catch (error) {
      throw this.handleError(error, 'getOrganizationGroups')
    }
  }

  // Get a single group with its members
  async getGroupWithMembers(groupId: string): Promise<GroupWithMembers | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          members:group_members(
            id,
            user_id,
            group_id,
            role,
            status,
            joined_at,
            deleted_at,
            notifications_enabled,
            profile:profiles(
              id,
              email,
              full_name,
              avatar_url
            )
          )
        `)
        .eq('id', groupId)
        .is('deleted_at', null)
        .single()

      if (error) {
        console.error('Error in getGroupWithMembers:', error)
        throw this.handleError(error, 'getGroupWithMembers')
      }

      if (!data) {
        return null
      }

      // Transform and validate the members data
      const members = (data.members || [])
        .filter((m: any) => m !== null && typeof m === 'object')
        .map((m: any): GroupMember => ({
          id: m.id,
          user_id: m.user_id,
          group_id: m.group_id,
          role: m.role,
          status: m.status,
          joined_at: m.joined_at,
          deleted_at: m.deleted_at,
          notifications_enabled: m.notifications_enabled,
          profile: {
            id: m.profile.id,
            email: m.profile.email,
            full_name: m.profile.full_name,
            avatar_url: m.profile.avatar_url
          }
        }))

      return {
        ...data,
        members
      }
    } catch (error) {
      console.error('Error fetching group with members:', error)
      throw this.handleError(error, 'getGroupWithMembers')
    }
  }

  // Add a member to a group
  async addMember(
    groupId: string, 
    userId: string, 
    role: GroupMemberRole = 'member'
  ): Promise<string> {
    try {
      const { data, error } = await this.supabase
        .rpc('add_group_member', {
          p_group_id: groupId,
          p_user_id: userId,
          p_role: role
        })

      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error, 'addMember')
    }
  }

  // Update a group's details
  async updateGroup(
    groupId: string,
    updates: Partial<Omit<Group, 'id' | 'organization_id' | 'created_at'>>
  ): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', groupId)

      if (error) throw error
    } catch (error) {
      throw this.handleError(error, 'updateGroup')
    }
  }

  // Remove a member from a group
  async removeMember(groupId: string, userId: string): Promise<void> {
    try {
      const { error } = await this.supabase
        .from('group_members')
        .update({ 
          deleted_at: new Date().toISOString(),
          status: 'inactive'
        })
        .eq('group_id', groupId)
        .eq('user_id', userId)

      if (error) throw error
    } catch (error) {
      throw this.handleError(error, 'removeMember')
    }
  }

  // Get pending join requests for a group
  async getPendingRequests(groupId: string): Promise<GroupJoinRequest[]> {
    try {
      const { data, error } = await this.supabase
        .from('group_join_requests')
        .select(`
          id,
          group_id,
          user_id,
          status,
          requested_at,
          processed_at,
          processed_by,
          message,
          user:profiles!user_id(
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('group_id', groupId)
        .eq('status', 'pending')
        .order('requested_at', { ascending: false })

      if (error) {
        console.error('Error fetching pending requests:', error)
        throw this.handleError(error, 'getPendingRequests')
      }

      return (data || []).map((request: any): GroupJoinRequest => ({
        id: request.id,
        group_id: request.group_id,
        user_id: request.user_id,
        status: request.status,
        requested_at: request.requested_at || new Date().toISOString(),
        processed_at: request.processed_at,
        processed_by: request.processed_by,
        message: request.message,
        user: {
          id: request.user.id,
          email: request.user.email,
          full_name: request.user.full_name,
          avatar_url: request.user.avatar_url
        }
      }))
    } catch (error) {
      if (error instanceof DalError) {
        throw error
      }
      throw this.handleError(error as Error, 'getPendingRequests')
    }
  }

  // Process a join request
  async processJoinRequest(
    requestId: string,
    status: 'approved' | 'rejected',
    processorId: string
  ): Promise<boolean> {
    try {
      const { data, error } = await this.supabase
        .rpc('process_join_request', {
          p_request_id: requestId,
          p_status: status,
          p_processor_id: processorId
        })

      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error, 'processJoinRequest')
    }
  }

  // Update the return type and implementation of getAllGroups
  async getAllGroups(): Promise<GroupWithOrganization[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          members:group_members(count),
          organization:organizations(name, slug)
        `)
        .is('deleted_at', null)
        .order('name')

      if (error) throw error
      
      return (data || []).map(group => {
        const membersCount = (group.members?.[0] as CountResult)?.count ?? 0
        const { members, ...groupWithoutMembers } = group
        
        return {
          ...groupWithoutMembers,
          members_count: membersCount,
          organization: group.organization as { name: string; slug: string }
        }
      })
    } catch (error) {
      throw this.handleError(error, 'getAllGroups')
    }
  }

  // Update getInvitableMembers to use proper types
  async getInvitableMembers(groupId: string, organizationId: string): Promise<Profile[]> {
    try {
      const { data: orgMembers, error: orgError } = await this.supabase
        .from('organization_members')
        .select(`
          user_id,
          profile:profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('organization_id', organizationId)
        .eq('status', 'active')
        .is('deleted_at', null)

      if (orgError) throw orgError

      const { data: groupMembers, error: groupError } = await this.supabase
        .from('group_members')
        .select('user_id')
        .eq('group_id', groupId)
        .is('deleted_at', null)

      if (groupError) throw groupError

      const groupMemberIds = groupMembers?.map(m => m.user_id) || []
      const invitableMembers = (orgMembers || [])
        .filter(m => !groupMemberIds.includes(m.user_id))
        .map(m => m.profile)
        .filter((profile): profile is NonNullable<Profile> => profile !== null)

      return invitableMembers
    } catch (error) {
      console.error('Error in getInvitableMembers:', error)
      throw this.handleError(error, 'getInvitableMembers')
    }
  }

  // Update error handling to match BaseRepository
  protected handleError(error: unknown, operation: string): never {
    if (typeof error === 'string') {
      throw DalError.operationFailed(operation, new Error(error))
    }
    throw DalError.operationFailed(operation, error)
  }
}