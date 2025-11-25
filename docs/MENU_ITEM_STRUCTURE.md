# MenuItem Generic Structure

## Overview

The MenuItem model uses a **generic, polymorphic pattern** to handle all types of menu items
efficiently. This is a professional, enterprise-grade approach used by major CMS platforms.

## Schema

```prisma
model MenuItem {
  id          String     @id @default(uuid())
  menuId      String
  title       String
  slug        String     @unique
  type        String     // Menu item type
  referenceId String?    // UUID of referenced entity
  url         String?    // Resolved or custom URL
  icon        String?
  target      String     @default("_self")
  cssClass    String?
  parentId    String?
  order       Int        @default(0)
  isPublished Boolean    @default(true)
  meta        Json?
  // ... relations and timestamps
}
```

## Field Descriptions

### Core Fields

- **`type`**: Defines the menu item type

  - `page` - Links to a Page
  - `post` - Links to a Post/Article
  - `category` - Links to a Category
  - `service` - Links to a Service
  - `project` - Links to a Project
  - `custom` - Custom internal link
  - `external` - External link

- **`referenceId`**: UUID of the referenced entity

  - Used for: `page`, `post`, `category`, `service`, `project`
  - Should be `null` for: `custom`, `external`

- **`url`**: The actual URL or path
  - Can be auto-resolved from `referenceId` for entity types
  - Required for `custom` and `external` types
  - Examples: `/about-us`, `https://example.com`

## Usage Examples

### 1. Page Link

```json
{
  "title": "About Us",
  "slug": "about-us",
  "type": "page",
  "referenceId": "uuid-of-page",
  "url": "/about-us",
  "target": "_self"
}
```

### 2. External Link

```json
{
  "title": "Google",
  "slug": "google",
  "type": "external",
  "referenceId": null,
  "url": "https://google.com",
  "target": "_blank"
}
```

### 3. Custom Internal Link

```json
{
  "title": "Dashboard",
  "slug": "dashboard",
  "type": "custom",
  "referenceId": null,
  "url": "/dashboard",
  "target": "_self"
}
```

### 4. Service Reference

```json
{
  "title": "Web Development",
  "slug": "web-development",
  "type": "service",
  "referenceId": "uuid-of-service",
  "url": "/services/web-development",
  "target": "_self"
}
```

### 5. Category Link

```json
{
  "title": "Travel Blog",
  "slug": "travel-blog",
  "type": "category",
  "referenceId": "uuid-of-category",
  "url": "/blog/category/travel",
  "target": "_self"
}
```

### 6. Parent Menu Item (Dropdown)

```json
{
  "title": "Services",
  "slug": "services-menu",
  "type": "custom",
  "referenceId": null,
  "url": null,
  "target": "_self",
  "children": [
    {
      "title": "Web Development",
      "type": "service",
      "referenceId": "uuid-of-service"
    }
  ]
}
```

## Validation Rules

### Type: `page`, `post`, `category`, `service`, `project`

- **Required**: `referenceId` (UUID)
- **Optional**: `url` (can be auto-resolved)

### Type: `custom`, `external`

- **Required**: `url`
- **Not used**: `referenceId` should be `null`

### Type: `external`

- URL must start with `http://` or `https://`
- Commonly used with `target: "_blank"`

## Benefits of This Approach

1. **Single Source of Truth**: One field (`type`) defines the item behavior
2. **Scalable**: Easy to add new entity types (e.g., `product`, `event`)
3. **Type-Safe**: Clear validation rules per type
4. **Database Efficient**: No unused columns with null values
5. **Frontend Friendly**: Simple to parse and render
6. **Industry Standard**: Used by WordPress, Drupal, Strapi, etc.

## Migration from Old Structure

Old structure had separate fields:

- `categoryId`
- `pageId`
- `articleId`
- `link`

New structure consolidates to:

- `type` - What kind of item
- `referenceId` - Which entity (if applicable)
- `url` - The actual link

### Migration Example

**Before:**

```json
{
  "title": "About",
  "pageId": "uuid-123",
  "link": null,
  "categoryId": null,
  "articleId": null
}
```

**After:**

```json
{
  "title": "About",
  "type": "page",
  "referenceId": "uuid-123",
  "url": "/about"
}
```

## API Usage

### Create Menu Item

```bash
POST /admin/menu/{menuId}/items
Content-Type: application/json

{
  "title": "About Us",
  "type": "page",
  "referenceId": "page-uuid",
  "url": "/about-us",
  "order": 1,
  "isPublished": true
}
```

### Update Menu Item

```bash
PUT /admin/menu/{menuId}/items/{itemId}
Content-Type: application/json

{
  "title": "About Our Company",
  "url": "/about-our-company"
}
```

## Frontend Implementation

```typescript
// Render menu item based on type
function renderMenuItem(item: MenuItem) {
  switch (item.type) {
    case 'page':
    case 'post':
    case 'category':
    case 'service':
    case 'project':
      // Internal link - use Next.js Link or React Router
      return <Link href={item.url}>{item.title}</Link>

    case 'external-link':
      // External link - open in new tab
      return (
        <a href={item.url} target={item.target} rel="noopener noreferrer">
          {item.title}
        </a>
      )

    case 'custom-link':
      // Custom internal link
      return <Link href={item.url}>{item.title}</Link>

    default:
      return <span>{item.title}</span>
  }
}
```

## Best Practices

1. **Always set `slug`**: Auto-generated from title if not provided
2. **URL Resolution**: For entity types, resolve URL from the entity's slug
3. **Cache Strategy**: Menu items are cached in the Menu's `itemsCache` field
4. **Nested Items**: Support up to 3 levels (parent → child → grandchild)
5. **Order Management**: Use the `order` field for positioning
6. **Publishing**: Use `isPublished` to show/hide items without deletion

## Adding New Entity Types

To add a new entity type (e.g., `product`):

1. Add to TypeScript enum in validators:

```typescript
export const MenuItemTypeEnum = z.enum([
  'page',
  'post',
  'category',
  'service',
  'project',
  'product', // NEW
  'custom-link',
  'external-link',
])
```

2. Add validation rule:

```typescript
if (data.type === 'product' && !data.referenceId) {
  ctx.addIssue({
    message: 'Reference ID is required for product type',
    path: ['referenceId'],
  })
}
```

3. Update OpenAPI docs
4. No database changes needed! ✨
