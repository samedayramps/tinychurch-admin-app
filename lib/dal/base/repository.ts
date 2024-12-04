// lib/dal/base/repository.ts
import { SupabaseClient } from '@supabase/supabase-js'
import { ICacheManager, getCache } from '../cache'
import { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import { TenantContext } from '../context/TenantContext'
import { DalError } from '../errors/DalError'
import type { Database } from '@/database.types'
import { IRepository } from './repository-interface'
import { PerformanceMonitor, type OperationMetrics } from '../monitoring/PerformanceMonitor'

export interface BaseEntity extends Record<string, unknown> {
  id: string
  created_at?: string | null
  updated_at?: string | null
  deleted_at?: string | null
}

export interface QueryOptions {
  includeSoftDeleted?: boolean
  cacheTime?: number
  trx?: SupabaseClient<Database>
}

type Tables = Database['public']['Tables']
type DbTableName = keyof Tables
type TableName = DbTableName | 'events'

type TableTypes<T extends TableName> = T extends DbTableName 
  ? {
      Row: Tables[T]['Row']
      Insert: Tables[T]['Insert']
      Update: Tables[T]['Update']
    }
  : {
      Row: Record<string, unknown>
      Insert: Record<string, unknown>
      Update: Record<string, unknown>
    }

export abstract class BaseRepository<T extends BaseEntity> implements IRepository<T> {
  protected abstract tableName: TableName
  protected abstract organizationField?: string
  private readonly monitor = PerformanceMonitor.getInstance()
  protected readonly cache: ICacheManager

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {
    this.cache = getCache()
  }

  protected async measureOperation<R>(
    operation: string,
    callback: () => Promise<R>
  ): Promise<R> {
    const start = performance.now()
    try {
      return await callback()
    } finally {
      const duration = performance.now() - start
      this.monitor.track(this.getOperationName(operation), duration)
    }
  }

  protected async verifyAccess(action: 'read' | 'create' | 'update' | 'delete'): Promise<void> {
    if (!this.context) {
      throw new DalError(
        'No tenant context provided',
        'PERMISSION_DENIED'
      )
    }

    const hasAccess = await this.context.canAccess(this.tableName, action)
    if (!hasAccess) {
      throw new DalError(
        `Permission denied for ${action} on ${this.tableName}`,
        'PERMISSION_DENIED',
        this.context.organizationId
      )
    }
  }

  protected baseQuery(options: QueryOptions = {}) {
    const client = options.trx || this.supabase
    
    const query = (client
      .from(this.tableName as DbTableName)
      .select() as unknown) as PostgrestFilterBuilder<
        Database['public'],
        T,
        T[]
      >

    if (this.context?.organizationId && this.organizationField) {
      query.eq(this.organizationField, this.context.organizationId)
    }

    if (!options.includeSoftDeleted) {
      query.is('deleted_at', null)
    }

    return query
  }

  async findById(id: string, options: QueryOptions = {}): Promise<T | null> {
    await this.verifyAccess('read')
    
    return this.measureOperation('findById', async () => {
      try {
        const cacheKey = this.getCacheKey(id)
        if (options.cacheTime !== 0) {
          const cached = await this.cache.get<T>(cacheKey)
          if (cached) return cached
        }

        const { data } = await this.baseQuery(options)
          .eq('id', id)
          .maybeSingle()

        if (data && options.cacheTime !== 0) {
          await this.cache.set(cacheKey, data, options.cacheTime)
        }

        return data || null
      } catch (error) {
        throw new DalError(
          'Failed to fetch resource',
          'QUERY_ERROR',
          this.context?.organizationId,
          error as Error
        )
      }
    })
  }

  async create(data: Partial<T>, options: QueryOptions = {}): Promise<T> {
    await this.verifyAccess('create')
    
    return this.measureOperation('create', async () => {
      try {
        const timestamp = new Date().toISOString()
        
        const insertData = {
          ...data,
          created_at: timestamp,
          updated_at: timestamp,
          [this.organizationField!]: this.context?.organizationId
        } as unknown as TableTypes<TableName>['Insert']

        const { data: created, error } = await (this.baseQuery(options) as any)
          .insert(insertData)
          .select()
          .single()

        if (error) throw error

        await this.invalidateCache()
        return created as T
      } catch (error) {
        throw new DalError(
          'Failed to create resource',
          'QUERY_ERROR',
          this.context?.organizationId,
          error as Error
        )
      }
    })
  }

  async update(id: string, data: Partial<T>, options: QueryOptions = {}): Promise<T> {
    await this.verifyAccess('update')
    
    return this.measureOperation('update', async () => {
      try {
        const updateData = {
          ...data,
          updated_at: new Date().toISOString()
        }

        const { data: updated, error } = await (this.baseQuery(options) as any)
          .eq('id', id)
          .update(updateData as TableTypes<TableName>['Update'])
          .select()
          .single()

        if (error) throw error

        await this.invalidateCache(id)
        return updated as T
      } catch (error) {
        throw new DalError(
          'Failed to update resource',
          'QUERY_ERROR',
          this.context?.organizationId,
          error as Error
        )
      }
    })
  }

  async delete(id: string, options: QueryOptions = {}): Promise<void> {
    await this.verifyAccess('delete')
    
    return this.measureOperation('delete', async () => {
      try {
        const { error } = await (this.baseQuery(options) as any)
          .eq('id', id)
          .update({ 
            deleted_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          } as TableTypes<TableName>['Update'])

        if (error) throw error
        await this.invalidateCache(id)
      } catch (error) {
        throw new DalError(
          'Failed to delete resource',
          'QUERY_ERROR',
          this.context?.organizationId,
          error as Error
        )
      }
    })
  }

  async hardDelete(id: string, options: QueryOptions = {}): Promise<void> {
    await this.verifyAccess('delete')
    
    return this.measureOperation('hardDelete', async () => {
      try {
        const { error } = await (this.baseQuery(options) as any)
          .eq('id', id)
          .delete()

        if (error) throw error
        await this.invalidateCache(id)
      } catch (error) {
        throw new DalError(
          'Failed to delete resource',
          'QUERY_ERROR',
          this.context?.organizationId,
          error as Error
        )
      }
    })
  }

  protected getCacheKey(id: string): string {
    const prefix = this.context?.organizationId 
      ? `org:${this.context.organizationId}:${this.tableName}`
      : this.tableName
    return `${prefix}:${id}`
  }

  protected async invalidateCache(id?: string): Promise<void> {
    if (id) {
      await this.cache.del(this.getCacheKey(id))
    } else {
      const pattern = this.context?.organizationId 
        ? `org:${this.context.organizationId}:${this.tableName}`
        : this.tableName
      await this.cache.delPattern(pattern)
    }
  }

  getMetrics(): OperationMetrics | Map<string, OperationMetrics> | undefined {
    const repoName = this.constructor.name
    return this.monitor.getMetrics(repoName)
  }

  protected getOperationName(operation: string): string {
    const repoName = this.constructor.name
    return `${repoName}.${operation}`
  }
}