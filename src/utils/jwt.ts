import { JWT_ACCESS_SECRET, JWT_REFRESH_SECRET } from '@/config/env'
import jwt from 'jsonwebtoken'

export const generateTokens = (payload: object) => {
 const accessToken = jwt.sign(payload, JWT_ACCESS_SECRET, { expiresIn: '15m' })
 const refreshToken = jwt.sign(payload, JWT_REFRESH_SECRET, { expiresIn: '7d' })
 return { accessToken, refreshToken }
}

export const verifyAccessToken = (token: string) =>
 jwt.verify(token, JWT_ACCESS_SECRET)

export const verifyRefreshToken = (token: string) =>
 jwt.verify(token, JWT_REFRESH_SECRET)
