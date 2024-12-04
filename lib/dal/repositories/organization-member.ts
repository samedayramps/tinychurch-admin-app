// lib/dal/repositories/organization-member.ts
import { BaseRepository } from '../base/repository'
import type { OrganizationMember } from './types'
import type { Database } from '@/database.types'

export class OrganizationMemberRepository extends BaseRepository<OrganizationMember> {
  protected tableName = 'organization_members' as const
  protected organizationField = 'organization_id'

  // Find member with profile
  async findMemberWithProfile(userId: string): Promise<OrganizationMember | null> {
    const { data } = await this.baseQuery()
      .eq('user_id', userId)
      .select(`
        *,
        profiles (*)
      `)
      .maybeSingle()

    return data || null
  }

  // Find members by role
  async findByRole(role: string): Promise<OrganizationMember[]> {
    const { data } = await this.baseQuery()
      .eq('role', role)
      .select(`
        *,
        profiles (
          id,
          email,
          full_name,
          avatar_url
        )
      `)

    return data || []
  }

  // Update member role
  async updateRole(userId: string, role: string): Promise<void> {
    await (this.baseQuery() as any)
      .eq('user_id', userId)
      .update({ role })
  }
}