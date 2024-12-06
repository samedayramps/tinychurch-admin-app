// lib/dal/base/repository.ts
import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { 
  PostgrestFilterBuilder,
  PostgrestBuilder,
  PostgrestResponse,
  PostgrestSingleResponse
} from '@supabase/postgrest-js'
import { TenantContext } from '../context/TenantContext'
import { DalError } from '../errors'

type Tables = Database['public']['Tables']
type TableName = keyof Tables
type TableRow<T extends TableName> = Tables[T]['Row']
type TableInsert<T extends TableName> = Tables[T]['Insert']
type TableUpdate<T extends TableName> = Tables[T]['Update']

type QueryBuilder<T extends TableName> = PostgrestFilterBuilder<
  Database['public'],
  TableRow<T>,
  TableRow<T>[]
>

export abstract class BaseRepository<T extends TableName> {
  protected abstract tableName: T
  protected abstract organizationField?: keyof TableRow<T>

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {}

  protected baseQuery(): QueryBuilder<T> {
    const query = this.supabase
      .from(this.tableName)
      .select() as PostgrestFilterBuilder<Database['public'], TableRow<T>, TableRow<T>[]>

    if (this.organizationField && this.context?.organizationId) {
      return query.eq(
        this.organizationField as string,
        this.context.organizationId
      )
    }

    return query
  }

  async findById(id: string): Promise<TableRow<T> | null> {
    try {
      const { data, error } = await this.baseQuery()
        .eq('id', id)
        .single() as PostgrestSingleResponse<TableRow<T>>

      if (error) throw error
      return data
    } catch (error) {
      throw this.handleError(error, 'findById')
    }
  }

  async create(data: TableInsert<T>): Promise<TableRow<T>> {
    try {
      const { data: created, error } = await this.supabase
        .from(this.tableName)
        .insert(data as any)
        .select()
        .single() as PostgrestSingleResponse<TableRow<T>>

      if (error) throw error
      if (!created) throw new Error('No data returned from insert')
      
      return created
    } catch (error) {
      throw this.handleError(error, 'create')
    }
  }

  async update(id: string, data: Partial<TableUpdate<T>>): Promise<TableRow<T>> {
    try {
      const { data: updated, error } = await this.supabase
        .from(this.tableName)
        .update(data as any)
        .eq('id', id)
        .select()
        .single() as PostgrestSingleResponse<TableRow<T>>

      if (error) throw error
      if (!updated) throw DalError.notFound(this.tableName)
      
      return updated
    } catch (error) {
      throw this.handleError(error, 'update')
    }
  }

  async delete(id: string, hardDelete = false): Promise<void> {
    try {
      if (hardDelete) {
        const { error } = await this.supabase
          .from(this.tableName)
          .delete()
          .eq('id', id)
        if (error) throw error
      } else {
        const { error } = await this.supabase
          .from(this.tableName)
          .update({ deleted_at: new Date().toISOString() } as any)
          .eq('id', id)
        if (error) throw error
      }
    } catch (error) {
      throw this.handleError(error, 'delete')
    }
  }

  protected handleError(error: unknown, operation: string): never {
    throw DalError.operationFailed(operation, error)
  }

  protected async checkPermission(action: string): Promise<void> {
    if (!this.context) {
      throw DalError.unauthorized()
    }

    const hasAccess = await this.context.canAccess(this.tableName, action)
    if (!hasAccess) {
      throw DalError.unauthorized()
    }
  }
}