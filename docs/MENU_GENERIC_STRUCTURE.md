# MenuItem Generic Structure - Design Documentation

## Overview
Refactored `MenuItem` model from multiple specific fields to a generic, polymorphic design pattern. This follows enterprise CMS best practices for extensibility and maintainability.

## Old Design (❌ Anti-pattern)
```prisma
model MenuItem {
  categoryId  String?
  pageId      String?
  articleId   String?
  link        String?
  // ... adding new entity types requires schema changes
}
```

**Problems:**
- ❌ Schema bloat with multiple nullable fields
- ❌ Not scalable (adding new entity types requires migration)
- ❌ Violates Single Responsibility Principle
- ❌ Complex validation logic needed
- ❌ Difficult to query and maintain

## New Design (✅ Generic Pattern)
```prisma
model MenuItem {
  type          String   // 'link', 'page', 'post', 'category', 'service', 'project', 'custom'
  url           String?  // For external/internal links
  referenceId   String?  // Generic reference to any entity
  referenceType String?  // Entity type: 'Page', 'Post', 'Category', etc.
}
```

**Benefits:**
- ✅ Single source of truth for entity reference
- ✅ Easily extensible (no schema changes for new entity types)
- ✅ Clean, maintainable code
- ✅ Type-safe with enum validation
- ✅ Follows polymorphic association pattern

## Usage Examples

### 1. Link to External URL
```typescript
{
  type: 'external',
  url: 'https://example.com',
  referenceId: null,
  referenceType: null
}
```

### 2. Link to Page
```typescript
{
  type: 'page',
  url: null,
  referenceId: 'page-uuid-123',
  referenceType: 'Page'
}
```

### 3. Link to Category
```typescript
{
  type: 'category',
  url: null,
  referenceId: 'category-uuid-456',
  referenceType: 'Category'
}
```

### 4. Link to Blog Post
```typescript
{
  type: 'post',
  url: null,
  referenceId: 'post-uuid-789',
  referenceType: 'Post'
}
```

### 5. Custom/Parent Menu Item
```typescript
{
  type: 'custom',
  url: null,
  referenceId: null,
  referenceType: null
}
```

### 6. Link to Service
```typescript
{
  type: 'service',
  url: null,
  referenceId: 'service-uuid-321',
  referenceType: 'Service'
}
```

## Type Definitions

### MenuItem Types (Enum)
```typescript
export enum MenuItemType {
  LINK = 'link',           // Internal link
  EXTERNAL = 'external',   // External URL
  PAGE = 'page',           // Page reference
  POST = 'post',           // Blog post reference
  CATEGORY = 'category',   // Category reference
  SERVICE = 'service',     // Service reference
  PROJECT = 'project',     // Project reference
  CUSTOM = 'custom'        // Custom/parent item (no link)
}
```

### Reference Types (Enum)
```typescript
export enum ReferenceType {
  PAGE = 'Page',
  POST = 'Post',
  CATEGORY = 'Category',
  SERVICE = 'Service',
  PROJECT = 'Project'
}
```

## Validation Rules

### Business Logic
```typescript
// Rule 1: If type is 'external' or 'link', url must be provided
if (type === 'external' || type === 'link') {
  assert(url !== null, 'URL is required for link types');
}

// Rule 2: If type references an entity, referenceId and referenceType must be provided
if (['page', 'post', 'category', 'service', 'project'].includes(type)) {
  assert(referenceId !== null, 'Reference ID is required');
  assert(referenceType !== null, 'Reference type is required');
}

// Rule 3: Custom type doesn't require url or reference
if (type === 'custom') {
  // No additional requirements
}
```

## Service Layer Example

