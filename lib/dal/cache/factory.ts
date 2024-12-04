import { ICacheManager } from './types'
import { RedisCacheManager } from './redis'
import { MemoryCacheManager } from './memory'

export class CacheFactory {
  private static instance: CacheFactory
  private cacheManager: ICacheManager | null = null

  private constructor() {}

  static getInstance(): CacheFactory {
    if (!this.instance) {
      this.instance = new CacheFactory()
    }
    return this.instance
  }

  getCacheManager(): ICacheManager {
    if (!this.cacheManager) {
      // Initialize Redis cache if REDIS_URL is provided, otherwise use memory cache
      if (process.env.REDIS_URL) {
        this.cacheManager = new RedisCacheManager()
      } else {
        // Fall back to memory cache for development
        this.cacheManager = MemoryCacheManager.getInstance()
      }
    }
    return this.cacheManager
  }
}

// Helper function to get cache manager
export function getCache(): ICacheManager {
  return CacheFactory.getInstance().getCacheManager()
} 