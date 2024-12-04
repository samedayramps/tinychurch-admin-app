import type { ICacheManager, CacheEntry } from './types'

export class MemoryCacheManager implements ICacheManager {
  private static instance: MemoryCacheManager
  private cache: Map<string, CacheEntry>
  private readonly defaultTTL = 5 * 60 * 1000 // 5 minutes

  private constructor() {
    this.cache = new Map()
  }

  static getInstance(): MemoryCacheManager {
    if (!this.instance) {
      this.instance = new MemoryCacheManager()
    }
    return this.instance
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key)
    
    if (!entry) return null
    
    if (entry.expires < Date.now()) {
      this.cache.delete(key)
      return null
    }
    
    return entry.data as T
  }

  async set<T>(key: string, value: T, ttl = this.defaultTTL): Promise<void> {
    this.cache.set(key, {
      data: value,
      expires: Date.now() + ttl
    })
  }

  async del(key: string): Promise<void> {
    this.cache.delete(key)
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = Array.from(this.cache.keys())
    for (const key of keys) {
      if (key.startsWith(pattern)) {
        this.cache.delete(key)
      }
    }
  }

  async clear(): Promise<void> {
    this.cache.clear()
  }

  async keys(): Promise<string[]> {
    return Array.from(this.cache.keys())
  }

  async size(): Promise<number> {
    return this.cache.size
  }
} 