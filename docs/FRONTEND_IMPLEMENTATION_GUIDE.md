# Frontend Implementation Guide - MenuItem System

## 📋 Quick Start

MenuItem now uses **slug-based references** instead of UUIDs for better UX and SEO.

```json
// ✅ Current (Slug-based)
{
  "type": "page",
  "reference": "about-us"
}

// ❌ Old (UUID-based)
{
  "type": "page",
  "referenceId": "5ae0cfd9-748d-478b-80be-35e82096fcf7"
}
```

---

## 🎯 MenuItem Structure

```typescript
interface MenuItem {
  id: string
  menuId: string
  title: string
  slug: string
  type: 'page' | 'post' | 'category' | 'service' | 'project' | 'custom' | 'external'
  reference?: string | null // Slug of referenced entity
  url?: string | null // URL for custom/external links
  icon?: string
  target: '_self' | '_blank'
  cssClass?: string
  parentId?: string | null
  order: number
  isPublished: boolean
  meta?: Record<string, any>
  children?: MenuItem[]
}
```

---

## 🔧 Admin Dashboard Implementation

### 1. TypeScript Types

**File:** `src/types/menu.types.ts`

```typescript
export type MenuItemType =
  | 'page'
  | 'post'
  | 'category'
  | 'service'
  | 'project'
  | 'custom'
  | 'external'

export interface MenuItem {
  id: string
  menuId: string
  title: string
  slug: string
  type: MenuItemType
  reference?: string | null // Slug of entity
  url?: string | null
  icon?: string
  target: '_self' | '_blank'
  cssClass?: string
  parentId?: string | null
  order: number
  isPublished: boolean
  meta?: Record<string, any>
  children?: MenuItem[]
}

export interface CreateMenuItemInput {
  title: string
  slug?: string
  type: MenuItemType
  reference?: string // Slug value, not UUID
  url?: string
  icon?: string
  target?: '_self' | '_blank'
  cssClass?: string
  parentId?: string | null
  order?: number
  isPublished?: boolean
  meta?: Record<string, any>
}
```

### 2. Menu Item Form Component

**File:** `components/admin/MenuItemForm.tsx`

