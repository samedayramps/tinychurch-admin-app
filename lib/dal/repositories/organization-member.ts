// lib/dal/repositories/organization-member.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { PostgrestResponse } from '@supabase/postgrest-js'

type OrganizationMemberRow = Database['public']['Tables']['organization_members']['Row']
type ProfileRow = Database['public']['Tables']['profiles']['Row']

export interface MemberWithProfile extends OrganizationMemberRow {
  profile: Pick<ProfileRow, 'id' | 'email' | 'full_name' | 'avatar_url'>
}

export class OrganizationMemberRepository extends BaseRepository<'organization_members'> {
  protected tableName = 'organization_members' as const
  protected organizationField = 'organization_id' as const

  async findByRole(role: Database['public']['Enums']['user_role']): Promise<MemberWithProfile[]> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('role', role)
        .select(`
          *,
          profile:profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .throwOnError() as PostgrestResponse<MemberWithProfile>

      return data ?? []
    } catch (error) {
      throw this.handleError(error, 'findByRole')
    }
  }

  async findByOrganization(organizationId: string): Promise<MemberWithProfile[]> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('organization_id', organizationId)
        .select(`
          *,
          profile:profiles!inner (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .throwOnError() as PostgrestResponse<MemberWithProfile>

      return data ?? []
    } catch (error) {
      throw this.handleError(error, 'findByOrganization')
    }
  }
}