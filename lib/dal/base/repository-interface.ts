import type { Database } from '@/database.types'

type TableName = keyof Database['public']['Tables']
type Row<T extends TableName> = Database['public']['Tables'][T]['Row']

export interface QueryOptions {
  include?: string[]
  filter?: Record<string, unknown>
  sort?: { field: string; direction: 'asc' | 'desc' }
  limit?: number
  offset?: number
}

export interface IRepository<T extends TableName> {
  findById(id: string, options?: QueryOptions): Promise<Row<T> | null>
  create(data: Partial<Row<T>>, options?: QueryOptions): Promise<Row<T>>
  update(id: string, data: Partial<Row<T>>, options?: QueryOptions): Promise<Row<T>>
  delete(id: string, options?: QueryOptions): Promise<void>
  hardDelete(id: string, options?: QueryOptions): Promise<void>
} 