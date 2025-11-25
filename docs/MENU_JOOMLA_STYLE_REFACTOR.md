# Menu System - Joomla-Style Refactoring

## Overview

Refactored the MenuItem type system to follow Joomla CMS concepts, providing a flexible and powerful
menu management system that can handle any type of content.

## New Architecture

### Type System

The menu system now supports **7 distinct MenuItem types**:

| Type                 | Purpose                                                               | Required Field                                  | Example Use Case                                           |
| -------------------- | --------------------------------------------------------------------- | ----------------------------------------------- | ---------------------------------------------------------- |
| **`category-blog`**  | Category listing page showing multiple posts from selected categories | `references[]` (array of category slugs/IDs)    | Blog category pages, filtered listings                     |
| **`single-article`** | Single blog post/article                                              | `reference` (article slug/ID)                   | Direct link to a blog post                                 |
| **`page`**           | Single page                                                           | `reference` (page slug/ID)                      | About Us, Contact, etc.                                    |
| **`service`**        | Single service                                                        | `reference` (service slug/ID)                   | Service detail pages                                       |
| **`project`**        | Single project                                                        | `reference` (project slug/ID)                   | Portfolio project pages                                    |
| **`custom-link`**    | Custom URL (internal or external)                                     | `url`                                           | Any custom path like `/dashboard` or `https://partner.com` |
| **`external-link`**  | External link with validation                                         | `url` (must start with `http://` or `https://`) | Links to third-party websites                              |

### Database Schema

```prisma
model MenuItem {
  id          String     @id @default(uuid())
  menuId      String
  title       String
  slug        String     @unique
  type        String     // Type of menu item
  reference   String?    // Slug/ID of single referenced entity
  references  String[]   @default([]) // Array of slugs/IDs for category-blog
  url         String?    // URL for custom/external links
  icon        String?
  target      String     @default("_self")
  cssClass    String?
  parentId    String?
  order       Int        @default(0)
  isPublished Boolean    @default(true)
  meta        Json?
  createdAt   DateTime   @default(now())
  updatedAt   DateTime   @updatedAt

  menu        Menu       @relation(fields: [menuId], references: [id], onDelete: Cascade)
  parent      MenuItem?  @relation("MenuItemChildren", fields: [parentId], references: [id])
  children    MenuItem[] @relation("MenuItemChildren")

  @@index([menuId])
  @@index([parentId])
  @@index([type])
  @@index([reference])
  @@index([order])
  @@index([slug])
  @@index([isPublished])
}
```

### Key Changes

1. **New Field: `references[]`**

   - Array of strings for storing multiple category IDs/slugs
   - Used by `category-blog` type to link to multiple categories
   - Default: empty array `[]`

2. **Flexible Reference System**

   - **`reference`** (singular): For linking to a single entity (page, article, service, project)
   - **`references`** (plural): For linking to multiple entities (category-blog with multiple
     categories)

3. **Simplified Types**
   - Removed legacy types: `post`, `category`, `custom`, `external`
   - Replaced with: `category-blog`, `single-article`, `custom-link`, `external-link`
   - Total: 7 types instead of 9

## Type Details

### 1. Category-Blog Type

Shows a listing of blog posts from one or more categories.

**Required Field:** `references[]` (array of category slugs/IDs)

**Examples:**

```json
// Single category
{
  "title": "Technology Blog",
  "type": "category-blog",
  "references": ["technology"],
  "reference": null,
  "url": null
}

// Multiple categories
{
  "title": "Tech & Business",
  "type": "category-blog",
  "references": ["technology", "business"],
  "reference": null,
  "url": null
}
```

**URL Resolution:**

- Single category: `/blog/category/{slug}`
- Multiple categories: `/blog?categories=tech,business`
- No categories: `/blog` (default listing)

### 2. Single-Article Type

Links to a specific blog post/article.

**Required Field:** `reference` (article slug/ID)

**Example:**

```json
{
  "title": "Latest News",
  "type": "single-article",
  "reference": "my-latest-post",
  "references": [],
  "url": null
}
```

**URL Resolution:** `/blog/{slug}`

### 3. Page Type

Links to a CMS page.

**Required Field:** `reference` (page slug/ID)

**Example:**

```json
{
  "title": "About Us",
  "type": "page",
  "reference": "about-us",
  "references": [],
  "url": null
}
```

**URL Resolution:** `/{slug}`

### 4. Service Type

Links to a service detail page.

**Required Field:** `reference` (service slug/ID)

**Example:**

```json
{
  "title": "Web Development",
  "type": "service",
  "reference": "web-development",
  "references": [],
  "url": null
}
```

**URL Resolution:** `/services/{slug}`

### 5. Project Type

Links to a portfolio project.

**Required Field:** `reference` (project slug/ID)

