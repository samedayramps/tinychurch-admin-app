// lib/dal/repositories/user.ts
import { BaseRepository } from '../base/repository'
import type { Profile } from './types'
import type { Database } from '@/database.types'

export class UserRepository extends BaseRepository<Profile> {
  protected tableName = 'profiles' as const
  protected organizationField = undefined // Users can belong to multiple orgs

  // Find by email
  async findByEmail(email: string): Promise<Profile | null> {
    const { data } = await this.baseQuery()
      .eq('email', email)
      .maybeSingle()

    return data || null
  }

  // Find superadmins
  async findSuperadmins(): Promise<Profile[]> {
    const { data } = await this.baseQuery()
      .eq('is_superadmin', true)

    return data || []
  }

  // Update last login
  async updateLastLogin(id: string): Promise<void> {
    await this.update(id, {
      last_login: new Date().toISOString()
    })
  }
}