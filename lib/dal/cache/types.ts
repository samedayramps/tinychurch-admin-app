export interface ICacheManager {
  get<T>(key: string): Promise<T | null>
  set<T>(key: string, value: T, ttl?: number): Promise<void>
  del(key: string): Promise<void>
  delPattern(pattern: string): Promise<void>
  clear(): Promise<void>
  keys(): Promise<string[]>
  size(): Promise<number>
}

export interface CacheConfig {
  ttl?: number
  prefix?: string
}

export interface CacheEntry<T = unknown> {
  data: T
  expires: number
} 