import { z } from 'zod'
import {
  booleanQuerySchema,
  emailSchema,
  imageUrlSchema,
  paginationQuerySchema,
  passwordSchema,
  uuidSchema,
} from './common.validator'

/**
 * User/Admin Validation Schemas
 */

// Create user schema
export const createUserSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  password: passwordSchema,
  avatar: imageUrlSchema.optional(),
  isActive: z.boolean().default(true).optional(),
  isAdmin: z.boolean().default(false).optional(),
  roleIds: z.array(uuidSchema).optional().default([]), // Array of role IDs
})

// Update user schema
export const updateUserSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
  password: passwordSchema.optional(),
  avatar: imageUrlSchema.optional(),
  isActive: z.boolean().optional(),
  isAdmin: z.boolean().optional(),
  roleIds: z.array(uuidSchema).optional(), // Array of role IDs
})

// User query params schema
export const userQuerySchema = paginationQuerySchema.extend({
  isActive: booleanQuerySchema.optional(),
  isAdmin: booleanQuerySchema.optional(),
  roleId: uuidSchema.optional(), // Keep for backward compatibility in filtering
})

// Update user profile (for authenticated users updating themselves)
export const updateProfileSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  email: emailSchema.optional(),
  avatar: imageUrlSchema.optional(),
})

/**
 * TypeScript Types
 */
export type CreateUserInput = z.infer<typeof createUserSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type UserQueryParams = z.infer<typeof userQuerySchema>
export type UpdateProfileInput = z.infer<typeof updateProfileSchema>
