import { z } from 'zod'

/**
 * Common validation schemas used across different validators
 */

// UUID validation
export const uuidSchema = z.string().uuid({ message: 'Invalid UUID format' })

// Email validation
export const emailSchema = z.string().email({ message: 'Invalid email address' })

// Password validation (min 8 chars, at least 1 uppercase, 1 lowercase, 1 number)
export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

// Slug validation (lowercase, hyphens allowed)
// Now optional - backend will auto-generate/purify slugs
export const slugSchema = z
  .string()
  .max(200, 'Slug must be at most 200 characters')
  .optional()
  .transform((val) => val?.trim() || undefined)

// Pagination schemas
export const paginationQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1).optional(),
  perPage: z.coerce.number().int().positive().max(100).default(10).optional(),
  q: z.string().optional(),
})

// Query params for ID
export const idParamSchema = z.object({
  id: uuidSchema,
})

// Query params for slug
export const slugParamSchema = z.object({
  slug: slugSchema,
})

// Boolean coercion (for query params like ?isPublished=true)
export const booleanQuerySchema = z
  .union([z.boolean(), z.literal('true'), z.literal('false')])
  .transform((val) => val === true || val === 'true')

// Date string validation
export const dateStringSchema = z.string().datetime({ message: 'Invalid date format' })

// Array of strings (for tags, features, etc.)
export const stringArraySchema = z.array(z.string()).default([])

// URL validation
export const urlSchema = z.string().url({ message: 'Invalid URL format' }).optional()

// Image URL validation
export const imageUrlSchema = z.string().url().optional().nullable()

// Avatar upload schema
export const avatarUploadSchema = z.object({
  avatarUrl: z.string().url({ message: 'Invalid avatar URL format' }),
})

// JSON validation (for flexible JSON fields)
export const jsonSchema = z.union([z.record(z.string(), z.any()), z.array(z.any()), z.null()])

/**
 * Type exports for TypeScript
 */
export type UUID = z.infer<typeof uuidSchema>
export type Email = z.infer<typeof emailSchema>
export type Password = z.infer<typeof passwordSchema>
export type Slug = z.infer<typeof slugSchema>
export type PaginationQuery = z.infer<typeof paginationQuerySchema>
export type IdParam = z.infer<typeof idParamSchema>
export type SlugParam = z.infer<typeof slugParamSchema>
