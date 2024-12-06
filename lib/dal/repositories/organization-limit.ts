import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import { DalError } from '../errors'

type OrganizationLimitRow = Database['public']['Tables']['organization_limits']['Row']

export class OrganizationLimitRepository extends BaseRepository<'organization_limits'> {
  protected tableName = 'organization_limits' as const
  protected organizationField = 'organization_id' as keyof OrganizationLimitRow

  async getLimitsByType(resourceType: string): Promise<OrganizationLimitRow | null> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('resource_type', resourceType)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw DalError.operationFailed('getLimitsByType', error)
    }
  }

  async updateUsage(resourceType: string, currentUsage: number): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .update({ 
          current_usage: currentUsage,
          updated_at: new Date().toISOString()
        } as any)
        .eq('resource_type', resourceType)

      if (error) throw error
    } catch (error) {
      throw DalError.operationFailed('updateUsage', error)
    }
  }

  async checkLimit(resourceType: string, requestedAmount: number): Promise<boolean> {
    const limit = await this.getLimitsByType(resourceType)
    if (!limit) return true // No limit set

    const currentUsage = limit.current_usage || 0
    return currentUsage + requestedAmount <= limit.max_amount
  }

  async incrementUsage(resourceType: string, amount = 1): Promise<void> {
    const limit = await this.getLimitsByType(resourceType)
    if (!limit) return // No limit to update

    const currentUsage = limit.current_usage || 0
    await this.updateUsage(resourceType, currentUsage + amount)
  }

  async decrementUsage(resourceType: string, amount = 1): Promise<void> {
    const limit = await this.getLimitsByType(resourceType)
    if (!limit) return // No limit to update

    const currentUsage = limit.current_usage || 0
    const newUsage = Math.max(0, currentUsage - amount)
    await this.updateUsage(resourceType, newUsage)
  }
} 