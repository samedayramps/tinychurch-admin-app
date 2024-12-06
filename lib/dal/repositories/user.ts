// lib/dal/repositories/user.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'

type ProfileRow = Database['public']['Tables']['profiles']['Row']

export class UserRepository extends BaseRepository<'profiles'> {
  protected tableName = 'profiles' as const
  protected organizationField = undefined

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {
    super(supabase, context)
  }

  async findByEmail(email: string): Promise<ProfileRow | null> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('email', email)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error, 'findByEmail')
    }
  }

  async findAll(): Promise<ProfileRow[]> {
    try {
      const { data, error } = await this.baseQuery()
        .select('*')

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findAll')
    }
  }
}