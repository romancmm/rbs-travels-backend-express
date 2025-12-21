import Redis from 'ioredis'
import { REDIS_URL } from './env'

let redisClient: Redis | null = null

export const initRedis = (): Redis => {
  if (redisClient) {
    return redisClient
  }

  try {
    redisClient = new Redis(REDIS_URL, {
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        const delay = Math.min(times * 50, 2000)
        return delay
      },
      reconnectOnError(err) {
        console.error('Redis reconnect on error:', err)
        return true
      },
    })

    redisClient.on('connect', () => {
      console.log('✅ Redis connected successfully')
    })

    redisClient.on('error', (error) => {
      console.error('❌ Redis connection error:', error)
    })

    redisClient.on('ready', () => {
      console.log('✅ Redis is ready to accept commands')
    })

    return redisClient
  } catch (error) {
    console.error('Failed to initialize Redis:', error)
    throw error
  }
}

export const getRedisClient = (): Redis => {
  if (!redisClient) {
    return initRedis()
  }
  return redisClient
}

export const closeRedis = async (): Promise<void> => {
  if (redisClient) {
    await redisClient.quit()
    redisClient = null
    console.log('Redis connection closed')
  }
}

export default { initRedis, getRedisClient, closeRedis }
