import { Redis } from 'ioredis'
import type { ICacheManager, CacheConfig, CacheEntry } from './types'

export class RedisCacheManager implements ICacheManager {
  private readonly redis: Redis
  private readonly defaultTTL: number
  private readonly prefix: string

  constructor(config: CacheConfig = {}) {
    this.redis = new Redis(process.env.REDIS_URL!)
    this.defaultTTL = config.ttl || 5 * 60 * 1000 // 5 minutes
    this.prefix = config.prefix || 'app:'
  }

  private getKey(key: string): string {
    return `${this.prefix}${key}`
  }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.redis.get(this.getKey(key))
    if (!data) return null

    const entry = JSON.parse(data) as CacheEntry<T>
    if (entry.expires < Date.now()) {
      await this.del(key)
      return null
    }

    return entry.data
  }

  async set<T>(key: string, value: T, ttl = this.defaultTTL): Promise<void> {
    const entry: CacheEntry<T> = {
      data: value,
      expires: Date.now() + ttl
    }

    await this.redis.set(
      this.getKey(key),
      JSON.stringify(entry),
      'PX',
      ttl
    )
  }

  async del(key: string): Promise<void> {
    await this.redis.del(this.getKey(key))
  }

  async delPattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(this.getKey(`${pattern}*`))
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async clear(): Promise<void> {
    const keys = await this.redis.keys(`${this.prefix}*`)
    if (keys.length > 0) {
      await this.redis.del(...keys)
    }
  }

  async keys(): Promise<string[]> {
    const keys = await this.redis.keys(`${this.prefix}*`)
    return keys.map((key: string) => key.slice(this.prefix.length))
  }

  async size(): Promise<number> {
    const keys = await this.redis.keys(`${this.prefix}*`)
    return keys.length
  }
} 