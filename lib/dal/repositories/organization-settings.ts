import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { Json } from '@/database.types'

type OrganizationSetting = Database['public']['Tables']['organization_settings']['Row']

export class OrganizationSettingsRepository extends BaseRepository<'organization_settings'> {
  protected tableName = 'organization_settings' as const
  protected organizationField = 'organization_id' as const

  async getSettings(organizationId: string): Promise<Record<string, Json>> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('key, value')
        .eq('organization_id', organizationId)

      if (error) throw error

      return (data || []).reduce((acc, { key, value }) => ({
        ...acc,
        [key]: value
      }), {})
    } catch (error) {
      throw this.handleError(error, 'getSettings')
    }
  }

  async setSetting(organizationId: string, key: string, value: Json): Promise<void> {
    try {
      const { error } = await this.supabase
        .from(this.tableName)
        .upsert({
          organization_id: organizationId,
          key,
          value,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'organization_id,key'
        })

      if (error) throw error
    } catch (error) {
      throw this.handleError(error, 'setSetting')
    }
  }

  async setSettings(organizationId: string, settings: Record<string, Json>): Promise<void> {
    try {
      const values = Object.entries(settings).map(([key, value]) => ({
        organization_id: organizationId,
        key,
        value,
        updated_at: new Date().toISOString()
      }))

      const { error } = await this.supabase
        .from(this.tableName)
        .upsert(values, {
          onConflict: 'organization_id,key'
        })

      if (error) throw error
    } catch (error) {
      throw this.handleError(error, 'setSettings')
    }
  }
} 