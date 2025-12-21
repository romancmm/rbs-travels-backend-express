import CacheService from '@/services/cache.service'
import type { NextFunction, Request, Response } from 'express'

/**
 * Cache middleware for GET requests
 * Only caches successful 200 responses
 */
export const cacheMiddleware = (ttl: number = 300) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next()
    }

    // Generate cache key from path and query params
    const cacheKey = CacheService.generateKey('public', req.path, req.query)

    try {
      // Try to get cached response
      const cachedData = await CacheService.get(cacheKey)

      if (cachedData) {
        console.log(`✅ Cache HIT: ${cacheKey}`)
        return res.json(cachedData)
      }

      console.log(`❌ Cache MISS: ${cacheKey}`)

      // Store the original res.json function
      const originalJson = res.json.bind(res)

      // Override res.json to cache the response
      res.json = function (data: any) {
        // Only cache successful responses (200)
        if (res.statusCode === 200) {
          CacheService.set(cacheKey, data, ttl).catch((err) => {
            console.error('Failed to cache response:', err)
          })
        }

        // Call the original json function
        return originalJson(data)
      }

      next()
    } catch (error) {
      console.error('Cache middleware error:', error)
      // If cache fails, continue without caching
      next()
    }
  }
}

export default cacheMiddleware
