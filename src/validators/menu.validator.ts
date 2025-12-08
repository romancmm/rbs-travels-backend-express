import { z } from 'zod'

// Menu Item Type Enum
export const MenuItemTypeEnum = z.enum([
  'category-articles',
  'single-article',
  'page',
  'gallery',
  'custom-link',
  'external-link',
])

// Menu Item Target Enum
export const MenuItemTargetEnum = z.enum(['_self', '_blank'])

// Get Menu Item By Slug Params
export const getMenuItemBySlugParamsSchema = z.object({
  slug: z.string().min(1, 'Slug is required'),
})

// Menu Item Schema (for nested items)
const menuItemSchema: z.ZodType<any> = z.lazy(() =>
  z
    .object({
      id: z.string().uuid().optional(),
      title: z.string().min(1, 'Title is required'),
      slug: z
        .string()
        .min(1)
        .max(100)
        .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
        .optional(),
      type: MenuItemTypeEnum,
      reference: z
        .union([z.string(), z.array(z.string())])
        .nullable()
        .optional(), // String OR Array
      url: z.string().nullable().optional(), // URL for custom/external links or resolved URL
      icon: z.string().optional(),
      target: MenuItemTargetEnum.default('_self'),
      cssClass: z.string().optional(),
      parentId: z.string().uuid().nullable().optional(),
      order: z.number().int().min(0).default(0),
      isPublished: z.boolean().default(true),
      meta: z.record(z.string(), z.any()).optional(),
      children: z.array(menuItemSchema).optional(),
    })
    .superRefine((data, ctx) => {
      // Category-articles requires array of references
      if (data.type === 'category-articles') {
        if (!Array.isArray(data.reference) || data.reference.length === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'At least one category is required for category-articles type',
            path: ['reference'],
          })
        }
      }

      // Entity types require single string reference
      if (['single-article', 'page', 'gallery'].includes(data.type)) {
        if (!data.reference || typeof data.reference !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Reference (slug) is required for ${data.type} type`,
            path: ['reference'],
          })
        }
      }

      // Link types require URL
      if (['custom-link', 'external-link'].includes(data.type)) {
        if (!data.url || data.url === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `URL is required for ${data.type} type`,
            path: ['url'],
          })
        } else if (data.type === 'external-link') {
          // Validate external links must start with http:// or https://
          if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'External links must start with http:// or https://',
              path: ['url'],
            })
          }
        }
      }
    })
)

// Create Menu Validation (Body)
export const createMenuSchema = z.object({
  name: z.string().min(1, 'Menu name is required').max(100),
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
    .optional(), // Optional - will be auto-generated from name
  position: z.string().optional(),
  description: z.string().optional(),
  items: z.array(menuItemSchema).optional().default([]),
  isPublished: z.boolean().default(false),
})

// Update Menu Validation (Body)
export const updateMenuBodySchema = z.object({
  name: z.string().min(1).max(100).optional(),
  slug: z
    .string()
    .max(100)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
    .optional(),
  position: z.string().optional(),
  description: z.string().optional(),
  items: z.array(menuItemSchema).optional(),
  isPublished: z.boolean().optional(),
})

// Update Menu Validation (Params)
export const updateMenuParamsSchema = z.object({
  id: z.string().uuid('Invalid menu ID'),
})

// Get Menu by ID/Slug Validation (Params)
export const getMenuParamsSchema = z.object({
  identifier: z.string().min(1, 'Menu ID or slug is required'),
})

// Delete Menu Validation (Params)
export const deleteMenuParamsSchema = z.object({
  id: z.string().uuid('Invalid menu ID'),
})

// Create Menu Item Validation (Body)
export const createMenuItemBodySchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
      .optional(), // Optional - will be auto-generated if not provided
    type: MenuItemTypeEnum,
    reference: z
      .union([z.string(), z.array(z.string())])
      .nullable()
      .optional(), // String OR Array
    url: z.string().nullable().optional(), // URL for custom/external links or resolved URL
    icon: z.string().optional(),
    target: MenuItemTargetEnum.default('_self'),
    cssClass: z.string().optional(),
    parentId: z.string().uuid().nullable().optional(),
    order: z.number().int().min(0).default(0),
    isPublished: z.boolean().default(true),
    meta: z.record(z.string(), z.any()).optional(),
  })
  .superRefine((data, ctx) => {
    // Category-articles requires array of references
    if (data.type === 'category-articles') {
      if (!Array.isArray(data.reference) || data.reference.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one category is required for category-articles type',
          path: ['reference'],
        })
      }
    }

    // Entity types require single string reference
    if (['single-article', 'page', 'gallery'].includes(data.type)) {
      if (!data.reference || typeof data.reference !== 'string') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `Reference (slug) is required for ${data.type} type`,
          path: ['reference'],
        })
      }
    }

    // Link types require URL
    if (['custom-link', 'external-link'].includes(data.type)) {
      if (!data.url || data.url === null) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: `URL is required for ${data.type} type`,
          path: ['url'],
        })
      } else if (data.type === 'external-link') {
        // Validate external links must start with http:// or https://
        if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'External links must start with http:// or https://',
            path: ['url'],
          })
        }
      }
    }
  })

// Create Menu Item Validation (Params)
export const createMenuItemParamsSchema = z.object({
  menuId: z.string().uuid('Invalid menu ID'),
})

// Update Menu Item Validation (Body)
export const updateMenuItemBodySchema = z
  .object({
    title: z.string().min(1).optional(),
    slug: z
      .string()
      .min(1)
      .max(100)
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Invalid slug format')
      .optional(),
    type: MenuItemTypeEnum.optional(),
    reference: z
      .union([z.string(), z.array(z.string())])
      .nullable()
      .optional(), // String OR Array
    url: z.string().nullable().optional(), // URL for custom/external links or resolved URL
    icon: z.string().optional(),
    target: MenuItemTargetEnum.optional(),
    cssClass: z.string().optional(),
    parentId: z.string().uuid().nullable().optional(),
    order: z.number().int().min(0).optional(),
    isPublished: z.boolean().optional(),
    meta: z.record(z.string(), z.any()).optional(),
  })
  .superRefine((data, ctx) => {
    // Only validate if type is being updated together with required fields

    // Category-articles validation
    if (data.type === 'category-articles' && data.reference !== undefined) {
      if (!Array.isArray(data.reference) || data.reference.length === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'At least one category is required for category-articles type',
          path: ['reference'],
        })
      }
    }

    // Entity types validation
    if (data.type && data.reference !== undefined) {
      if (['single-article', 'page', 'gallery'].includes(data.type)) {
        if (data.reference !== null && typeof data.reference !== 'string') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Reference must be a string for ${data.type} type`,
            path: ['reference'],
          })
        }
      }
    }

    // Link types validation
    if (data.type && data.url !== undefined) {
      if (['custom-link', 'external-link'].includes(data.type)) {
        if (!data.url || data.url === null) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `URL is required for ${data.type} type`,
            path: ['url'],
          })
        } else if (data.type === 'external-link') {
          // Validate external links must start with http:// or https://
          if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
            ctx.addIssue({
              code: z.ZodIssueCode.custom,
              message: 'External links must start with http:// or https://',
              path: ['url'],
            })
          }
        }
      }
    }
  })

