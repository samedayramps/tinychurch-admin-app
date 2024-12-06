import type { Database } from '@/database.types'
import type { SupabaseClient } from '@supabase/supabase-js'
import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import type { TenantContext } from '../context/TenantContext'

type Tables = Database['public']['Tables'] 
type TableName = keyof Tables
type TableRow<T extends TableName> = Tables[T]['Row']

export abstract class BaseRepositoryBase<T extends TableName> {
  protected abstract tableName: T
  protected abstract organizationField?: keyof TableRow<T>

  constructor(
    protected readonly supabase: SupabaseClient<Database>,
    protected readonly context?: TenantContext
  ) {}

  protected validateTenantContext(): void {
    if (this.organizationField && !this.context?.organizationId) {
      throw new Error('Organization ID required for tenant-scoped repository')
    }
  }

  protected baseQuery(): PostgrestFilterBuilder<Database['public'], TableRow<T>, TableRow<T>[]> {
    this.validateTenantContext()

    let query = this.supabase
      .from(this.tableName)
      .select() as PostgrestFilterBuilder<Database['public'], TableRow<T>, TableRow<T>[]>

    if (this.organizationField && this.context?.organizationId) {
      query = query.eq(
        this.organizationField as string,
        this.context.organizationId
      )
    }

    return query
  }
} 