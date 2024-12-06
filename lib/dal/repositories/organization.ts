// lib/dal/repositories/organization.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import { DalError } from '../errors'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']
type OrganizationLimitRow = Database['public']['Tables']['organization_limits']['Row']

export interface OrganizationWithStats extends Omit<OrganizationRow, 'settings'> {
  memberCount: number
  settings: {
    features_enabled?: string[]
    [key: string]: any
  } | null
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
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select(`
          *,
          organization_members(count)
        `)
        .filter('id', 'eq', id)
        .single()

      if (error) throw error
      if (!data) return null

      return {
        ...data,
        memberCount: data.organization_members?.[0]?.count || 0,
        settings: typeof data.settings === 'string' 
          ? JSON.parse(data.settings)
          : data.settings
      }
    } catch (error) {
      throw DalError.operationFailed('findWithStats', error)
    }
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

      return (data || []).map(org => ({
        ...org,
        memberCount: org.organization_members?.[0]?.count || 0,
        settings: typeof org.settings === 'string' 
          ? JSON.parse(org.settings)
          : org.settings as {
              features_enabled?: string[]
              [key: string]: any
            } | null
      }))
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
}