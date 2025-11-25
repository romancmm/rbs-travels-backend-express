# MenuItem Type Enhancement - Custom-Link & External-Link Support

## Overview

Enhanced the MenuItem system to support `custom-link` and `external-link` as distinct types, while
maintaining backward compatibility with legacy `custom` and `external` types.

## Changes Made

### 1. Type Definitions (`src/types/menu.types.ts`)

**Updated MenuItemType Enum:**

```typescript
export type MenuItemType =
  | 'page'
  | 'post'
  | 'category'
  | 'service'
  | 'project'
  | 'custom' // Legacy: internal/external links
  | 'custom-link' // NEW: custom URL (internal or external)
  | 'external' // Legacy: external links
  | 'external-link' // NEW: explicit external link with validation
```

**Updated Type Guards:**

```typescript
export const isExternalMenuItem = (item: MenuItem): boolean => {
  return ['external', 'external-link'].includes(item.type)
}

export const isCustomMenuItem = (item: MenuItem): boolean => {
  return ['custom', 'custom-link', 'external', 'external-link'].includes(item.type)
}
```

### 2. Validation (`src/validators/menu.validator.ts`)

**Updated MenuItemTypeEnum:**

```typescript
export const MenuItemTypeEnum = z.enum([
  'page',
  'post',
  'category',
  'service',
  'project',
  'custom',
  'custom-link',
  'external',
  'external-link',
])
```

**Enhanced Validation Logic:** All three validation schemas (`createMenuItemBodySchema`,
`createMenuItemBodySchema` for create, and `updateMenuItemBodySchema`) now include:

1. **URL Requirement**: All link types require a URL

   ```typescript
   if (['custom', 'custom-link', 'external', 'external-link'].includes(data.type)) {
     if (!data.url || data.url === null) {
       ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: `URL is required for ${data.type} type`,
         path: ['url'],
       })
     }
   }
   ```

2. **HTTP/HTTPS Validation**: External links must start with `http://` or `https://`
   ```typescript
   else if (['external', 'external-link'].includes(data.type)) {
     if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
       ctx.addIssue({
         code: z.ZodIssueCode.custom,
         message: 'External links must start with http:// or https://',
         path: ['url'],
       })
     }
   }
   ```

### 3. Database Schema (`prisma/schema.prisma`)

**Updated Comment:**

```prisma
model MenuItem {
  // ... fields
  type        String     // 'page' | 'post' | 'category' | 'service' | 'project' | 'custom' | 'custom-link' | 'external' | 'external-link'
  reference   String?    // Slug of referenced entity (page/post/category/service/project)
  url         String?    // URL for custom/external links or resolved URL
  // ... rest of schema
}
```

### 4. Service Layer (`src/services/menu/menu.service.ts`)

**Updated Type Comments:** Both `addMenuItem` and `updateMenuItem` method signatures now document
all supported types:

```typescript
type: string // 'page' | 'post' | 'category' | 'service' | 'project' | 'custom' | 'custom-link' | 'external' | 'external-link'
```

## Type Behavior

### Entity Reference Types (page, post, category, service, project)

- **Required Field**: `reference` (slug of entity)
- **Optional Field**: `url` (resolved URL)
- **URL Resolution**: Handled by `getMenuItemUrl()` helper
  - `page` → `/{slug}`
  - `post` → `/blog/{slug}`
  - `category` → `/category/{slug}`
  - `service` → `/services/{slug}`
  - `project` → `/projects/{slug}`

### Custom Link Types (custom, custom-link)

- **Required Field**: `url`
- **Validation**: Any valid URL string
- **Use Case**: Internal relative links (`/about`) or external absolute links
  (`https://example.com`)
- **Note**: `custom-link` is the preferred type; `custom` is legacy

### External Link Types (external, external-link)

- **Required Field**: `url`
- **Validation**: Must start with `http://` or `https://`
- **Use Case**: Explicit external links to third-party sites
- **Note**: `external-link` is the preferred type; `external` is legacy

## Migration Notes

### From Legacy Types

- `custom` → Use `custom-link` for new menu items
- `external` → Use `external-link` for new menu items

### Backward Compatibility

- All existing menu items with `custom` or `external` types will continue to work
- Type guards and validation handle both legacy and new types
- No database migration required - types are stored as strings

## URL Helper Function

The `getMenuItemUrl()` function in `src/types/menu.types.ts` handles URL resolution:

```typescript
export const getMenuItemUrl = (item: MenuItem): string | null => {
  // Return existing URL if set (for custom/external types)
  if (item.url) return item.url

  // For entity types, construct URL from reference (slug)
  if (item.reference) {
    switch (item.type) {
      case 'page':
        return `/${item.reference}`
      case 'post':
        return `/blog/${item.reference}`
      case 'category':
        return `/category/${item.reference}`
      case 'service':
        return `/services/${item.reference}`
      case 'project':
        return `/projects/${item.reference}`
    }
  }

  return null
}
```

## Testing Recommendations

### 1. Test Custom Link Types

```bash
# Create custom-link (internal)
POST /api/v1/admin/menu/{menuId}/items
{
  "title": "About Us",
  "type": "custom-link",
  "url": "/about"
}

# Create custom-link (external)
POST /api/v1/admin/menu/{menuId}/items
{
  "title": "Partner Site",
  "type": "custom-link",
  "url": "https://partner.com"
}
```

### 2. Test External Link Types

```bash
# Create external-link (valid)
POST /api/v1/admin/menu/{menuId}/items
{
  "title": "External Resource",
  "type": "external-link",
  "url": "https://example.com"
}

# Create external-link (invalid - should fail)
POST /api/v1/admin/menu/{menuId}/items
{
  "title": "Invalid External",
  "type": "external-link",
  "url": "/relative-path"  # Error: External links must start with http:// or https://
}
```

### 3. Test Legacy Types

```bash
# Verify legacy 'custom' type still works
POST /api/v1/admin/menu/{menuId}/items
{
  "title": "Legacy Custom",
  "type": "custom",
  "url": "/legacy"
}
```

### 4. Test Validation Errors

```bash
# Test missing URL for custom-link
POST /api/v1/admin/menu/{menuId}/items
{
  "title": "Missing URL",
  "type": "custom-link"
  # Error: URL is required for custom-link type
}

# Test missing reference for page type
POST /api/v1/admin/menu/{menuId}/items
{
  "title": "Missing Reference",
  "type": "page"
  # Error: Reference (slug) is required for page type
}
```

## Benefits

1. **Explicit Intent**: `custom-link` vs `external-link` makes the developer's intent clear
2. **Enhanced Validation**: External links are validated to ensure proper HTTP/HTTPS protocol
3. **Backward Compatible**: Legacy `custom` and `external` types continue to work
4. **Type Safety**: TypeScript types and Zod schemas ensure compile-time and runtime type safety
5. **Flexible**: Supports both internal relative paths and external absolute URLs

## Summary

The MenuItem system now supports 9 distinct types with proper validation:

- **Entity Types** (5): `page`, `post`, `category`, `service`, `project`
- **Link Types** (4): `custom`, `custom-link`, `external`, `external-link`

All validation, type guards, and service layer have been updated to handle the new types while
maintaining full backward compatibility with existing menu items.
