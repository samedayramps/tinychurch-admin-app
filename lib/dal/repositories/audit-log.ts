// lib/dal/repositories/audit-log.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { TenantContext } from '../context/TenantContext'
import { DalError } from '../errors'
import type { DateRange } from 'react-day-picker'

type ActivityLogRow = Database['public']['Tables']['user_activity_logs']['Row']
type ActivityLogInsert = Database['public']['Tables']['user_activity_logs']['Insert']
type AuditEventType = Database['public']['Enums']['audit_event_type']

// Valid event categories matching the database enum
const VALID_CATEGORIES = [
  'auth',
  'data',
  'system',
  'security',
  'performance',
  'error',
  'user_action'
] as const satisfies readonly AuditEventType[]

type EventCategory = typeof VALID_CATEGORIES[number]

export class AuditLogRepository extends BaseRepository<'user_activity_logs'> {
  protected tableName = 'user_activity_logs' as const
  protected organizationField = 'organization_id' as keyof ActivityLogRow

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {
    super(supabase, context)
  }

  private validateCategory(category: string): asserts category is EventCategory {
    if (!VALID_CATEGORIES.includes(category as EventCategory)) {
      throw DalError.validationError('Invalid category', {
        category,
        validCategories: VALID_CATEGORIES
      })
    }
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

  async findByCategory(
    category: string,
    options: { limit?: number } = {}
  ): Promise<ActivityLogRow[]> {
    try {
      this.validateCategory(category)

      let query = this.baseQuery()
        .eq('event_type', category)
        .order('created_at', { ascending: false })

      if (options?.limit) {
        query = query.limit(options.limit)
      }

      console.log('Executing query:', {
        category,
        limit: options.limit,
        table: this.tableName
      })

      const { data, error } = await query

      if (error) {
        console.error('Database error in findByCategory:', {
          category,
          errorMessage: error.message,
          errorCode: error.code,
          details: error.details,
          hint: error.hint,
          queryParams: {
            category,
            limit: options.limit,
            table: this.tableName
          }
        })

        throw DalError.operationFailed('findByCategory', {
          category,
          error: error.message,
          details: error.details || 'Database query failed'
        })
      }

      console.log('Audit logs query result:', {
        category,
        count: data?.length || 0,
        firstLog: data?.[0]
      })

      return data || []
    } catch (error) {
      const errorDetails = {
        category,
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        context: error instanceof DalError ? error.context : undefined
      }
      
      console.error('Error in findByCategory:', errorDetails)

      if (error instanceof DalError) {
        throw error
      }

      throw DalError.operationFailed('findByCategory', {
        category,
        error: error instanceof Error ? error.message : 'Unknown error',
        details: 'Unexpected error occurred while fetching audit logs'
      })
    }
  }

  async findByFilters(filters: {
    category?: string
    search?: string
    dateRange?: DateRange | null
    severity?: string
    organizationId?: string
    correlationId?: string
    limit?: number
  }): Promise<ActivityLogRow[]> {
    try {
      let query = this.baseQuery()
        .order('created_at', { ascending: false })

      if (filters.category) {
        query = query.eq('event_type', filters.category)
      }

      if (filters.organizationId) {
        query = query.eq('organization_id', filters.organizationId)
      }

      if (filters.correlationId) {
        query = query.eq('metadata->correlation_id', filters.correlationId)
      }

      if (filters.search) {
        query = query.ilike('details', `%${filters.search}%`)
      }

      if (filters.dateRange?.from) {
        query = query.gte('created_at', filters.dateRange.from.toISOString())
      }

      if (filters.dateRange?.to) {
        query = query.lte('created_at', filters.dateRange.to.toISOString())
      }

      if (filters.severity && filters.severity !== 'all') {
        query = query.eq('severity', filters.severity)
      }

      if (filters.limit) {
        query = query.limit(filters.limit)
      }

      const { data, error } = await query

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findByFilters')
    }
  }

  async findRelatedLogs(log: ActivityLogRow): Promise<ActivityLogRow[]> {
    try {
      const correlationId = (log.metadata as any)?.correlation_id
      if (!correlationId) return []

      const { data, error } = await this.baseQuery()
        .eq('metadata->correlation_id', correlationId)
        .order('created_at', { ascending: true })

      if (error) throw error
      return data || []
    } catch (error) {
      throw this.handleError(error, 'findRelatedLogs')
    }
  }
}