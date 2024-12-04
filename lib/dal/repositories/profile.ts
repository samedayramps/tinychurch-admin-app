import { BaseRepository } from '../base/repository'
import type { Profile } from './types'
import type { Database } from '@/database.types'

export class ProfileRepository extends BaseRepository<Profile> {
  protected tableName = 'profiles' as const
  protected organizationField = undefined // Profiles are not org-scoped

  async findWithOrganizations(userId: string) {
    const { data } = await (this.baseQuery() as any)
      .eq('id', userId)
      .select(`
        *,
        memberships:organization_members!inner (
          role,
          organizations!inner (
            id,
            name,
            slug
          )
        )
      `)
      .single()

    return data
  }

  async findByEmail(email: string) {
    const { data } = await (this.baseQuery() as any)
      .eq('email', email)
      .maybeSingle()

    return data
  }

  async updateLastActivity(userId: string) {
    await this.update(userId, {
      last_login: new Date().toISOString()
    })
  }

  async updateNotificationPreferences(
    userId: string, 
    preferences: Record<string, boolean>
  ) {
    await this.update(userId, {
      notification_preferences: preferences
    })
  }

  async updateTheme(userId: string, theme: string) {
    await this.update(userId, { theme })
  }
} 