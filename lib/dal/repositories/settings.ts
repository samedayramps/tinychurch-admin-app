import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import { DalError } from '../errors'

type OrganizationRow = Database['public']['Tables']['organizations']['Row']
type JsonValue = string | number | boolean | null | JsonValue[] | { [key: string]: JsonValue }
type Json = JsonValue

interface OrganizationSettings {
  features_enabled?: string[]
  branding?: {
    logo_url?: string
    primary_color?: string
    [key: string]: unknown
  }
  email_templates?: Record<string, unknown>
  [key: string]: unknown
}

export class SettingsRepository extends BaseRepository<'organizations'> {
  protected tableName = 'organizations' as const
  protected organizationField = 'id' as keyof OrganizationRow

  async getSettings(): Promise<OrganizationSettings> {
    if (!this.context?.organizationId) {
      throw DalError.operationFailed('getSettings', 'Organization ID required')
    }

    const { data, error } = await this.baseQuery()
      .eq('id', this.context.organizationId)
      .select('settings')
      .single()

    if (error) throw error
    return (data?.settings || {}) as OrganizationSettings
  }

  async updateSettings(
    updates: Partial<OrganizationSettings>,
    options: { merge?: boolean } = {}
  ): Promise<void> {
    if (!this.context?.organizationId) {
      throw DalError.operationFailed('updateSettings', 'Organization ID required')
    }

    let newSettings: Json
    if (options.merge) {
      const currentSettings = await this.getSettings()
      newSettings = {
        ...currentSettings,
        ...updates
      } as Json
    } else {
      newSettings = updates as Json
    }

    await this.update(this.context.organizationId, {
      settings: newSettings
    })
  }

  async getFeatureFlags(): Promise<string[]> {
    const settings = await this.getSettings()
    return settings.features_enabled || []
  }

  async updateFeatureFlags(features: string[]): Promise<void> {
    const settings = await this.getSettings()
    await this.updateSettings({
      ...settings,
      features_enabled: features
    })
  }

  async getBranding(): Promise<OrganizationSettings['branding']> {
    const settings = await this.getSettings()
    return settings.branding || {}
  }

  async getEmailTemplates(): Promise<OrganizationSettings['email_templates']> {
    const settings = await this.getSettings()
    return settings.email_templates || {}
  }
} 