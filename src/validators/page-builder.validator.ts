import { z } from 'zod'

// Component Schema
export const componentSchema = z.object({
  id: z.string().uuid().optional(),
  type: z.string().min(1, 'Component type is required'),
  order: z.number().int().min(0).default(0),
  props: z.record(z.string(), z.any()), // Component-specific configuration
})

// Column Schema
export const columnSchema = z.object({
  id: z.string().uuid().optional(),
  width: z.number().int().min(1).max(12).default(12),
  order: z.number().int().min(0).default(0),
  settings: z.record(z.string(), z.any()).optional(),
  components: z.array(componentSchema).optional().default([]),
})

// Row Schema
export const rowSchema = z.object({
  id: z.string().uuid().optional(),
  order: z.number().int().min(0).default(0),
  settings: z.record(z.string(), z.any()).optional(),
  columns: z.array(columnSchema).optional().default([]),
})

// Section Schema
export const sectionSchema = z.object({
  id: z.string().uuid().optional(),
  name: z.string().min(1, 'Section name is required'),
  order: z.number().int().min(0).default(0),
  settings: z.record(z.string(), z.any()).optional(),
  rows: z.array(rowSchema).optional().default([]),
})

// SEO Schema
export const seoSchema = z.object({
  title: z.string().optional(),
  description: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  ogTitle: z.string().optional(),
  ogDescription: z.string().optional(),
  ogImage: z.string().url().optional(),
  canonical: z.string().url().optional(),
})

// ==================== Body Schemas ====================

// Create Page Builder (Body)
export const createPageBuilderBodySchema = z.object({
  title: z.string().min(1, 'Page title is required').max(200),
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
    .optional(), // Optional - will be auto-generated from title
  description: z.string().optional(),
  sections: z.array(sectionSchema).optional().default([]),
  seo: seoSchema.optional(),
  isPublished: z.boolean().default(false),
})

// Update Page Builder (Body)
export const updatePageBuilderBodySchema = z.object({
  title: z.string().min(1).max(200).optional(),
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
    .optional(),
  description: z.string().optional(),
  content: z
    .object({
      sections: z.array(sectionSchema).optional().default([]),
    })
    .optional(),
  seo: seoSchema.optional(),
  isPublished: z.boolean().optional(),
})

// ==================== Params Schemas ====================

export const pageIdParamsSchema = z.object({
  id: z.string().uuid('Invalid page ID'),
})

export const identifierParamsSchema = z.object({
  identifier: z.string().min(1, 'Page ID or slug is required'),
})

export const sectionParamsSchema = z.object({
  pageId: z.string().uuid('Invalid page ID'),
  sectionId: z.string().uuid('Invalid section ID'),
})

export const rowParamsSchema = z.object({
  pageId: z.string().uuid('Invalid page ID'),
  sectionId: z.string().uuid('Invalid section ID'),
  rowId: z.string().uuid('Invalid row ID'),
})

export const columnParamsSchema = z.object({
  pageId: z.string().uuid('Invalid page ID'),
  sectionId: z.string().uuid('Invalid section ID'),
  rowId: z.string().uuid('Invalid row ID'),
  columnId: z.string().uuid('Invalid column ID'),
})

export const componentParamsSchema = z.object({
  pageId: z.string().uuid('Invalid page ID'),
  sectionId: z.string().uuid('Invalid section ID'),
  rowId: z.string().uuid('Invalid row ID'),
  columnId: z.string().uuid('Invalid column ID'),
  componentId: z.string().uuid('Invalid component ID'),
})

export const duplicateParamsSchema = z.object({
  id: z.string().uuid('Invalid page ID'),
})

// ==================== Query Schemas ====================

export const listPageBuildersQuerySchema = z.object({
  isPublished: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
  search: z.string().optional(),
  page: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1))
    .optional()
    .default(() => 1),
  limit: z
    .string()
    .transform((val) => parseInt(val, 10))
    .pipe(z.number().int().min(1).max(100))
    .optional()
    .default(() => 10),
})

// ==================== Specific Body Schemas ====================

export const sectionBodySchema = sectionSchema.omit({ id: true })
export const rowBodySchema = rowSchema.omit({ id: true })
export const columnBodySchema = columnSchema.omit({ id: true })
export const componentBodySchema = componentSchema.omit({ id: true })

export const duplicatePageBodySchema = z.object({
  title: z.string().min(1, 'New page title is required'),
  slug: z
    .string()
    .max(200)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
    .optional(), // Optional - will be auto-generated from title
})

export const updateContentBodySchema = z.object({
  content: z.object({
    sections: z.array(sectionSchema).optional().default([]),
  }),
})

// ==================== Type Exports ====================

export type CreatePageBuilderBodyInput = z.infer<typeof createPageBuilderBodySchema>
export type UpdatePageBuilderBodyInput = z.infer<typeof updatePageBuilderBodySchema>
export type ListPageBuildersQueryInput = z.infer<typeof listPageBuildersQuerySchema>
export type SectionBodyInput = z.infer<typeof sectionBodySchema>
export type RowBodyInput = z.infer<typeof rowBodySchema>
export type ColumnBodyInput = z.infer<typeof columnBodySchema>
export type ComponentBodyInput = z.infer<typeof componentBodySchema>
export type DuplicatePageBodyInput = z.infer<typeof duplicatePageBodySchema>
