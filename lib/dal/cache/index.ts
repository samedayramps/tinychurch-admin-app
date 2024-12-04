// lib/dal/cache/index.ts
export * from './types'
export * from './factory'
export * from './redis'
export * from './memory'

// Re-export the getCache helper as default cache getter
export { getCache } from './factory'