```typescript
export class MenuItemService {
  
  async createMenuItem(data: CreateMenuItemDTO) {
    // Normalize based on type
    const normalized = this.normalizeMenuItem(data);
    
    return await prisma.menuItem.create({
      data: normalized
    });
  }
  
  private normalizeMenuItem(data: CreateMenuItemDTO) {
    const { type, url, referenceId, referenceType } = data;
    
    // Validate based on type
    switch (type) {
      case 'external':
      case 'link':
        if (!url) throw new Error('URL is required for link types');
        return { ...data, referenceId: null, referenceType: null };
        
      case 'page':
      case 'post':
      case 'category':
      case 'service':
      case 'project':
        if (!referenceId || !referenceType) {
          throw new Error('Reference ID and type are required');
        }
        return { ...data, url: null };
        
      case 'custom':
        return { ...data, url: null, referenceId: null, referenceType: null };
        
      default:
        throw new Error(`Invalid menu item type: ${type}`);
    }
  }
  
  async resolveMenuItemUrl(item: MenuItem): Promise<string> {
    // If direct URL, return it
    if (item.url) return item.url;
    
    // Resolve reference to URL
    if (item.referenceId && item.referenceType) {
      return await this.resolveReferenceUrl(
        item.referenceId,
        item.referenceType
      );
    }
    
    // Custom items (parent menus) don't have URLs
    return '#';
  }
  
  private async resolveReferenceUrl(id: string, type: string): Promise<string> {
    switch (type) {
      case 'Page':
        const page = await prisma.page.findUnique({ where: { id } });
        return `/pages/${page?.slug}`;
        
      case 'Post':
        const post = await prisma.post.findUnique({ where: { id } });
        return `/blog/${post?.slug}`;
        
      case 'Category':
        const category = await prisma.category.findUnique({ where: { id } });
        return `/category/${category?.slug}`;
        
      case 'Service':
        const service = await prisma.service.findUnique({ where: { id } });
        return `/services/${service?.slug}`;
        
      case 'Project':
        const project = await prisma.project.findUnique({ where: { id } });
        return `/projects/${project?.slug}`;
        
      default:
        throw new Error(`Unknown reference type: ${type}`);
    }
  }
}
```

## Migration Strategy

### Step 1: Update Schema
```bash
bun prisma db push
```

### Step 2: Run Data Migration
```bash
bun run prisma/migrate-menuitem-structure.ts
```

### Step 3: Update Services & Controllers
- Update DTOs to use new fields
- Implement validation logic
- Update URL resolution logic

## API Response Example

### Before (Frontend receives)
```json
{
  "id": "uuid",
  "title": "About Us",
  "type": "page",
  "url": null,
  "referenceId": "page-uuid-123",
  "referenceType": "Page"
}
```

### After Resolution (Service processes)
```json
{
  "id": "uuid",
  "title": "About Us",
  "type": "page",
  "url": "/pages/about-us",
  "resolvedUrl": "/pages/about-us"
}
```

## Future Extensibility

Adding a new entity type (e.g., "Product"):

1. **No schema changes needed** ✅
2. Just add to enums:
```typescript
export enum MenuItemType {
  // ... existing types
  PRODUCT = 'product'  // Add new type
}

export enum ReferenceType {
  // ... existing types
  PRODUCT = 'Product'  // Add new reference
}
```

3. Add URL resolution logic:
```typescript
case 'Product':
  const product = await prisma.product.findUnique({ where: { id } });
  return `/products/${product?.slug}`;
```

## Advantages Summary

1. **Scalability**: Add new entity types without schema migrations
2. **Maintainability**: Single place to manage entity references
3. **Type Safety**: Enum-based validation
4. **Performance**: Indexed fields for fast queries
5. **Flexibility**: Meta field for additional data
6. **Standards**: Follows polymorphic association pattern from Rails, Laravel, etc.

## Related Files
- Schema: `prisma/schema.prisma`
- Migration: `prisma/migrate-menuitem-structure.ts`
- Service: `src/services/menu/menu.service.ts`
- Types: `src/types/menu.types.ts`
- Validators: `src/validators/menu.validator.ts`
