import type { PostgrestFilterBuilder } from '@supabase/postgrest-js'
import type { Database } from '@/database.types'

export interface QueryOptions {
  page?: number
  pageSize?: number
  sortField?: string
  sortDirection?: 'asc' | 'desc'
  search?: {
    field: string
    term: string
  }
  filter?: Record<string, any>
}

export class QueryBuilder<T extends Record<string, any>> {
  constructor(
    private query: PostgrestFilterBuilder<Database['public'], T, T[]>,
    private options: QueryOptions = {}
  ) {}

  withPagination() {
    if (this.options.page && this.options.pageSize) {
      const start = (this.options.page - 1) * this.options.pageSize
      const end = start + this.options.pageSize - 1
      this.query = this.query.range(start, end)
    }
    return this
  }

  withSearch() {
    if (this.options.search) {
      const { field, term } = this.options.search
      this.query = this.query.ilike(field, `%${term}%`)
    }
    return this
  }

  withSort() {
    if (this.options.sortField) {
      this.query = this.query.order(this.options.sortField, {
        ascending: this.options.sortDirection === 'asc'
      })
    }
    return this
  }

  withFilters() {
    if (this.options.filter) {
      Object.entries(this.options.filter).forEach(([field, value]) => {
        if (value !== undefined && value !== null) {
          this.query = this.query.eq(field, value)
        }
      })
    }
    return this
  }

  build() {
    return this.query
  }
} 