```tsx
import { useState, useEffect } from 'react'

export default function MenuItemForm({ menuId, onSuccess }) {
  const [type, setType] = useState<MenuItemType>('page')
  const [entities, setEntities] = useState([])
  const [formData, setFormData] = useState({
    title: '',
    reference: '',
    url: '',
    icon: '',
    target: '_self',
    cssClass: '',
    isPublished: true,
  })

  // Fetch entities when type changes
  useEffect(() => {
    if (['page', 'post', 'category', 'service', 'project'].includes(type)) {
      fetchEntities()
    }
  }, [type])

  const fetchEntities = async () => {
    const endpoint = `/api/admin/${type}s`
    const res = await fetch(endpoint)
    const data = await res.json()
    setEntities(data.data?.items || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validation
    if (['page', 'post', 'category', 'service', 'project'].includes(type)) {
      if (!formData.reference) {
        alert(`Please select a ${type}`)
        return
      }
    } else if (['custom', 'external'].includes(type)) {
      if (!formData.url) {
        alert('URL is required')
        return
      }
      if (type === 'external' && !formData.url.match(/^https?:\/\//)) {
        alert('External URLs must start with http:// or https://')
        return
      }
    }

    const payload = {
      title: formData.title,
      type,
      reference: formData.reference || null,
      url: formData.url || null,
      icon: formData.icon || null,
      target: formData.target,
      cssClass: formData.cssClass || null,
      isPublished: formData.isPublished,
    }

    try {
      const res = await fetch(`/api/admin/menus/${menuId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message)
      }

      const newItem = await res.json()
      onSuccess(newItem)
    } catch (error) {
      console.error('Failed to create menu item:', error)
      alert(error.message)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Title */}
      <div>
        <label>Title *</label>
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
        />
      </div>

      {/* Type Selector */}
      <div>
        <label>Type *</label>
        <select value={type} onChange={(e) => setType(e.target.value as MenuItemType)}>
          <option value="page">Page</option>
          <option value="post">Post / Article</option>
          <option value="category">Category</option>
          <option value="service">Service</option>
          <option value="project">Project</option>
          <option value="custom">Custom Link</option>
          <option value="external">External Link</option>
        </select>
      </div>

      {/* Entity Selector - Using SLUG */}
      {['page', 'post', 'category', 'service', 'project'].includes(type) && (
        <div>
          <label>Select {type} *</label>
          <select
            value={formData.reference}
            onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
            required
          >
            <option value="">-- Select {type} --</option>
            {entities.map((entity) => (
              <option key={entity.id} value={entity.slug}>
                {entity.title || entity.name} ({entity.slug})
              </option>
            ))}
          </select>
          <p className="text-sm text-gray-500">Selecting by slug: more readable and SEO-friendly</p>
        </div>
      )}

      {/* URL Input */}
      {['custom', 'external'].includes(type) && (
        <div>
          <label>URL *</label>
          <input
            type="text"
            value={formData.url}
            onChange={(e) => setFormData({ ...formData, url: e.target.value })}
            placeholder={type === 'external' ? 'https://example.com' : '/custom-path'}
            required
          />
          {type === 'external' && (
            <p className="text-sm text-gray-500">Must start with http:// or https://</p>
          )}
        </div>
      )}

      {/* Icon */}
      <div>
        <label>Icon (optional)</label>
        <input
          type="text"
          value={formData.icon}
          onChange={(e) => setFormData({ ...formData, icon: e.target.value })}
          placeholder="🏠 or fa-home"
        />
      </div>

      {/* Target */}
      <div>
        <label>Open In</label>
        <select
          value={formData.target}
          onChange={(e) => setFormData({ ...formData, target: e.target.value })}
        >
          <option value="_self">Same Tab</option>
          <option value="_blank">New Tab</option>
        </select>
      </div>

      {/* CSS Class */}
      <div>
        <label>CSS Class (optional)</label>
        <input
          type="text"
          value={formData.cssClass}
          onChange={(e) => setFormData({ ...formData, cssClass: e.target.value })}
          placeholder="custom-class"
        />
      </div>

      {/* Published */}
      <div>
        <label>
          <input
            type="checkbox"
            checked={formData.isPublished}
            onChange={(e) => setFormData({ ...formData, isPublished: e.target.checked })}
          />
          Published
        </label>
      </div>

      <button type="submit" className="btn-primary">
        Create Menu Item
      </button>
    </form>
  )
}
```

### 3. Display Menu Item Info

```tsx
export function MenuItemCard({ item }: { item: MenuItem }) {
  const getTypeColor = (type: string) => {
    const colors = {
      page: 'blue',
      post: 'green',
      category: 'purple',
      service: 'orange',
      project: 'pink',
      custom: 'gray',
      external: 'red',
    }
    return colors[type] || 'gray'
  }

  return (
    <div className="menu-item-card">
      <div className="flex items-center gap-2">
        <span>{item.icon || '•'}</span>
        <h4>{item.title}</h4>
        <span className={`badge badge-${getTypeColor(item.type)}`}>{item.type}</span>
        {!item.isPublished && <span className="badge badge-gray">Draft</span>}
      </div>

      <div className="details">
        <p>
          <strong>Slug:</strong> {item.slug}
        </p>

        {item.reference && (
          <p>
            <strong>Reference:</strong> {item.reference}
          </p>
        )}

        {item.url && (
          <p>
            <strong>URL:</strong> {item.url}
          </p>
        )}

        <p>
          <strong>Target:</strong> {item.target}
        </p>
      </div>
    </div>
  )
}
```

---

## 🌐 Public Website Implementation

### 1. Fetch Menu API

```typescript
// Fetch menu by position
export async function getMenu(position: string) {
  const res = await fetch(`${API_URL}/api/public/menus/${position}`)
  if (!res.ok) throw new Error('Failed to fetch menu')
  return res.json()
}

// Fetch menu by slug
export async function getMenuBySlug(slug: string) {
  const res = await fetch(`${API_URL}/api/public/menus/slug/${slug}`)
  if (!res.ok) throw new Error('Failed to fetch menu')
  return res.json()
}
```

### 2. Navigation Component (React)

```tsx
import Link from 'next/link'

interface NavigationProps {
  position: string
}

