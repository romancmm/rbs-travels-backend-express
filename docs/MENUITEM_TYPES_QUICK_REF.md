# MenuItem Types - Quick Reference

## Type Overview

| Type               | Required Fields | Validation                              | Use Case                                  |
| ------------------ | --------------- | --------------------------------------- | ----------------------------------------- |
| `page`             | `reference`     | Slug format                             | Link to a Page entity                     |
| `post`             | `reference`     | Slug format                             | Link to a Blog Post entity                |
| `category`         | `reference`     | Slug format                             | Link to a Category entity                 |
| `service`          | `reference`     | Slug format                             | Link to a Service entity                  |
| `project`          | `reference`     | Slug format                             | Link to a Project entity                  |
| `custom` 🔶        | `url`           | Any string                              | Legacy: Custom URL (internal or external) |
| `custom-link` ✅   | `url`           | Any string                              | Custom URL (internal or external)         |
| `external` 🔶      | `url`           | Must start with `http://` or `https://` | Legacy: External link                     |
| `external-link` ✅ | `url`           | Must start with `http://` or `https://` | External link to third-party site         |

🔶 = Legacy type (still supported, but prefer new types)  
✅ = Recommended type for new menu items

## Quick Examples

### Entity Reference Types

```json
{
  "title": "About Page",
  "type": "page",
  "reference": "about-us",
  "url": null
}
```

**Resolved URL**: `/about-us`

```json
{
  "title": "Latest Article",
  "type": "post",
  "reference": "my-blog-post-slug",
  "url": null
}
```

**Resolved URL**: `/blog/my-blog-post-slug`

### Custom Link (Internal)

```json
{
  "title": "Dashboard",
  "type": "custom-link",
  "reference": null,
  "url": "/dashboard"
}
```

**Resolved URL**: `/dashboard`

### Custom Link (External)

```json
{
  "title": "Partner Site",
  "type": "custom-link",
  "reference": null,
  "url": "https://partner.example.com/page"
}
```

**Resolved URL**: `https://partner.example.com/page`

### External Link

```json
{
  "title": "External Resource",
  "type": "external-link",
  "reference": null,
  "url": "https://example.com"
}
```

**Resolved URL**: `https://example.com`

## Validation Rules

### Entity Types (page, post, category, service, project)

- ✅ `reference` is required
- ✅ `reference` must be a valid slug format: `^[a-z0-9]+(?:-[a-z0-9]+)*$`
- ✅ `url` is optional (auto-resolved from reference)
- ❌ Cannot be `null` for reference

### Custom Link Types (custom, custom-link)

- ✅ `url` is required
- ✅ `url` can be any string (relative or absolute)
- ✅ Supports both `/internal-path` and `https://external.com`
- ❌ `url` cannot be `null` or empty

### External Link Types (external, external-link)

- ✅ `url` is required
- ✅ `url` must start with `http://` or `https://`
- ❌ Relative paths are not allowed
- ❌ `url` cannot be `null` or empty

## Common Patterns

### Navigation Menu

```json
{
  "name": "Main Menu",
  "items": [
    { "title": "Home", "type": "custom-link", "url": "/" },
    { "title": "Services", "type": "page", "reference": "services" },
    { "title": "Blog", "type": "custom-link", "url": "/blog" },
    { "title": "Contact", "type": "page", "reference": "contact-us" }
  ]
}
```

### Footer Menu

```json
{
  "name": "Footer Menu",
  "items": [
    { "title": "Privacy Policy", "type": "page", "reference": "privacy-policy" },
    { "title": "Terms of Service", "type": "page", "reference": "terms-of-service" },
    { "title": "Facebook", "type": "external-link", "url": "https://facebook.com/yourpage" },
    { "title": "Twitter", "type": "external-link", "url": "https://twitter.com/yourhandle" }
  ]
}
```

### Mega Menu with Categories

```json
{
  "name": "Mega Menu",
  "items": [
    {
      "title": "Blog",
      "type": "custom-link",
      "url": "/blog",
      "children": [
        { "title": "Technology", "type": "category", "reference": "technology" },
        { "title": "Business", "type": "category", "reference": "business" },
        { "title": "All Posts", "type": "custom-link", "url": "/blog/all" }
      ]
    }
  ]
}
```

## Type Guards (TypeScript)

```typescript
import { isExternalMenuItem, isCustomMenuItem } from '@/types/menu.types'

// Check if menu item is external
if (isExternalMenuItem(item)) {
  // item.type is 'external-link' or 'external-link'
  // Open in new tab: target="_blank"
}

// Check if menu item uses custom URL
if (isCustomMenuItem(item)) {
  // item.type is 'custom-link', 'custom-link', 'external-link', or 'external-link'
  // Use item.url directly
}
```

## URL Resolution Helper

```typescript
import { getMenuItemUrl } from '@/types/menu.types'

const url = getMenuItemUrl(menuItem)
// Returns:
// - item.url if set (for custom/external types)
// - Constructed URL from reference (for entity types)
// - null if neither is available
```

## Migration from Legacy Types

### From `custom` to `custom-link`

```json
// Before (Legacy)
{
  "title": "Link",
  "type": "custom",
  "url": "/some-path"
}

// After (Recommended)
{
  "title": "Link",
  "type": "custom-link",
  "url": "/some-path"
}
```

### From `external` to `external-link`

```json
// Before (Legacy)
{
  "title": "External",
  "type": "external",
  "url": "https://example.com"
}

// After (Recommended)
{
  "title": "External",
  "type": "external-link",
  "url": "https://example.com"
}
```

**Note**: No database migration needed - just update the `type` field value.

## API Endpoints

### Create Menu Item

```bash
POST /api/v1/admin/menu/:menuId/items
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Menu Item Title",
  "type": "custom-link",
  "url": "/path",
  "icon": "icon-name",
  "target": "_self",
  "order": 0,
  "isPublished": true
}
```

### Update Menu Item

```bash
PUT /api/v1/admin/menu/:menuId/items/:itemId
Content-Type: application/json
Authorization: Bearer {token}

{
  "type": "external-link",
  "url": "https://example.com",
  "target": "_blank"
}
```

## Error Messages

### Missing URL for Link Types

```json
{
  "error": "URL is required for custom-link type"
}
```

### Invalid URL for External Types

```json
{
  "error": "External links must start with http:// or https://"
}
```

### Missing Reference for Entity Types

```json
{
  "error": "Reference (slug) is required for page type"
}
```

### Invalid Slug Format

```json
{
  "error": "Invalid slug format"
}
```

## Best Practices

1. **Use Entity Types When Possible**: Link to actual entities (`page`, `post`, etc.) rather than
   hardcoding URLs
2. **Prefer New Types**: Use `custom-link` and `external-link` for new menu items
3. **Validate External URLs**: Always include protocol for external links
4. **Set Target Appropriately**: Use `_blank` for external links, `_self` for internal
5. **Use Slugs for Entity References**: Always use the entity's slug, not its ID or full URL
6. **Order Matters**: Set the `order` field to control menu item sequence
7. **Test URL Resolution**: Use `getMenuItemUrl()` helper to verify URLs are resolved correctly

## Summary

- **9 Total Types**: 5 entity types + 4 link types
- **Backward Compatible**: Legacy `custom` and `external` types still work
- **Enhanced Validation**: URL format and protocol validation for external links
- **Type Safety**: Full TypeScript and Zod schema support
- **Flexible**: Supports entity references, internal paths, and external URLs
