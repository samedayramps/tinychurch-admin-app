import type { BaseEntity } from './repository'
import type { QueryOptions } from './repository'

export interface IRepository<T extends BaseEntity> {
  findById(id: string, options?: QueryOptions): Promise<T | null>
  create(data: Partial<T>, options?: QueryOptions): Promise<T>
  update(id: string, data: Partial<T>, options?: QueryOptions): Promise<T>
  delete(id: string, options?: QueryOptions): Promise<void>
  hardDelete(id: string, options?: QueryOptions): Promise<void>
} 