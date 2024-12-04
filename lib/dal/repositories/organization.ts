// lib/dal/repositories/organization.ts
import { BaseRepository } from '../base/repository'
import type { Organization } from './types'
import type { Database } from '@/database.types'
import { DalError } from '../errors/DalError'
import { createClient } from '@/utils/supabase/server'

export class OrganizationRepository extends BaseRepository<Organization> {
  protected tableName = 'organizations' as const
  protected organizationField = 'id'

  // Find by slug with caching
  async findBySlug(slug: string): Promise<Organization | null> {
    await this.verifyAccess('read')
    
    return this.measureOperation('findBySlug', async () => {
      try {
        const cacheKey = `org:slug:${slug}`
        const cached = await this.cache.get<Organization>(cacheKey)
        if (cached) return cached

        const { data } = await this.baseQuery()
          .eq('slug', slug)
          .maybeSingle()

        if (data) {
          await this.cache.set(cacheKey, data)
        }

        return data || null
      } catch (error) {
        throw new DalError(
          'Failed to fetch organization',
          'QUERY_ERROR',
          this.context?.organizationId,
          error as Error
        )
      }
    })
  }

  // Get organization with member counts
  async findWithStats(id: string): Promise<Organization & { memberCount: number }> {
    return this.measureOperation('findWithStats', async () => {
      const { data } = await this.baseQuery()
        .eq('id', id)
        .select(`
          *,
          members:organization_members(count)
        `)
        .single()

      if (!data) {
        throw new DalError(
          'Organization not found',
          'RESOURCE_NOT_FOUND',
          this.context?.organizationId
        )
      }

      // Ensure required fields are present
      const organization: Organization = {
        id: data.id,
        name: data.name || '',
        slug: data.slug || '',
        created_at: data.created_at,
        updated_at: data.updated_at,
        deleted_at: data.deleted_at,
        settings: data.settings
      }

      return {
        ...organization,
        memberCount: data.members?.[0]?.count || 0
      }
    })
  }

  // Check if feature is enabled
  async hasFeature(id: string, feature: string): Promise<boolean> {
    return this.measureOperation('hasFeature', async () => {
      const { data } = await this.baseQuery()
        .eq('id', id)
        .select('settings')
        .single()

      if (!data?.settings) return false

      const settings = data.settings as { features?: string[] }
      return settings.features?.includes(feature) || false
    })
  }

  // Get organization statistics
  async getOrganizationStats() {
    return this.measureOperation('getOrganizationStats', async () => {
      const { data } = await this.baseQuery()
        .select(`
          id,
          name,
          members:organization_members(count),
          features:organization_features(count)
        `)
        .single()

      if (!data) {
        throw new DalError(
          'Failed to get organization stats',
          'RESOURCE_NOT_FOUND',
          this.context?.organizationId
        )
      }

      return {
        memberCount: data.members?.[0]?.count || 0,
        featureCount: data.features?.[0]?.count || 0,
        name: data.name,
        id: data.id
      }
    })
  }
}

// Create a function to get the repository instance
export async function getOrganizationRepository() {
  const supabase = await createClient()
  return new OrganizationRepository(supabase)
}

// Export convenience method
export async function getOrganizationStats() {
  const supabase = await createClient()
  
  // Get member count
  const { count: totalMembers } = await supabase
    .from('organization_members')
    .select('*', { count: 'exact', head: true })
    
  // Get ministries count
  const { count: totalMinistries } = await supabase
    .from('ministries')
    .select('*', { count: 'exact', head: true })
    
  // Get events count
  const { count: totalEvents } = await supabase
    .from('events')
    .select('*', { count: 'exact', head: true })
    
  // Get total attendance
  const { data: attendanceData } = await supabase
    .from('event_attendance')
    .select('count')
    
  const totalAttendance = attendanceData?.reduce((sum, record) => 
    sum + (record.count || 0), 0) || 0

  return {
    totalMembers: totalMembers || 0,
    totalMinistries: totalMinistries || 0,
    totalEvents: totalEvents || 0,
    totalAttendance: totalAttendance
  }
}

export async function getAllOrganizations() {
  const supabase = await createClient()
  
  const { data: organizations, error } = await supabase
    .from('organizations')
    .select('id, name')
    .order('name')
    
  if (error) {
    console.error('Error fetching organizations:', error)
    return null
  }
  
  return organizations
}