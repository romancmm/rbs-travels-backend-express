import { Prisma } from '@prisma/client'
import type { NextFunction, Request, Response } from 'express'
import { ZodError } from 'zod'

/**
 * Central error handler middleware - handles ALL error types
 * Maps Prisma, Zod, and custom errors to proper HTTP responses
 */
export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  // Log error for debugging (use proper logger in production)
  console.error('❌ Error:', {
    name: err.name,
    message: err.message,
    code: err.code,
    status: err.status,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  })

  // Handle Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: err.issues.map((issue) => ({
        path: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  // Handle Prisma known request errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    // P2002: Unique constraint violation
    if (err.code === 'P2002') {
      const fields = (err.meta?.target as string[]) || []
      const fieldName = fields[0] || 'field'
      return res.status(409).json({
        success: false,
        message: `A record with this ${fieldName} already exists`,
        code: 'DUPLICATE_ENTRY',
      })
    }

    // P2025: Record not found
    if (err.code === 'P2025') {
      return res.status(404).json({
        success: false,
        message: 'Record not found',
        code: 'NOT_FOUND',
      })
    }

    // P2003: Foreign key constraint failed
    if (err.code === 'P2003') {
      const field = err.meta?.field_name || 'reference'
      return res.status(400).json({
        success: false,
        message: `Invalid reference: ${field} does not exist`,
        code: 'INVALID_REFERENCE',
      })
    }

    // P2011: Null constraint violation
    if (err.code === 'P2011') {
      const field = err.meta?.constraint || 'field'
      return res.status(400).json({
        success: false,
        message: `Missing required field: ${field}`,
        code: 'MISSING_FIELD',
      })
    }

    // P2014: Relation violation
    if (err.code === 'P2014') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete record: it is referenced by other records',
        code: 'RELATION_VIOLATION',
      })
    }

    // Generic Prisma error
    return res.status(400).json({
      success: false,
      message: 'Database operation failed',
      code: err.code,
    })
  }

  // Handle Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    return res.status(400).json({
      success: false,
      message: 'Invalid data provided',
      code: 'VALIDATION_ERROR',
    })
  }

  // Handle Prisma initialization errors
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return res.status(503).json({
      success: false,
      message: 'Database connection failed',
      code: 'DB_CONNECTION_ERROR',
    })
  }

  // Handle custom application errors (with status and code)
  if (err.status || err.code) {
    const status = err.status || 400
    return res.status(status).json({
      success: false,
      message: err.message || 'An error occurred',
      code: err.code,
      errors: err.errors,
    })
  }

  // Generic fallback for unknown errors
  const status = 500
  return res.status(status).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
}
