import { z } from 'zod'
import {
  booleanQuerySchema,
  jsonSchema,
  paginationQuerySchema,
  slugSchema,
} from './common.validator'

/**
 * Page Validation Schemas
 */

// Create page schema
export const createPageSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: slugSchema,
  content: jsonSchema, // Elementor-like JSON structure
  meta: jsonSchema.optional().nullable(),
  isPublished: z.boolean().default(false).optional(),
})

// Update page schema
export const updatePageSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: slugSchema.optional(),
  content: jsonSchema.optional(),
  meta: jsonSchema.optional().nullable(),
  isPublished: z.boolean().optional(),
})

// Page query params schema
export const pageQuerySchema = paginationQuerySchema.extend({
  isPublished: booleanQuerySchema.optional(),
})

/**
 * TypeScript Types
 */
export type CreatePageInput = z.infer<typeof createPageSchema>
export type UpdatePageInput = z.infer<typeof updatePageSchema>
export type PageQueryParams = z.infer<typeof pageQuerySchema>
