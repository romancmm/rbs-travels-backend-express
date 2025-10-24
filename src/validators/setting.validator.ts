import { z } from 'zod'
import { booleanQuerySchema, jsonSchema, paginationQuerySchema } from './common.validator'

/**
 * Setting Validation Schemas
 */

// Create setting schema
export const createSettingSchema = z.object({
  key: z.string().min(1, 'Key is required').max(255),
  value: jsonSchema,
  description: z.string().max(500).optional().nullable(),
  group: z.string().max(100).optional().nullable(),
  isPublic: z.boolean().default(false).optional(),
})

// Update setting schema
export const updateSettingSchema = z.object({
  value: jsonSchema.optional(),
  description: z.string().max(500).optional().nullable(),
  group: z.string().max(100).optional().nullable(),
  isPublic: z.boolean().optional(),
})

// Setting query params schema
export const settingQuerySchema = paginationQuerySchema.extend({
  group: z.string().optional(),
  isPublic: booleanQuerySchema.optional(),
})

/**
 * TypeScript Types
 */
export type CreateSettingInput = z.infer<typeof createSettingSchema>
export type UpdateSettingInput = z.infer<typeof updateSettingSchema>
export type SettingQueryParams = z.infer<typeof settingQuerySchema>
