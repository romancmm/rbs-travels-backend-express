/**
 * Validators Index
 * Central export point for all Zod schemas and TypeScript types
 */

// Common validators and types
export * from './common.validator'

// Auth validators and types
export * from './auth.validator'

// Article validators and types
export * from './article.validator'

// User/Admin validators and types
export * from './user.validator'

// RBAC (Role & Permission) validators and types
export * from './rbac.validator'

// Service validators and types
export * from './service.validator'

// Project validators and types
export * from './project.validator'

// Setting validators and types
export * from './setting.validator'

// Customer validators and types
export * from './customer.validator'

// Validation middleware
export { validate, validateMultiple } from '@/middlewares/validation.middleware'