// Update Menu Item Validation (Params)
export const updateMenuItemParamsSchema = z.object({
  menuId: z.string().uuid('Invalid menu ID'),
  itemId: z.string().uuid('Invalid menu item ID'),
})

// Delete Menu Item Validation (Params)
export const deleteMenuItemParamsSchema = z.object({
  menuId: z.string().uuid('Invalid menu ID'),
  itemId: z.string().uuid('Invalid menu item ID'),
})

// Reorder Menu Items Validation (Body)
export const reorderMenuItemsBodySchema = z.object({
  items: z.array(
    z.object({
      id: z.string().uuid(),
      order: z.number().int().min(0),
      parentId: z.string().uuid().nullable().optional(),
    })
  ),
})

// Reorder Menu Items Validation (Params)
export const reorderMenuItemsParamsSchema = z.object({
  menuId: z.string().uuid('Invalid menu ID'),
})

// Query validation for listing menus
export const listMenusQuerySchema = z.object({
  position: z.string().optional(),
  isPublished: z
    .string()
    .transform((val) => val === 'true')
    .optional(),
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

export type CreateMenuInput = z.infer<typeof createMenuSchema>
export type UpdateMenuBodyInput = z.infer<typeof updateMenuBodySchema>
export type CreateMenuItemBodyInput = z.infer<typeof createMenuItemBodySchema>
export type UpdateMenuItemBodyInput = z.infer<typeof updateMenuItemBodySchema>
export type ReorderMenuItemsBodyInput = z.infer<typeof reorderMenuItemsBodySchema>
export type ListMenusQueryInput = z.infer<typeof listMenusQuerySchema>
