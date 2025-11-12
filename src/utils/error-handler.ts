import { Prisma } from '@prisma/client'

/**
 * Error handler utility to convert Prisma and other errors into user-friendly messages
 */

interface AppError extends Error {
  status?: number
  code?: string
}

/**
 * Handle Prisma errors and convert them to user-friendly messages
 */
export const handlePrismaError = (error: any, entityName: string = 'Record'): AppError => {
  // Prisma Unique Constraint Error
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === 'P2002') {
      const fields = (error.meta?.target as string[]) || []
      const fieldName = fields[0] || 'field'
      const message = `${entityName} with this ${fieldName} already exists`
      return Object.assign(new Error(message), { status: 409, code: 'DUPLICATE_ENTRY' })
    }

    // Record Not Found
    if (error.code === 'P2025') {
      const message = `${entityName} not found`
      return Object.assign(new Error(message), { status: 404, code: 'NOT_FOUND' })
    }

    // Foreign Key Constraint Failed
    if (error.code === 'P2003') {
      const message = `Invalid reference: Related ${entityName.toLowerCase()} does not exist`
      return Object.assign(new Error(message), { status: 400, code: 'INVALID_REFERENCE' })
    }

    // Record to delete does not exist
    if (error.code === 'P2025') {
      const message = `${entityName} not found or already deleted`
      return Object.assign(new Error(message), { status: 404, code: 'NOT_FOUND' })
    }

    // Null constraint violation
    if (error.code === 'P2011') {
      const message = `Missing required field for ${entityName}`
      return Object.assign(new Error(message), { status: 400, code: 'MISSING_FIELD' })
    }

    // Generic Prisma error
    const message = `Database operation failed for ${entityName}`
    return Object.assign(new Error(message), { status: 500, code: 'DATABASE_ERROR' })
  }

  // Prisma Validation Error
  if (error instanceof Prisma.PrismaClientValidationError) {
    const message = `Invalid data provided for ${entityName}`
    return Object.assign(new Error(message), { status: 400, code: 'VALIDATION_ERROR' })
  }

  // Return original error if not a Prisma error
  return error
}

/**
 * Create a standardized error
 */
export const createError = (message: string, status: number = 400, code?: string): AppError => {
  return Object.assign(new Error(message), { status, code })
}

/**
 * Handle service errors - wraps Prisma error handling with entity context
 */
export const handleServiceError = (error: any, entityName: string = 'Record'): never => {
  const handledError = handlePrismaError(error, entityName)
  throw handledError
}

/**
 * Common error messages for reuse
 */
export const ErrorMessages = {
  NOT_FOUND: (entity: string) => `${entity} not found`,
  ALREADY_EXISTS: (entity: string, field: string) => `${entity} with this ${field} already exists`,
  INVALID_CREDENTIALS: 'Invalid email or password',
  UNAUTHORIZED: 'You are not authorized to perform this action',
  FORBIDDEN: 'Access forbidden',
  VALIDATION_FAILED: 'Validation failed',
  INVALID_INPUT: 'Invalid input data',
  INTERNAL_ERROR: 'An internal error occurred',
  DUPLICATE_ENTRY: (entity: string) => `${entity} already exists`,
  INVALID_REFERENCE: (entity: string) => `Referenced ${entity} does not exist`,
  OPERATION_FAILED: (operation: string, entity: string) => `Failed to ${operation} ${entity}`,
}
