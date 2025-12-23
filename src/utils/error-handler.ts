/**
 * Error utility - for creating custom application errors
 * All Prisma and framework errors are handled by error.middleware.ts
 */

interface AppError extends Error {
  status?: number
  code?: string
  errors?: any
}

/**
 * Create a standardized application error
 * @param message - Error message
 * @param status - HTTP status code (default: 400)
 * @param code - Optional error code for client identification
 */
export const createError = (message: string, status: number = 400, code?: string): AppError => {
  return Object.assign(new Error(message), { status, code })
}

/**
 * Common error messages for reuse across services
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
