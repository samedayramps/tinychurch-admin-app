// lib/dal/repositories/audit-log.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'
import { DalError } from '../errors'

type ActivityLogRow = Database['public']['Tables']['user_activity_logs']['Row']
type ActivityLogInsert = Database['public']['Tables']['user_activity_logs']['Insert']

export class AuditLogRepository extends BaseRepository<'user_activity_logs'> {
  protected tableName = 'user_activity_logs' as const
  protected organizationField = 'organization_id' as keyof ActivityLogRow

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {
    super(supabase, context)
  }

  async create(data: Omit<ActivityLogInsert, 'id' | 'created_at'>): Promise<ActivityLogRow> {
    try {
      const { data: log, error } = await this.supabase
        .from(this.tableName)
        .insert(data)
        .select()
        .single()

      if (error) throw error
      return log
    } catch (error) {
      throw this.handleError(error, 'create')
    }
  }

  async findByOrganization(organizationId: string): Promise<ActivityLogRow[]> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('organization_id', organizationId)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findByOrganization')
    }
  }

  async findByCategory(category: string, options?: { limit?: number }): Promise<ActivityLogRow[]> {
    try {
      let query = this.baseQuery()
        .eq('event_type', category)
        .order('created_at', { ascending: false })

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findByCategory')
    }
  }
}