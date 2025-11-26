import { z } from 'zod'
import {
  booleanQuerySchema,
  imageUrlSchema,
  paginationQuerySchema,
  slugSchema,
  uuidSchema,
} from './common.validator'

/**
 * Article Post Validation Schemas
 */

// Article SEO schema
export const articleSeoSchema = z.object({
  title: z
    .string()
    .min(1, 'SEO title is required')
    .max(60, 'SEO title must be less than 60 characters'),
  description: z
    .string()
    .min(1, 'SEO description is required')
    .max(160, 'SEO description must be less than 160 characters'),
  keywords: z.array(z.string()).default([]),
})

// Create post schema
export const createPostSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  slug: slugSchema,
  excerpt: z
    .string()
    .min(1, 'Excerpt is required')
    .max(500, 'Excerpt must be less than 500 characters'),
  content: z.string().min(1, 'Content is required'),
  thumbnail: imageUrlSchema,
  gallery: z.array(z.string()).default([]),
  categoryIds: z
    .union([
      z.array(uuidSchema),
      z.string().transform((str) =>
        str
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ])
    .default([]),
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
    .default([]),
  isPublished: z.boolean().default(false),
  publishedAt: z.string().datetime().optional().nullable(),
  seo: articleSeoSchema,
})

// Update post schema (all fields optional except what's being updated)
export const updatePostSchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: slugSchema.optional(),
  excerpt: z.string().min(1).max(500).optional(),
  content: z.string().min(1).optional(),
  thumbnail: imageUrlSchema,
  gallery: z.array(z.string()).optional(),
  categoryIds: z
    .union([
      z.array(uuidSchema),
      z.string().transform((str) =>
        str
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ])
    .optional(),
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
  seo: articleSeoSchema.optional(),
})

// Post query params schema
export const postQuerySchema = paginationQuerySchema.extend({
  categoryIds: z
    .union([
      z.array(uuidSchema),
      z.string().transform((str) =>
        str
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      ),
    ])
    .optional(),
  categorySlugs: z
    .union([
      z.array(z.string()),
      z.string().transform((str) =>
        str
          .split(',')
          .map((slug) => slug.trim())
          .filter(Boolean)
      ),
    ])
    .optional(),
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
  q: z.string().optional(),
})

/**
 * TypeScript Types
 */

// Post types
export type ArticleSeo = z.infer<typeof articleSeoSchema>
export type CreatePostInput = z.infer<typeof createPostSchema>
export type UpdatePostInput = z.infer<typeof updatePostSchema>
export type PostQueryParams = z.infer<typeof postQuerySchema>

// Category types
export type CreateCategoryInput = z.infer<typeof createCategorySchema>
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>
export type CategoryQueryParams = z.infer<typeof categoryQuerySchema>
