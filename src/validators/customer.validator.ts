import { z } from 'zod'
import { booleanQuerySchema, emailSchema, paginationQuerySchema } from './common.validator'

/**
 * Customer Validation Schemas
 */

// Create customer schema (admin creating a customer)
export const createCustomerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  password: z.string().min(8, 'Password must be at least 8 characters'),
  isActive: z.boolean().default(true).optional(),
})

// Update customer schema (admin updating a customer)
export const updateCustomerSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
  isActive: z.boolean().optional(),
})

// Update customer profile schema (customer updating themselves)
export const updateCustomerProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
})

// Customer query params schema
export const customerQuerySchema = paginationQuerySchema.extend({
  isActive: booleanQuerySchema.optional(),
})

/**
 * TypeScript Types
 */
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>
export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>
export type CustomerQueryParams = z.infer<typeof customerQuerySchema>
