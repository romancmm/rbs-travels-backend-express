import { z } from 'zod'
import {
  booleanQuerySchema,
  imageUrlSchema,
  paginationQuerySchema,
  slugSchema,
} from './common.validator'

/**
 * Service Validation Schemas
 */

// Create service schema
export const createServiceSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  slug: slugSchema,
  description: z.string().max(500).optional().nullable(),
  content: z.string().min(1, 'Content is required'),
  icon: z.string().optional().nullable(),
  thumbnail: imageUrlSchema,
  features: z
    .union([
      z.array(z.string()),
      z.string().transform((str) =>
        str
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean)
      ),
    ])
    .optional(),
  price: z.number().positive().optional().nullable(),
  isPublished: z.boolean().default(false).optional(),
  order: z.number().int().default(0).optional(),
})

// Update service schema
export const updateServiceSchema = z.object({
  title: z.string().min(1).max(255).optional(),
  slug: slugSchema.optional(),
  description: z.string().max(500).optional().nullable(),
  content: z.string().min(1).optional(),
  icon: z.string().optional().nullable(),
  thumbnail: imageUrlSchema,
  features: z
    .union([
      z.array(z.string()),
      z.string().transform((str) =>
        str
          .split(',')
          .map((f) => f.trim())
          .filter(Boolean)
      ),
    ])
    .optional(),
  price: z.number().positive().optional().nullable(),
  isPublished: z.boolean().optional(),
  order: z.number().int().optional(),
})

// Service query params schema
export const serviceQuerySchema = paginationQuerySchema.extend({
  isPublished: booleanQuerySchema.optional(),
  q: z.string().optional(),
})

/**
 * TypeScript Types
 */
export type CreateServiceInput = z.infer<typeof createServiceSchema>
export type UpdateServiceInput = z.infer<typeof updateServiceSchema>
export type ServiceQueryParams = z.infer<typeof serviceQuerySchema>
