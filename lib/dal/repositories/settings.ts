import { BaseRepository } from '../base/repository'
import type { OrganizationSettings } from './types'
import type { Database } from '@/database.types'

export class SettingsRepository extends BaseRepository<OrganizationSettings> {
  protected tableName = 'organizations' as const
  protected organizationField = 'id'

  async getSettings() {
    if (!this.context?.organizationId) {
      throw new Error('Organization ID required')
    }

    const { data } = await (this.baseQuery() as any)
      .eq('id', this.context.organizationId)
      .select('settings')
      .single()

    return data?.settings || {}
  }

  async updateSettings(
    updates: Partial<OrganizationSettings['settings']>,
    options: { merge?: boolean } = {}
  ) {
    if (!this.context?.organizationId) {
      throw new Error('Organization ID required')
    }

    if (options.merge) {
      // Merge with existing settings
      const current = await this.getSettings()
      updates = {
        ...current,
        ...updates
      }
    }

    await (this.baseQuery() as any)
      .eq('id', this.context.organizationId)
      .update({ settings: updates })
  }

  async getFeatureFlags() {
    const settings = await this.getSettings()
    return settings.features_enabled || []
  }

  async updateFeatureFlags(features: string[]) {
    const settings = await this.getSettings()
    await this.updateSettings({
      ...settings,
      features_enabled: features
    })
  }

  async getBranding() {
    const settings = await this.getSettings()
    return settings.branding || {}
  }

  async getEmailTemplates() {
    const settings = await this.getSettings()
    return settings.email_templates || {}
  }
} 