**Example:**

```json
{
  "title": "Client Project",
  "type": "project",
  "reference": "amazing-website",
  "references": [],
  "url": null
}
```

**URL Resolution:** `/projects/{slug}`

### 6. Custom-Link Type

Custom URL for internal or external links.

**Required Field:** `url`

**Examples:**

```json
// Internal link
{
  "title": "Dashboard",
  "type": "custom-link",
  "reference": null,
  "references": [],
  "url": "/dashboard"
}

// External link (no protocol validation)
{
  "title": "Partner Site",
  "type": "custom-link",
  "reference": null,
  "references": [],
  "url": "https://partner.com"
}
```

**URL Resolution:** Uses `url` as-is

### 7. External-Link Type

External link with strict HTTP/HTTPS validation.

**Required Field:** `url` (must start with `http://` or `https://`)

**Example:**

```json
{
  "title": "Google",
  "type": "external-link",
  "reference": null,
  "references": [],
  "url": "https://google.com"
}
```

**URL Resolution:** Uses `url` as-is

**Validation:** Must start with `http://` or `https://`

## Validation Rules

### Category-Blog

- ✅ `references` array is required
- ✅ Must have at least one category
- ❌ Cannot have empty `references[]`

### Entity Types (single-article, page, service, project)

- ✅ `reference` is required
- ✅ `reference` must be a valid string (slug or ID)
- ❌ Cannot be null or empty

### Link Types (custom-link, external-link)

- ✅ `url` is required
- ✅ `url` must be a non-empty string
- ✅ `external-link` must start with `http://` or `https://`
- ❌ `url` cannot be null or empty

## API Usage

### Create Category-Blog Menu Item

```bash
POST /api/v1/admin/menu/{menuId}/items
Content-Type: application/json
Authorization: Bearer {token}

{
  "title": "Technology & Business",
  "type": "category-blog",
  "references": ["technology", "business"],
  "icon": "newspaper",
  "target": "_self",
  "order": 0,
  "isPublished": true
}
```

### Create Single-Article Menu Item

```bash
POST /api/v1/admin/menu/{menuId}/items
Content-Type: application/json

{
  "title": "Featured Post",
  "type": "single-article",
  "reference": "my-featured-post-slug",
  "order": 1
}
```

### Create Page Menu Item

```bash
POST /api/v1/admin/menu/{menuId}/items
Content-Type: application/json

{
  "title": "About Us",
  "type": "page",
  "reference": "about-us",
  "order": 2
}
```

### Create Custom-Link Menu Item

```bash
POST /api/v1/admin/menu/{menuId}/items
Content-Type: application/json

{
  "title": "Dashboard",
  "type": "custom-link",
  "url": "/dashboard",
  "icon": "dashboard",
  "order": 3
}
```

### Create External-Link Menu Item

```bash
POST /api/v1/admin/menu/{menuId}/items
Content-Type: application/json

{
  "title": "External Resource",
  "type": "external-link",
  "url": "https://example.com",
  "target": "_blank",
  "order": 4
}
```

## URL Resolution Helper

The `getMenuItemUrl()` function handles URL resolution for all types:

```typescript
export const getMenuItemUrl = (item: MenuItem): string | null => {
  // Return existing URL if set (for custom-link and external-link)
  if (item.url) return item.url

  // Category-blog: construct URL from categories
  if (item.type === 'category-blog') {
    if (item.references && item.references.length > 0) {
      // Single category
      if (item.references.length === 1) {
        return `/blog/category/${item.references[0]}`
      }
      // Multiple categories
      return `/blog?categories=${item.references.join(',')}`
    }
    return '/blog' // Default blog listing
  }

  // Entity types: construct URL from reference
  if (item.reference) {
    switch (item.type) {
      case 'single-article':
        return `/blog/${item.reference}`
      case 'page':
        return `/${item.reference}`
      case 'service':
        return `/services/${item.reference}`
      case 'project':
        return `/projects/${item.reference}`
    }
  }

  return null
}
```

## Type Guards

```typescript
// Check if menu item is category-blog type
export const isCategoryBlogMenuItem = (item: MenuItem): boolean => {
  return item.type === 'category-blog'
}

// Check if menu item is entity type (requires single reference)
export const isEntityMenuItem = (item: MenuItem): boolean => {
  return ['single-article', 'page', 'service', 'project'].includes(item.type)
}

// Check if menu item is external link
export const isExternalMenuItem = (item: MenuItem): boolean => {
  return item.type === 'external-link'
}

// Check if menu item is custom/external link (requires URL)
export const isCustomMenuItem = (item: MenuItem): boolean => {
  return ['custom-link', 'external-link'].includes(item.type)
}
```

## Frontend Implementation

### Menu Rendering