export default async function Navigation({ position }: NavigationProps) {
  const menu = await getMenu(position)

  if (!menu || !menu.items?.length) return null

  return (
    <nav className="navigation">
      <ul className="menu-list">
        {menu.items.map((item) => (
          <MenuItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  )
}

function MenuItem({ item }: { item: MenuItem }) {
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className="menu-item">
      <Link href={item.url || '#'} target={item.target} className={item.cssClass || ''}>
        {item.icon && <span className="icon">{item.icon}</span>}
        {item.title}
      </Link>

      {hasChildren && (
        <ul className="submenu">
          {item.children.map((child) => (
            <MenuItem key={child.id} item={child} />
          ))}
        </ul>
      )}
    </li>
  )
}
```

### 3. Navigation Component (Vue)

```vue
<template>
  <nav class="navigation">
    <ul class="menu-list">
      <MenuItem v-for="item in menu.items" :key="item.id" :item="item" />
    </ul>
  </nav>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { MenuItem } from '@/types/menu'

interface Props {
  position: string
}

const props = defineProps<Props>()
const menu = ref({ items: [] })

onMounted(async () => {
  const res = await fetch(`/api/public/menus/${props.position}`)
  menu.value = await res.json()
})
</script>

<!-- MenuItem Component -->
<template>
  <li class="menu-item">
    <a :href="item.url || '#'" :target="item.target" :class="item.cssClass">
      <span v-if="item.icon" class="icon">{{ item.icon }}</span>
      {{ item.title }}
    </a>

    <ul v-if="item.children?.length" class="submenu">
      <MenuItem v-for="child in item.children" :key="child.id" :item="child" />
    </ul>
  </li>
</template>

<script setup lang="ts">
interface Props {
  item: MenuItem
}

defineProps<Props>()
</script>
```

### 4. Mega Menu Example

```tsx
export function MegaMenu({ items }: { items: MenuItem[] }) {
  return (
    <div className="mega-menu">
      {items.map((item) => (
        <div key={item.id} className="mega-menu-column">
          <Link href={item.url || '#'} className="mega-menu-title">
            {item.icon && <span>{item.icon}</span>}
            {item.title}
          </Link>

          {item.children && item.children.length > 0 && (
            <ul className="mega-menu-list">
              {item.children.map((child) => (
                <li key={child.id}>
                  <Link href={child.url || '#'} target={child.target} className={child.cssClass}>
                    {child.icon && <span>{child.icon}</span>}
                    {child.title}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>
      ))}
    </div>
  )
}
```

### 5. Mobile Menu Example

```tsx
import { useState } from 'react'

export function MobileMenu({ items }: { items: MenuItem[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  const toggleItem = (id: string) => {
    setExpandedItems((prev) => (prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]))
  }

  return (
    <>
      <button className="mobile-menu-toggle" onClick={() => setIsOpen(!isOpen)}>
        ☰
      </button>

      {isOpen && (
        <div className="mobile-menu">
          <ul>
            {items.map((item) => (
              <li key={item.id}>
                <div className="flex items-center justify-between">
                  <Link href={item.url || '#'} target={item.target}>
                    {item.icon && <span>{item.icon}</span>}
                    {item.title}
                  </Link>

                  {item.children?.length > 0 && (
                    <button onClick={() => toggleItem(item.id)}>
                      {expandedItems.includes(item.id) ? '−' : '+'}
                    </button>
                  )}
                </div>

                {expandedItems.includes(item.id) && item.children && (
                  <ul className="submenu">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link href={child.url || '#'} target={child.target}>
                          {child.icon && <span>{child.icon}</span>}
                          {child.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
    </>
  )
}
```

---

## 🎨 Styling Examples

### Horizontal Navigation

```css
.navigation {
  background: #fff;
  border-bottom: 1px solid #e5e7eb;
}

.menu-list {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
}

.menu-item {
  position: relative;
}

.menu-item > a {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 1.5rem;
  color: #374151;
  text-decoration: none;
  transition: color 0.2s;
}

.menu-item > a:hover {
  color: #2563eb;
}

.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  min-width: 200px;
  background: #fff;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  opacity: 0;
  visibility: hidden;
  transition: opacity 0.2s, visibility 0.2s;
}

.menu-item:hover > .submenu {
  opacity: 1;
  visibility: visible;
}
```

### Vertical Sidebar

```css
.sidebar-nav .menu-list {
  display: flex;
  flex-direction: column;
}

.sidebar-nav .menu-item > a {
  padding: 0.75rem 1rem;
  border-radius: 0.375rem;
}

.sidebar-nav .menu-item > a:hover {
  background: #f3f4f6;
}

.sidebar-nav .submenu {
  position: static;
  padding-left: 1rem;
  opacity: 1;
  visibility: visible;
}
```

---

## ✅ Validation & Error Handling

```typescript
// Client-side validation
export function validateMenuItem(data: CreateMenuItemInput): string[] {
  const errors: string[] = []

  // Entity types require reference (slug)
  if (['page', 'post', 'category', 'service', 'project'].includes(data.type)) {
    if (!data.reference) {
      errors.push(`Reference (slug) is required for ${data.type} type`)
    }
  }

  // URL types require url
  if (['custom', 'external'].includes(data.type)) {
    if (!data.url) {
      errors.push(`URL is required for ${data.type} type`)
    }

    if (data.type === 'external' && data.url) {
      if (!data.url.match(/^https?:\/\//)) {
        errors.push('External URLs must start with http:// or https://')
      }
    }
  }

  return errors
}

// Usage
const errors = validateMenuItem(formData)
if (errors.length > 0) {
  console.error('Validation errors:', errors)
  alert(errors.join('\n'))
  return
}
```

---

## 🔗 API Endpoints

### Admin Endpoints

```typescript
// Get all menus
GET /api/admin/menus

// Get menu by ID
GET /api/admin/menus/:menuId

// Create menu
POST /api/admin/menus

// Update menu
PUT /api/admin/menus/:menuId

// Delete menu
DELETE /api/admin/menus/:menuId

// Get menu items
GET /api/admin/menus/:menuId/items

// Create menu item
POST /api/admin/menus/:menuId/items
Body: { title, type, reference, url, ... }

// Update menu item
PUT /api/admin/menus/:menuId/items/:itemId
Body: { title, type, reference, url, ... }

// Delete menu item
DELETE /api/admin/menus/:menuId/items/:itemId

// Reorder menu items
POST /api/admin/menus/:menuId/items/reorder
Body: { items: [{ id, order, parentId }] }

// Regenerate cache
POST /api/admin/menus/:menuId/regenerate-cache
```

### Public Endpoints

```typescript
// Get menu by position
GET /api/public/menus/:position

// Get menu by slug
GET /api/public/menus/slug/:slug
```

---

## 📝 Migration Checklist

### Admin Dashboard

- [ ] Update TypeScript types (`menu.types.ts`)
- [ ] Update form component to use `reference` field
- [ ] Fetch entities and display slugs in dropdown
- [ ] Update form submission to send slug instead of UUID
- [ ] Update display components to show `reference` field
- [ ] Update validation logic
- [ ] Test creating menu items for all types
- [ ] Test updating menu items
- [ ] Test menu tree/reordering

### Public Website

- [ ] Update TypeScript types
- [ ] Update navigation component
- [ ] Test menu rendering with slug-based references
- [ ] Verify URLs are correct
- [ ] Test nested menus
- [ ] Test mobile menu
- [ ] Verify external links open in correct target

---

## 🚀 Quick Example: Complete Flow

```typescript
// 1. User selects type = "page"
setType('page')

// 2. Fetch available pages (with slugs)
const pages = await fetch('/api/admin/pages').then(r => r.json())
// Returns: [{ id: "uuid-1", title: "About", slug: "about-us" }, ...]

// 3. Display in dropdown (showing slug)
<select onChange={(e) => setReference(e.target.value)}>
  <option value="about-us">About (about-us)</option>
  <option value="contact">Contact (contact)</option>
</select>

// 4. Submit with slug reference
POST /api/admin/menus/menu-id/items
{
  "title": "About Us",
  "type": "page",
  "reference": "about-us",  // ✅ Slug, not UUID
  "target": "_self"
}

// 5. Response includes resolved URL
{
  "id": "...",
  "title": "About Us",
  "type": "page",
  "reference": "about-us",
  "url": "/about-us",  // Backend resolves this
  "target": "_self"
}

// 6. Frontend renders link
<Link href="/about-us">About Us</Link>
```

---

## 📚 Additional Resources

- **Backend API Docs**: See `docs/openapi/menu.admin.yaml`
- **Migration Guide**: See `docs/SLUG_BASED_REFERENCE_MIGRATION.md`
- **Quick Reference**: See `docs/MENUITEM_REFERENCE_UPDATE.md`
- **Server Status**: Running on `http://localhost:4000`
- **API Documentation**: `http://localhost:4000/docs`

---

## ❓ FAQ

**Q: Why slug instead of UUID?**  
A: Slugs are human-readable, SEO-friendly, and match the pattern used by all other entities (Page,
Post, Category, Service, Project).

**Q: What if slug changes?**  
A: Update the menu item's `reference` field with the new slug. Consider adding slug change tracking
or redirects.

**Q: Can I still query by UUID?**  
A: No, the system now exclusively uses slugs. All UUIDs in existing data have been converted to
slugs.

**Q: What about performance?**  
A: The `reference` field is indexed for fast lookups. Menu data is cached for public access.

**Q: How do I handle broken references?**  
A: If a referenced entity is deleted, the menu item will have a null reference. Add validation in
your admin UI to detect and fix broken links.
