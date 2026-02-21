import { getRedisClient } from '@/config/redis.config'

// Default TTL: 5 minutes for most cached data
const DEFAULT_TTL = 300

export class CacheService {
  /**
   * Get cached data
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const redis = getRedisClient()
      const data = await redis.get(key)
      if (!data) return null
      return JSON.parse(data) as T
    } catch (error) {
      console.error('Cache get error:', error)
      return null // Fail silently to not break the app
    }
  }

  /**
   * Set cached data with optional TTL
   */
  static async set(key: string, value: any, ttl: number = DEFAULT_TTL): Promise<void> {
    try {
      const redis = getRedisClient()
      await redis.setex(key, ttl, JSON.stringify(value))
    } catch (error) {
      console.error('Cache set error:', error)
      // Fail silently
    }
  }

  /**
   * Delete specific cache key
   */
  static async delete(key: string): Promise<void> {
    try {
      const redis = getRedisClient()
      await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
    }
  }

  /**
   * Delete a specific cache key and return deleted count (0 | 1)
   */
  static async deleteWithResult(key: string): Promise<number> {
    try {
      const redis = getRedisClient()
      return await redis.del(key)
    } catch (error) {
      console.error('Cache delete error:', error)
      return 0
    }
  }

  /**
   * Invalidate cache by pattern (e.g., "articles:*")
   * Use this when a resource is created/updated/deleted
   */
  static async invalidatePattern(pattern: string): Promise<void> {
    try {
      const redis = getRedisClient()
      const keys = await redis.keys(pattern)
      if (keys.length > 0) {
        await redis.del(...keys)
        console.log(`🗑️  Invalidated ${keys.length} cache keys matching: ${pattern}`)
      }
    } catch (error) {
      console.error('Cache invalidate error:', error)
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    try {
      const redis = getRedisClient()
      await redis.flushdb()
      console.log('🗑️  All cache cleared')
    } catch (error) {
      console.error('Cache clear error:', error)
    }
  }

  /**
   * Clear all cache and return number of keys removed
   */
  static async clearWithCount(): Promise<number> {
    try {
      const redis = getRedisClient()
      const totalKeys = await redis.dbsize()
      if (totalKeys > 0) {
        await redis.flushdb()
      }
      return totalKeys
    } catch (error) {
      console.error('Cache clear error:', error)
      return 0
    }
  }

  /**
   * List cache keys using SCAN (non-blocking)
   */
  static async listKeys(
    pattern = '*',
    cursor = '0',
    count = 100
  ): Promise<{
    keys: string[]
    cursor: string
    hasMore: boolean
  }> {
    try {
      const redis = getRedisClient()
      const [nextCursor, keys] = await redis.scan(cursor, 'MATCH', pattern, 'COUNT', count)
      return {
        keys,
        cursor: nextCursor,
        hasMore: nextCursor !== '0',
      }
    } catch (error) {
      console.error('Cache list error:', error)
      return {
        keys: [],
        cursor: '0',
        hasMore: false,
      }
    }
  }

  /**
   * Generate a cache key from request path and query params
   */
  static generateKey(prefix: string, path: string, query?: Record<string, any>): string {
    const queryString = query ? JSON.stringify(query) : ''
    return `${prefix}:${path}${queryString ? `:${queryString}` : ''}`
  }
}

export default CacheService