```tsx
import { getMenuItemUrl } from '@/types/menu.types'

function MenuItem({ item }: { item: MenuItem }) {
  const url = getMenuItemUrl(item)
  const isExternal = item.type === 'external-link'

  return (
    <a
      href={url}
      target={item.target}
      className={item.cssClass}
      rel={isExternal ? 'noopener noreferrer' : undefined}
    >
      {item.icon && <Icon name={item.icon} />}
      {item.title}
    </a>
  )
}
```

### Category Blog Page

```tsx
// pages/blog/category/[...slugs].tsx
export default function CategoryBlogPage({ params }) {
  const categories = params.slugs // Array of category slugs from URL
  const posts = await getPostsByCategories(categories)

  return <BlogList posts={posts} categories={categories} />
}
```

### Type Selection UI

```tsx
function MenuItemForm() {
  const [type, setType] = useState('page')

  return (
    <form>
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="category-blog">Category Blog</option>
        <option value="single-article">Single Article</option>
        <option value="page">Page</option>
        <option value="service">Service</option>
        <option value="project">Project</option>
        <option value="custom-link">Custom Link</option>
        <option value="external-link">External Link</option>
      </select>

      {type === 'category-blog' && (
        <MultiSelect name="references" label="Select Categories" options={categories} />
      )}

      {isEntityMenuItem({ type }) && (
        <Select name="reference" label={`Select ${type}`} options={getOptionsForType(type)} />
      )}

      {isCustomMenuItem({ type }) && (
        <Input
          name="url"
          label="URL"
          placeholder={type === 'external-link' ? 'https://...' : '/path'}
        />
      )}
    </form>
  )
}
```

## Migration Guide

### From Old Structure

**Old Types → New Types:**

- `post` → `single-article`
- `category` → `category-blog` (with `references[]`)
- `custom` → `custom-link`
- `external` → `external-link`

**Database Migration:**

```sql
-- Add references column
ALTER TABLE "MenuItem"
ADD COLUMN "references" TEXT[] DEFAULT '{}';

-- Migrate category type to category-blog
UPDATE "MenuItem"
SET
  type = 'category-blog',
  references = ARRAY[reference]
WHERE type = 'category';

-- Migrate post type to single-article
UPDATE "MenuItem"
SET type = 'single-article'
WHERE type = 'post';

-- Migrate custom to custom-link
UPDATE "MenuItem"
SET type = 'custom-link'
WHERE type = 'custom';

-- Migrate external to external-link
UPDATE "MenuItem"
SET type = 'external-link'
WHERE type = 'external';
```

## Benefits of This Approach

1. **Joomla-like Flexibility**: Can handle any content type through category blogs or single items
2. **Multiple Category Support**: Category-blog type can link to multiple categories
3. **Clear Intent**: Type names clearly indicate purpose (`single-article` vs `category-blog`)
4. **Extensible**: Easy to add new types (e.g., `category-services`, `single-event`)
5. **Type Safety**: Full TypeScript and Zod validation
6. **Backward Compatible**: Can migrate existing menu items with SQL updates

## Example Menu Structures

### Header Menu

```json
{
  "name": "Main Navigation",
  "items": [
    {
      "title": "Home",
      "type": "custom-link",
      "url": "/"
    },
    {
      "title": "Blog",
      "type": "category-blog",
      "references": ["technology", "business"],
      "children": [
        {
          "title": "Technology",
          "type": "category-blog",
          "references": ["technology"]
        },
        {
          "title": "Business",
          "type": "category-blog",
          "references": ["business"]
        },
        {
          "title": "Featured Post",
          "type": "single-article",
          "reference": "featured-post-slug"
        }
      ]
    },
    {
      "title": "Services",
      "type": "page",
      "reference": "services-overview"
    },
    {
      "title": "Contact",
      "type": "page",
      "reference": "contact-us"
    }
  ]
}
```

### Footer Menu

```json
{
  "name": "Footer Links",
  "items": [
    {
      "title": "About",
      "type": "page",
      "reference": "about-us"
    },
    {
      "title": "Privacy Policy",
      "type": "page",
      "reference": "privacy-policy"
    },
    {
      "title": "Facebook",
      "type": "external-link",
      "url": "https://facebook.com/yourpage",
      "target": "_blank"
    }
  ]
}
```

## Summary

This Joomla-style refactoring provides:

- ✅ **7 powerful menu types**
- ✅ **Multiple category support** via `references[]`
- ✅ **Single entity links** via `reference`
- ✅ **Custom & external URLs** via `url`
- ✅ **Full validation** with Zod schemas
- ✅ **Type safety** with TypeScript
- ✅ **Flexible URL resolution**
- ✅ **Easy to extend** with new types

The system can now handle any CMS content structure, just like Joomla! 🎉
