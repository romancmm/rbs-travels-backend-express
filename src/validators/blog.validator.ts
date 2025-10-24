import { z } from 'zod'
import {
  booleanQuerySchema,
  imageUrlSchema,
  paginationQuerySchema,
  slugSchema,
  uuidSchema,
} from './common.validator'

/**
 * Blog Post Validation Schemas
 */

// Create post schema
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: slugSchema,
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1, 'Content is required'),
  featuredImage: imageUrlSchema,
  categoryId: uuidSchema.optional().nullable(),
  tags: z
    .union([
      z.array(z.string()),
      z.string().transform((str) =>
        str
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      ),
    ])
    .optional(),
  isPublished: z.boolean().default(false).optional(),
  publishedAt: z.string().datetime().optional().nullable(),
})

// Update post schema (all fields optional except what's being updated)
export const updatePostSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: slugSchema.optional(),
  excerpt: z.string().max(500).optional().nullable(),
  content: z.string().min(1).optional(),
  featuredImage: imageUrlSchema,
  categoryId: uuidSchema.optional().nullable(),
  tags: z
    .union([
      z.array(z.string()),
      z.string().transform((str) =>
        str
          .split(',')
          .map((t) => t.trim())
          .filter(Boolean)
      ),
    ])
    .optional(),
  isPublished: z.boolean().optional(),
  publishedAt: z.string().datetime().optional().nullable(),
})

// Post query params schema
export const postQuerySchema = paginationQuerySchema.extend({
  categoryId: uuidSchema.optional(),
  tag: z.string().optional(),
  authorId: uuidSchema.optional(),
  isPublished: booleanQuerySchema.optional(),
})

/**
 * Category Validation Schemas
 */

// Create category schema
export const createCategorySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  slug: slugSchema,
  description: z.string().max(500).optional().nullable(),
})

// Update category schema
export const updateCategorySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: slugSchema.optional(),
  description: z.string().max(500).optional().nullable(),
})

// Category query params schema
export const categoryQuerySchema = paginationQuerySchema.extend({
  // Add any specific category filters here
})

/**
 * TypeScript Types
 */

// Post types
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type PostQueryParams = z.infer<typeof postQuerySchema>

// Category types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>
