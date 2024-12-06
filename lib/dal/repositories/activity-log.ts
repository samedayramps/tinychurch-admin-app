import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'

type ActivityLog = Database['public']['Tables']['activity_logs']['Row']

export class ActivityLogRepository extends BaseRepository<'activity_logs'> {
  protected tableName = 'activity_logs' as const
  protected organizationField = 'organization_id' as keyof ActivityLog

  async getRecent(options: {
    organizationId?: string
    userId?: string
    limit?: number
  }): Promise<ActivityLog[]> {
    try {
      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false })

      if (options.organizationId) {
        query = query.eq('organization_id', options.organizationId)
      }

      if (options.userId) {
        query = query.eq('user_id', options.userId)
      }

      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      console.error('Error fetching activity logs:', error)
      return []
    }
  }
} 