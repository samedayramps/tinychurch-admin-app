import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import { DalError } from '../errors'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export class ProfileRepository extends BaseRepository<'profiles'> {
  protected tableName = 'profiles' as const
  protected organizationField = undefined

  async findWithOrganizations(userId: string) {
    try {
      const { data, error } = await this.baseQuery()
        .eq('id', userId)
        .select(`
          *,
          organization_members!inner (
            role,
            organizations!inner (
              id,
              name,
              slug
            )
          )
        `)
        .single()

      if (error) throw error
      return data as ProfileRow & {
        organization_members: Array<{
          role: Database['public']['Enums']['user_role']
          organizations: {
            id: string
            name: string
            slug: string
          }
        }>
      }
    } catch (error) {
      throw DalError.operationFailed('findWithOrganizations', error)
    }
  }

  async findByEmail(email: string): Promise<ProfileRow | null> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('email', email)
        .maybeSingle()

      if (error) throw error
      return data
    } catch (error) {
      throw DalError.operationFailed('findByEmail', error)
    }
  }

  async updateLastActivity(userId: string): Promise<void> {
    await this.supabase
      .from(this.tableName)
      .update({
        last_login: new Date().toISOString()
      })
      .eq('id', userId)
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: NonNullable<ProfileRow['notification_preferences']>
  ): Promise<void> {
    await this.update(userId, {
      notification_preferences: preferences
    })
  }

  async updateProfile(userId: string, data: Partial<ProfileRow>) {
    try {
      const { data: profile, error } = await this.supabase
        .from(this.tableName)
        .update(data)
        .eq('id', userId)
        .select()
        .single()

      if (error) throw error
      return profile
    } catch (error) {
      throw this.handleError(error, 'updateProfile')
    }
  }
} 