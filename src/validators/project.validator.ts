import { z } from 'zod'
import {
  booleanQuerySchema,
  imageUrlSchema,
  paginationQuerySchema,
  slugSchema,
} from './common.validator'

/**
 * Project Validation Schemas
 */

// Create project schema
export const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: slugSchema,
  description: z.string().max(500).optional().nullable(),
  content: z.string().min(1, 'Content is required'),
  client: z.string().max(200).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
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
  thumbnail: imageUrlSchema,
  images: z
    .union([
      z.array(z.string().url()),
      z.string().transform((str) =>
        str
          .split(',')
          .map((img) => img.trim())
          .filter(Boolean)
      ),
    ])
    .optional(),
  completedAt: z.string().datetime().optional().nullable(),
  isPublished: z.boolean().default(false).optional(),
  isFeatured: z.boolean().default(false).optional(),
  order: z.number().int().default(0).optional(),
})

// Update project schema
export const updateProjectSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: slugSchema.optional(),
  description: z.string().max(500).optional().nullable(),
  content: z.string().min(1).optional(),
  client: z.string().max(200).optional().nullable(),
  category: z.string().max(100).optional().nullable(),
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
  thumbnail: imageUrlSchema,
  images: z
    .union([
      z.array(z.string().url()),
      z.string().transform((str) =>
        str
          .split(',')
          .map((img) => img.trim())
          .filter(Boolean)
      ),
    ])
    .optional(),
  completedAt: z.string().datetime().optional().nullable(),
  isPublished: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  order: z.number().int().optional(),
})

// Project query params schema
export const projectQuerySchema = paginationQuerySchema.extend({
  isPublished: booleanQuerySchema.optional(),
  isFeatured: booleanQuerySchema.optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
  q: z.string().optional(),
})

/**
 * TypeScript Types
 */
export type CreateProjectInput = z.infer<typeof createProjectSchema>
export type UpdateProjectInput = z.infer<typeof updateProjectSchema>
export type ProjectQueryParams = z.infer<typeof projectQuerySchema>
