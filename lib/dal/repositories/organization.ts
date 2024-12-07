// lib/dal/repositories/organization.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type{ Json } from '@/database.types'
import { DalError } from '../errors'
import { OrganizationSettingsRepository } from './organization-settings'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']
type OrganizationLimitRow = Database['public']['Tables']['organization_limits']['Row']

export interface OrganizationWithStats extends Omit<OrganizationRow, 'settings'> {
  memberCount: number
  settings: Record<string, Json> | null
}

export class OrganizationRepository extends BaseRepository<'organizations'> {
  protected tableName = 'organizations' as const
  protected organizationField = 'id' as keyof OrganizationRow

  async findBySlug(slug: string): Promise<OrganizationRow | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('slug', slug)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      throw DalError.operationFailed('findBySlug', error)
    }
  }

  async findWithStats(id: string): Promise<OrganizationWithStats | null> {
    try {
      const [org, settings, memberCount] = await Promise.all([
        this.findById(id),
        new OrganizationSettingsRepository(this.supabase).getSettings(id),
        this.getMemberCount(id)
      ])

      if (!org) return null

      return {
        ...org,
        memberCount,
        settings
      }
    } catch (error) {
      throw this.handleError(error, 'findWithStats')
    }
  }

  private async getMemberCount(organizationId: string): Promise<number> {
    const { count } = await this.supabase
      .from('organization_members')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)

    return count || 0
  }

  async findAll(): Promise<OrganizationWithStats[]> {
    try {
      const { data, error } = await this.baseQuery()
        .select(`
          *,
          organization_members(count)
        `)
        .order('name')

      if (error) throw error

      const orgsWithSettings = await Promise.all(
        (data || []).map(async (org) => {
          const settings = await new OrganizationSettingsRepository(this.supabase)
            .getSettings(org.id)

          return {
            ...org,
            memberCount: org.organization_members?.[0]?.count || 0,
            settings
          }
        })
      )

      return orgsWithSettings
    } catch (error) {
      throw DalError.operationFailed('findAll', error)
    }
  }

  async getStats(): Promise<{
    memberCount: number
    // Add other stats you want to track
  }> {
    try {
      const { data, error } = await this.baseQuery()
        .select(`
          *,
          organization_members(count)
        `)
        .single()

      if (error) throw error

      return {
        memberCount: data.organization_members?.[0]?.count || 0,
        // Add other stats here
      }
    } catch (error) {
      throw DalError.operationFailed('getStats', error)
    }
  }

  async findByLimits(resourceType: string): Promise<OrganizationLimitRow[]> {
    try {
      const { data, error } = await this.supabase
        .from('organization_limits')
        .select('*')
        .filter('resource_type', 'eq', resourceType)

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findByLimits')
    }
  }

  async findById(id: string): Promise<OrganizationRow | null>{
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      throw DalError.operationFailed('findById', error)
    }
  }
}