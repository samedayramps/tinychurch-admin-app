// lib/dal/repositories/audit-log.ts
import { BaseRepository } from '../base/repository'
import type { Database } from '@/database.types'

type AuditLogRow = Database['public']['Tables']['audit_logs']['Row']
type AuditLogInsert = Database['public']['Tables']['audit_logs']['Insert']

export class AuditLogRepository extends BaseRepository<AuditLogRow> {
  protected tableName = 'audit_logs' as const
  protected organizationField = 'organization_id'

  async create(data: Omit<AuditLogInsert, 'id' | 'created_at'>) {
    await this.verifyAccess('create')
    
    return this.measureOperation('create', async () => {
      if (!this.context?.organizationId) {
        throw new Error('Organization ID is required')
      }

      const insertData: AuditLogInsert = {
        ...data,
        organization_id: this.context.organizationId,
        created_at: new Date().toISOString(),
        actor_id: data.actor_id || null,
        ip_address: null,
        user_agent: null,
        target_id: data.target_id || null,
        target_type: data.target_type || null,
        severity: data.severity || null,
        metadata: data.metadata || null
      }

      const { data: created, error } = await this.supabase
        .from(this.tableName)
        .insert(insertData)
        .select()
        .single()

      if (error) {
        throw error
      }

      return created
    })
  }

  async findByCategory(category: Database['public']['Enums']['audit_category'], options: {
    limit?: number
    filter?: Record<string, any>
  } = {}) {
    await this.verifyAccess('read')
    
    return this.measureOperation('findByCategory', async () => {
      if (!this.context?.organizationId) {
        throw new Error('Organization ID is required')
      }

      let query = this.supabase
        .from(this.tableName)
        .select('*')
        .eq('category', category)
        .eq('organization_id', this.context.organizationId)
        
      if (options.filter) {
        Object.entries(options.filter).forEach(([key, value]) => {
          query = query.eq(key, value)
        })
      }
      
      if (options.limit) {
        query = query.limit(options.limit)
      }

      const { data, error } = await query.order('created_at', { ascending: false })
      
      if (error) {
        throw error
      }

      return data
    })
  }

  async findRecent(limit = 10) {
    await this.verifyAccess('read')
    
    return this.measureOperation('findRecent', async () => {
      if (!this.context?.organizationId) {
        throw new Error('Organization ID is required')
      }

      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .eq('organization_id', this.context.organizationId)
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) {
        throw error
      }

      return data
    })
  }
}