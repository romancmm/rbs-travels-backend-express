# 🧩 CMS Backend Specification — Menu & Page Builder System

**Tech Stack:** Node.js + Express.js + postgresql

---

## 1. Overview

This document defines the backend requirements for a **modular CMS system** inspired by **Joomla** and **Elementor/Helix Page Builder**.  
It supports:

- Multiple **menus** (header, footer, sidebar, etc.)
- **Nested/multi-level menu items**
- **Page builder** for custom sections, rows, columns, and prebuilt widgets.

---

## 2. Menu Management

### 2.1 Menu Types

Each menu represents a group of navigational links.  
Examples:

- `Main Menu`
- `Footer Menu`
- `Sidebar Menu`

### 2.2 Menu Item Types

Each menu item will have a `type` field specifying its behavior.

| Type             | Description                           | Example Target                    |
| ---------------- | ------------------------------------- | --------------------------------- |
| `custom-link`    | Manual external/internal URL          | `/about` or `https://example.com` |
| `category-blogs` | Auto-link to a category blog list     | `/blog/category/:slug`            |
| `custom-page`    | Link to a page built via page builder | `/page/:slug`                     |
| `article`        | Link to a single article              | `/article/:slug`                  |

### 2.3 Menu Schema (Example)

```ts
{
  _id: ObjectId,
  name: string,                 // e.g. "Header Menu"
  slug: string,                 // e.g. "header-menu"
  items: [
    {
      _id: ObjectId,
      title: string,
      type: 'custom-link' | 'category-blogs' | 'custom-page' | 'article',
      link: string,             // target URL or slug
      parentId: ObjectId | null, // null for root
      order: number,
      children: [MenuItem],     // recursive
      status: 'published' | 'draft',
      icon?: string,
      target?: '_blank' | '_self',
      meta?: object
    }
  ],
  createdAt: Date,
  updatedAt: Date
}
```

2.4 Features

Add/update/delete menus.

Nesting support (multi-level submenus).

Assign menus to positions: header, footer, sidebar, etc.

Order management for menu items.

3. Page Builder System
   3.1 Concept

A drag & drop visual builder like Elementor or Joomla Helix.

Each page consists of Sections → Rows → Columns → Components.

3.2 Page Schema
{
\_id: ObjectId,
title: string,
slug: string,
layout: [Section],
createdAt: Date,
updatedAt: Date,
status: 'draft' | 'published'
}

3.3 Section Schema
{
id: string,
name: string, // e.g. "Product Section"
settings: {
backgroundColor?: string,
backgroundImage?: string,
padding?: string,
margin?: string,
},
rows: [Row]
}

3.4 Row Schema
{
id: string,
columns: [Column],
settings?: {
columnsGap?: string,
background?: string
}
}

3.5 Column Schema
{
id: string,
width: number, // e.g. 12, 6, 4 (bootstrap style grid)
content: [Component]
}

3.6 Component Schema
{
id: string,
type: string, // e.g. "text", "image", "rich-text", "product-card", etc.
props: object, // component-specific data
}

4. Supported Components (Initial Phase)
   Component Description Configurable Props
   text Plain text text, style
   rich-text HTML content content, style
   image Image block src, alt, style
   gallery Image grid images[], columns
   banner Hero/banner section title, subtitle, image, cta
   carousel Image/Content carousel slides[], interval
   product-card Dynamic API-driven cards apiEndpoint, dataMap, variant, size
   service-list List of services apiEndpoint, dataMap
   testimonial Testimonial slider apiEndpoint, dataMap
5. Dynamic API Integration

For API-driven components (like product-card, service-list):
Each component can define:

{
apiEndpoint: '/products?featured=true',
dataMap: 'data.data.products', // how to access array from response
}

The backend returns structured component config to the frontend for rendering.

6. Admin Dashboard Features

✅ Manage multiple menus (header, footer, sidebar)
✅ Manage nested menu items
✅ Create & edit custom pages via drag-and-drop builder
✅ Add prebuilt sections (gallery, banners, products, etc.)
✅ Define API endpoints for dynamic widgets
✅ Preview before publishing

7. Frontend Rendering Logic

Fetch page data (via /api/pages/:slug)

Parse layout JSON recursively:

Section → Row → Column → Component

Render React components dynamically using mapping (e.g., type: 'product-card' → <ProductCard {...props} />)

8. Integration References

Page builder engine inspiration:

Craft.js

Builder.io

Menu structure reference: Joomla-style hierarchical menus.

9. API Endpoints (Examples)
   Method Endpoint Description
   GET /api/menus Fetch all menus
   POST /api/menus Create new menu
   PUT /api/menus/:id Update menu
   DELETE /api/menus/:id Delete menu
   GET /api/pages/:slug Fetch page layout by slug
   POST /api/pages Create new page
   PUT /api/pages/:id Update page layout
   DELETE /api/pages/:id Delete page
10. Scalability Notes

Store layout JSON in postgresql as flexible schema.

Support versioning (draft/published).

Support multi-language via locale field.

Allow custom plugins/components registration in future.

✅ Goal:
A scalable, Joomla-like CMS for Next.js frontend — powered by Node.js backend — enabling fully dynamic menu & page structures with customizable layouts and reusable API-driven components.
