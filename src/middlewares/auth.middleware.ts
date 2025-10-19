import { verifyAccessToken } from '@/utils/jwt'
import prisma from '@/utils/prisma'
import type { Request, Response, NextFunction } from 'express'

export function authenticateToken(
 req: Request & { user?: any },
 res: Response,
 next: NextFunction,
) {
 const auth = req.headers.authorization
 if (!auth) return res.status(401).json({ message: 'No token provided' })
 const token: any = auth.split(' ')[1]
 try {
  const payload = verifyAccessToken(token)
  req.user = payload
  return next()
 } catch (err) {
  return res.status(401).json({ message: 'Invalid or expired token' })
 }
}

export const adminAuthMiddleware = async (
 req: Request,
 res: Response,
 next: NextFunction,
) => {
 const header = req.headers.authorization
 if (!header) return res.status(401).json({ message: 'Unauthorized' })

 const token: any = header.split(' ')[1]
 try {
  const decoded: any = verifyAccessToken(token)
  const admin = await prisma.user.findUnique({
   where: { id: decoded.id },
   include: { role: { include: { permissions: true } } },
  })
  if (!admin || !admin.isAdmin)
   return res.status(403).json({ message: 'Access denied: not admin' })
  ;(req as any).user = admin
  next()
 } catch {
  return res.status(403).json({ message: 'Invalid token' })
 }
}
