import 'dotenv/config'

export const PORT = Number(process.env.PORT) || 4000
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'
export const DATABASE_URL = process.env.DATABASE_URL || ''
export const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379'

export const NODE_ENV = process.env.NODE_ENV || ''
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || ''
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ''
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || ''

// ImageKit configuration
// You can set IMAGEKIT_URL_ENDPOINT explicitly, otherwise it defaults to the provided account id.
export const IMAGEKIT_PUBLIC_KEY = process.env.IMAGEKIT_PUBLIC_KEY || ''
export const IMAGEKIT_PRIVATE_KEY = process.env.IMAGEKIT_PRIVATE_KEY || ''
export const IMAGEKIT_ID = process.env.IMAGEKIT_ID || 'po5udmmiz'
export const IMAGEKIT_URL_ENDPOINT =
  process.env.IMAGEKIT_URL_ENDPOINT || `https://ik.imagekit.io/${IMAGEKIT_ID}`
