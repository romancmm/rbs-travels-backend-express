import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library'
import type { Request, Response, NextFunction } from 'express'

export function errorHandler(
 err: any,
 _req: Request,
 res: Response,
 _next: NextFunction,
) {
 // Log full error for diagnostics
 console.error(err)

 // Prisma known request errors
 if (err instanceof PrismaClientKnownRequestError) {
  // Map common Prisma codes to HTTP statuses
  // P2002: Unique constraint failed
  if (err.code === 'P2002') {
   return res.status(409).json({
    success: false,
    message: 'Resource already exists (unique constraint).',
   })
  }
  // P2025: Record not found
  if (err.code === 'P2025') {
   return res.status(404).json({
    success: false,
    message: 'Resource not found.',
   })
  }
  // Fallback for other Prisma errors
  return res.status(400).json({
   success: false,
   message: 'Database error occurred.',
   code: err.code,
  })
 }

 const status = err.status || 500
 return res.status(status).json({
  success: false,
  message: err.message || 'Internal Server Error',
  errors: err.errors || undefined,
 })
}