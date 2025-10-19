import 'dotenv/config'

export const PORT = Number(process.env.PORT) || 4000
export const JWT_SECRET = process.env.JWT_SECRET || 'supersecretkey'
export const DATABASE_URL = process.env.DATABASE_URL || ''

export const NODE_ENV = process.env.NODE_ENV || ''
export const JWT_ACCESS_SECRET = process.env.JWT_ACCESS_SECRET || ''
export const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || ''
export const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || ''