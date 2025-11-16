import { z } from 'zod'
import { isValidSlugFormat } from '../utils/slug.util'

/**
 * Slug Validators (Zod-based)
 *
 * Provides validation for slug fields
 * - Validates format (lowercase, alphanumeric, hyphens)
 * - Optional or required based on use case
 * - Auto-purification happens in service layer
 */

/**
 * Validates slug format when provided
 * Used for create/update operations where slug is optional
 * Invalid slugs will be purified in service layer
 */
export const optionalSlugSchema = z
  .string()
  .max(200, 'Slug must be at most 200 characters')
  .optional()
  .transform((val) => val?.trim() || undefined)

/**
 * Validates slug format strictly
 * Used when slug format must be correct (e.g., admin overrides)
 */
export const strictSlugSchema = z
  .string()
  .max(200, 'Slug must be at most 200 characters')
  .optional()
  .refine((val) => !val || isValidSlugFormat(val), {
    message: "Slug must be lowercase alphanumeric with hyphens only (e.g., 'my-example-slug')",
  })

/**
 * Validates required slug (for bulk imports or specific APIs)
 */
export const requiredSlugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(200, 'Slug must be at most 200 characters')

/**
 * Strict required slug with format validation
 */
export const requiredStrictSlugSchema = z
  .string()
  .min(1, 'Slug is required')
  .max(200, 'Slug must be at most 200 characters')
  .refine(isValidSlugFormat, {
    message: "Slug must be lowercase alphanumeric with hyphens only (e.g., 'my-example-slug')",
  })
