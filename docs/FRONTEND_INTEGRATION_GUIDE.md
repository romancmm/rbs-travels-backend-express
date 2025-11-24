# Frontend Integration Guide - MenuItem (Slug-Based References)

## 📋 Overview

This guide provides complete instructions for implementing the MenuItem system in your frontend
applications using **slug-based references**. The system now uses slugs instead of UUIDs for better
UX and SEO.

---

## 🎯 What You Need to Know

### Key Change: Slugs Instead of UUIDs

**Old (UUID-based):**

```json
{
  "type": "page",
  "referenceId": "5ae0cfd9-748d-478b-80be-35e82096fcf7"
}
```

**New (Slug-based):** ✅

```json
{
  "type": "page",
  "reference": "about-us"
}
```

### Current Structure

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

### 1. Update TypeScript Types

**Location:** `admin/src/types/menu.types.ts`

```typescript
export type MenuItemType =
  | 'page'
  | 'post'
  | 'category'
  | 'service'
  | 'project'
  | 'custom'
  | 'external'

export type MenuItemTarget = '_self' | '_blank'

export interface MenuItem {
  id: string
  menuId: string
  title: string
  slug: string
  type: MenuItemType
  reference?: string | null // Slug of referenced entity
  url?: string | null
  icon?: string
  target: MenuItemTarget
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
  reference?: string // Slug of the entity to link to
  url?: string
  icon?: string
  target?: MenuItemTarget
  cssClass?: string
  parentId?: string | null
  order?: number
  isPublished?: boolean
  meta?: Record<string, any>
}

export interface UpdateMenuItemInput {
  title?: string
  slug?: string
  type?: MenuItemType
  reference?: string
  url?: string
  icon?: string
  target?: MenuItemTarget
  cssClass?: string
  parentId?: string | null
  order?: number
  isPublished?: boolean
  meta?: Record<string, any>
}
```

### 2. Update Menu Item Form Component

**Component:** `MenuItemForm.tsx` / `MenuItemFormModal.tsx`

```tsx
import { useState, useEffect } from 'react'
import type { MenuItemType } from '@/types/menu.types'

// Type selector
const [selectedType, setSelectedType] = useState<MenuItemType>('custom')
const [entities, setEntities] = useState([])

// Fetch entities when type changes
useEffect(() => {
  if (['page', 'post', 'category', 'service', 'project'].includes(selectedType)) {
    fetchEntities(selectedType)
  }
}, [selectedType])

const fetchEntities = async (type: string) => {
  // Fetch entities based on type - returns with slug field
  const response = await fetch(`/api/admin/${type}s`)
  const data = await response.json()
  setEntities(data)
}

return (
  <form>
    {/* Type Selector */}
    <Select
      label="Menu Item Type"
      value={selectedType}
      onChange={(e) => setSelectedType(e.target.value as MenuItemType)}
    >
      <option value="page">Page</option>
      <option value="post">Post / Article</option>
      <option value="category">Category</option>
      <option value="service">Service</option>
      <option value="project">Project</option>
      <option value="custom">Custom Link</option>
      <option value="external">External Link</option>
    </Select>

    {/* Entity Selector - Shows slug in the dropdown */}
    {['page', 'post', 'category', 'service', 'project'].includes(selectedType) && (
      <Select label={`Select ${selectedType}`} name="reference" required>
        <option value="">-- Select {selectedType} --</option>
        {entities.map((entity) => (
          <option key={entity.id} value={entity.slug}>
            {entity.title || entity.name} ({entity.slug})
          </option>
        ))}
      </Select>
    )}

    {/* URL Input for custom/external */}
    {['custom', 'external'].includes(selectedType) && (
      <Input
        label="URL"
        name="url"
        type="text"
        placeholder={selectedType === 'external' ? 'https://example.com' : '/custom-path'}
        required
      />
    )}

    {/* Common Fields */}
    <Input label="Title" name="title" required />

    <Select label="Open In" name="target" defaultValue="_self">
      <option value="_self">Same Tab</option>
      <option value="_blank">New Tab</option>
    </Select>

    <Input label="Slug (optional)" name="slug" placeholder="Auto-generated from title" />

    <Input label="Icon (optional)" name="icon" placeholder="🏠 or fa-home" />

    <Input label="CSS Class (optional)" name="cssClass" placeholder="custom-class" />

    <Checkbox label="Published" name="isPublished" defaultChecked />
  </form>
)
```

### 3. Update Form Submission Handler

```typescript
const handleSubmit = async (formData: CreateMenuItemInput) => {
  try {
    const response = await fetch(`/api/admin/menus/${menuId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        type: formData.type,
        reference: formData.reference, // Slug value
        url: formData.url,
        icon: formData.icon,
        target: formData.target || '_self',
        cssClass: formData.cssClass,
        parentId: formData.parentId,
        order: formData.order || 0,
        isPublished: formData.isPublished ?? true,
        meta: formData.meta,
      }),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message)
    }

    const newItem = await response.json()
    console.log('Created menu item:', newItem)

    // Refresh menu or navigate
  } catch (error) {
    console.error('Failed to create menu item:', error)
  }
}
```

### 4. Validation Function

```typescript
const validateMenuItem = (data: CreateMenuItemInput): string[] => {
  const errors: string[] = []

  // Entity types require reference (slug)
  if (['page', 'post', 'category', 'service', 'project'].includes(data.type)) {
    if (!data.reference) {
      errors.push(`Please select a ${data.type}`)
    }
  }

  // Custom/External types require url
  if (['custom', 'external'].includes(data.type)) {
    if (!data.url) {
      errors.push('URL is required')
    }

    // External links must have http:// or https://
    if (data.type === 'external' && data.url) {
      if (!data.url.startsWith('http://') && !data.url.startsWith('https://')) {
        errors.push('External URLs must start with http:// or https://')
      }
    }
  }

  return errors
}
```

### 5. React Hook Form Example (Optional)

```typescript
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

// Validation schema
const menuItemSchema = z
  .object({
    title: z.string().min(1, 'Title is required'),
    type: z.enum(['page', 'post', 'category', 'service', 'project', 'custom', 'external']),
    reference: z.string().nullable().optional(),
    url: z.string().nullable().optional(),
    icon: z.string().optional(),
    target: z.enum(['_self', '_blank']).default('_self'),
    cssClass: z.string().optional(),
    parentId: z.string().uuid().nullable().optional(),
    order: z.number().int().min(0).default(0),
    isPublished: z.boolean().default(true),
    meta: z.record(z.any()).optional(),
  })
  .refine(
    (data) => {
      // Entity types require reference
      if (['page', 'post', 'category', 'service', 'project'].includes(data.type)) {
        return !!data.reference
      }
      // URL types require url
      if (['custom', 'external'].includes(data.type)) {
        return !!data.url
      }
      return true
    },
    {
      message: 'Invalid menu item configuration',
    }
  )

// In component
const {
  register,
  handleSubmit,
  watch,
  formState: { errors },
} = useForm({
  resolver: zodResolver(menuItemSchema),
})

const selectedType = watch('type')
```

---

## 🌐 Public Website Implementation

### 1. Fetch Menu with Slug-Based References

```typescript
// API call to get menu
const fetchMenu = async (position: string) => {
  const response = await fetch(`/api/public/menus/${position}`)
  const menu = await response.json()
  return menu
}

// Example response
{
  "id": "...",
  "name": "Main Navigation",
  "slug": "main-nav",
  "position": "header",
  "items": [
    {
      "id": "...",
      "title": "About Us",
      "type": "page",
      "reference": "about-us",  // ✅ Slug instead of UUID
      "url": "/about-us",
      "target": "_self",
      "children": []
    },
    {
      "id": "...",
      "title": "Blog",
      "type": "post",
      "reference": "latest-news",  // ✅ Slug
      "url": "/blog/latest-news",
      "target": "_self",
      "children": []
    }
  ]
}
```

### 2. Menu Component (React)

```tsx
const handleSubmit = async (data: FormData) => {
  const payload: CreateMenuItemInput = {
    title: data.title,
    slug: data.slug || undefined,
    type: selectedType,
    icon: data.icon || undefined,
    target: data.target || '_self',
    cssClass: data.cssClass || undefined,
    parentId: data.parentId || null,
    order: data.order || 0,
    isPublished: data.isPublished ?? true,
  }

  // Add referenceId for entity types
  if (['page', 'post', 'category', 'service', 'project'].includes(selectedType)) {
    payload.referenceId = data.referenceId
  }

  // Add url for custom/external types
  if (['custom', 'external'].includes(selectedType)) {
    payload.url = data.url
  }

  try {
    const response = await fetch(`/admin/menu/${menuId}/items`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })

    const result = await response.json()

    if (result.success) {
      toast.success('Menu item created successfully')
      router.refresh()
    } else {
      toast.error(result.message)
    }
  } catch (error) {
    toast.error('Failed to create menu item')
  }
}
```

### 4. Update Entity Fetching Logic

```typescript
// Fetch entities based on selected type
const fetchEntities = async (type: MenuItemType) => {
  let endpoint = ''

  switch (type) {
    case 'page':
      endpoint = '/admin/pages'
      break
    case 'post':
      endpoint = '/admin/posts'
      break
    case 'category':
      endpoint = '/admin/categories'
      break
    case 'service':
      endpoint = '/admin/services'
      break
    case 'project':
      endpoint = '/admin/projects'
      break
    default:
      return []
  }

  const response = await fetch(endpoint)
  const data = await response.json()
  return data.data?.items || []
}

// Use in component
const [entities, setEntities] = useState([])

useEffect(() => {
  if (['page', 'post', 'category', 'service', 'project'].includes(selectedType)) {
    fetchEntities(selectedType).then(setEntities)
  }
}, [selectedType])
```

### 5. Update Menu Item Display Component

```tsx
interface MenuItemDisplayProps {
  item: MenuItem
}

const MenuItemDisplay: React.FC<MenuItemDisplayProps> = ({ item }) => {
  // Get icon based on type
  const getTypeIcon = (type: MenuItemType) => {
    const icons = {
      page: '📄',
      post: '📝',
      category: '📁',
      service: '⚙️',
      project: '💼',
      custom: '🔗',
      external: '🌐',
    }
    return icons[type] || '•'
  }

  // Get badge color based on type
  const getTypeBadgeColor = (type: MenuItemType) => {
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
    <div className="menu-item">
      <div className="menu-item-header">
        <span className="icon">{item.icon || getTypeIcon(item.type)}</span>
        <h4>{item.title}</h4>
        <Badge color={getTypeBadgeColor(item.type)}>{item.type}</Badge>
        {!item.isPublished && <Badge color="gray">Draft</Badge>}
      </div>

      <div className="menu-item-details">
        <div>
          <strong>Slug:</strong> {item.slug}
        </div>

        {item.referenceId && (
          <div>
            <strong>Reference ID:</strong> {item.referenceId}
          </div>
        )}

        {item.url && (
          <div>
            <strong>URL:</strong> {item.url}
            {item.type === 'external' && <ExternalLinkIcon className="ml-1" />}
          </div>
        )}

        <div>
          <strong>Target:</strong> {item.target}
        </div>

        {item.cssClass && (
          <div>
            <strong>CSS Class:</strong> <code>{item.cssClass}</code>
          </div>
        )}
      </div>
    </div>
  )
}
```

### 6. Update Menu Tree / Drag-and-Drop Component

```tsx
// If using react-beautiful-dnd or similar
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd'

const MenuTreeEditor: React.FC<{ items: MenuItem[] }> = ({ items }) => {
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return

    const reorderedItems = items.map((item, index) => ({
      id: item.id,
      order:
        index === result.source.index
          ? result.destination.index
          : index < result.source.index && index >= result.destination.index
          ? item.order + 1
          : index > result.source.index && index <= result.destination.index
          ? item.order - 1
          : item.order,
      parentId: item.parentId,
    }))

    // Send reorder request
    await fetch(`/admin/menu/${menuId}/reorder`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: reorderedItems }),
    })
  }

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="menu-items">
        {(provided) => (
          <div {...provided.droppableProps} ref={provided.innerRef}>
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                  >
                    <MenuItemDisplay item={item} />
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  )
}
```

---

## 🎨 Public Website Updates

### 1. Update Menu Fetching

```typescript
// lib/menu.ts or api/menu.ts
export async function getMenu(slug: string): Promise<Menu | null> {
  const response = await fetch(`${API_URL}/menus/${slug}`, {
    next: { revalidate: 3600 }, // Cache for 1 hour
  })

  if (!response.ok) return null

  const data = await response.json()
  return data.data
}
```

### 2. Update Menu Rendering Component

```tsx
// components/Menu.tsx
import Link from 'next/link'
import type { MenuItem } from '@/types/menu.types'

interface MenuProps {
  items: MenuItem[]
  className?: string
}

export const Menu: React.FC<MenuProps> = ({ items, className }) => {
  return (
    <nav className={className}>
      <ul className="menu">
        {items.map((item) => (
          <MenuItemLink key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  )
}

const MenuItemLink: React.FC<{ item: MenuItem }> = ({ item }) => {
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className={`menu-item ${item.cssClass || ''}`}>
      {renderMenuLink(item)}

      {hasChildren && (
        <ul className="submenu">
          {item.children!.map((child) => (
            <MenuItemLink key={child.id} item={child} />
          ))}
        </ul>
      )}
    </li>
  )
}

function renderMenuLink(item: MenuItem) {
  const content = (
    <>
      {item.icon && <span className="menu-icon">{item.icon}</span>}
      <span className="menu-title">{item.title}</span>
    </>
  )

  // External links
  if (item.type === 'external') {
    return (
      <a
        href={item.url || '#'}
        target={item.target}
        rel="noopener noreferrer"
        className="menu-link"
      >
        {content}
      </a>
    )
  }

  // Internal links (all other types)
  return (
    <Link href={item.url || '#'} className="menu-link" target={item.target}>
      {content}
    </Link>
  )
}
```

### 3. Add Mobile Menu Support

```tsx
// components/MobileMenu.tsx
import { useState } from 'react'
import type { MenuItem } from '@/types/menu.types'

export const MobileMenu: React.FC<{ items: MenuItem[] }> = ({ items }) => {
  const [isOpen, setIsOpen] = useState(false)
  const [openSubmenus, setOpenSubmenus] = useState<Set<string>>(new Set())

  const toggleSubmenu = (itemId: string) => {
    setOpenSubmenus((prev) => {
      const next = new Set(prev)
      if (next.has(itemId)) {
        next.delete(itemId)
      } else {
        next.add(itemId)
      }
      return next
    })
  }

  return (
    <>
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
      >
        {isOpen ? '✕' : '☰'}
      </button>

      <div className={`mobile-menu ${isOpen ? 'open' : ''}`}>
        <ul>
          {items.map((item) => (
            <MobileMenuItem
              key={item.id}
              item={item}
              isOpen={openSubmenus.has(item.id)}
              onToggle={() => toggleSubmenu(item.id)}
            />
          ))}
        </ul>
      </div>
    </>
  )
}

const MobileMenuItem: React.FC<{
  item: MenuItem
  isOpen: boolean
  onToggle: () => void
}> = ({ item, isOpen, onToggle }) => {
  const hasChildren = item.children && item.children.length > 0

  return (
    <li className="mobile-menu-item">
      <div className="mobile-menu-item-header">
        {renderMenuLink(item)}

        {hasChildren && (
          <button onClick={onToggle} className="submenu-toggle" aria-label="Toggle submenu">
            {isOpen ? '−' : '+'}
          </button>
        )}
      </div>

      {hasChildren && isOpen && (
        <ul className="mobile-submenu">
          {item.children!.map((child) => (
            <MobileMenuItem key={child.id} item={child} isOpen={false} onToggle={() => {}} />
          ))}
        </ul>
      )}
    </li>
  )
}
```

### 4. Add Accessibility Features

```tsx
// components/AccessibleMenu.tsx
export const AccessibleMenu: React.FC<{ items: MenuItem[] }> = ({ items }) => {
  return (
    <nav aria-label="Main navigation">
      <ul role="menubar" className="menu">
        {items.map((item) => (
          <AccessibleMenuItem key={item.id} item={item} />
        ))}
      </ul>
    </nav>
  )
}

const AccessibleMenuItem: React.FC<{ item: MenuItem }> = ({ item }) => {
  const hasChildren = item.children && item.children.length > 0
  const [isOpen, setIsOpen] = useState(false)

  return (
    <li role="none">
      {hasChildren ? (
        <>
          <button
            role="menuitem"
            aria-haspopup="true"
            aria-expanded={isOpen}
            onClick={() => setIsOpen(!isOpen)}
            className="menu-link"
          >
            {item.icon && <span aria-hidden="true">{item.icon}</span>}
            {item.title}
            <span aria-hidden="true" className="dropdown-icon">
              {isOpen ? '▲' : '▼'}
            </span>
          </button>

          {isOpen && (
            <ul role="menu" className="submenu">
              {item.children!.map((child) => (
                <AccessibleMenuItem key={child.id} item={child} />
              ))}
            </ul>
          )}
        </>
      ) : (
        <a
          role="menuitem"
          href={item.url || '#'}
          target={item.target}
          rel={item.type === 'external' ? 'noopener noreferrer' : undefined}
          className="menu-link"
        >
          {item.icon && <span aria-hidden="true">{item.icon}</span>}
          {item.title}
          {item.type === 'external' && <span className="sr-only"> (opens in new tab)</span>}
        </a>
      )}
    </li>
  )
}
```

---

## 🎨 Styling Examples

```css
/* components/Menu.css */

/* Desktop Menu */
.menu {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  gap: 1rem;
}

.menu-item {
  position: relative;
}

.menu-link {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.menu-link:hover {
  color: var(--primary-color);
  background: rgba(0, 0, 0, 0.05);
}

.menu-icon {
  font-size: 1.2em;
}

/* Submenu */
.submenu {
  position: absolute;
  top: 100%;
  left: 0;
  display: none;
  min-width: 200px;
  background: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border-radius: 4px;
  padding: 0.5rem 0;
  z-index: 1000;
}

.menu-item:hover > .submenu {
  display: block;
}

.submenu .menu-link {
  padding: 0.75rem 1.5rem;
}

/* External link indicator */
a[target='_blank']::after {
  content: ' ↗';
  font-size: 0.75em;
  vertical-align: super;
}

/* Mobile Menu */
@media (max-width: 768px) {
  .mobile-menu-toggle {
    display: block;
    font-size: 1.5rem;
    padding: 0.5rem;
    background: none;
    border: none;
    cursor: pointer;
  }

  .mobile-menu {
    position: fixed;
    top: 60px;
    left: -100%;
    width: 80%;
    height: calc(100vh - 60px);
    background: white;
    transition: left 0.3s;
    overflow-y: auto;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .mobile-menu.open {
    left: 0;
  }

  .mobile-menu-item-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .submenu-toggle {
    padding: 0.5rem 1rem;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }

  .mobile-submenu {
    padding-left: 1rem;
    background: rgba(0, 0, 0, 0.02);
  }
}
```

---

## ✅ Testing Checklist

### Admin Dashboard

- [ ] Can create menu items with all 7 types
- [ ] Entity selector loads correct entities based on type
- [ ] URL field appears for custom/external types
- [ ] Reference ID field appears for entity types
- [ ] Form validation works correctly
- [ ] Can edit existing menu items
- [ ] Can delete menu items
- [ ] Can reorder menu items (drag & drop)
- [ ] Can create nested menu items (parent/child)
- [ ] Slug auto-generates from title
- [ ] Can manually set slug

### Public Website

- [ ] Menu renders correctly
- [ ] Internal links work (page, post, category, service, project)
- [ ] External links open in correct target
- [ ] Custom links work
- [ ] Icons display correctly
- [ ] Nested menus (dropdowns) work
- [ ] Mobile menu works
- [ ] Accessibility features work (keyboard navigation)
- [ ] Cache invalidation works

---

## 🐛 Common Issues & Solutions

### Issue 1: "Reference ID is required" error

**Solution:** Make sure the type is selected before showing the entity selector, and ensure
`referenceId` is included in the payload for entity types.

### Issue 2: Validation fails on form submit

**Solution:** Check that you're sending the correct field based on type:

- Entity types → `referenceId`
- Custom/External → `url`

### Issue 3: Menu not updating after changes

**Solution:** Clear cache or trigger revalidation:

```typescript
router.refresh() // Next.js
// or
mutate('/api/menus/main-menu') // SWR
```

### Issue 4: External links open in same tab

**Solution:** Ensure `target` is set to `_blank` for external links in the form.

---

## 📚 Additional Resources

- [MenuItem Structure Documentation](./MENU_ITEM_STRUCTURE.md)
- [API Quick Reference](./MENU_ITEM_API_QUICK_REF.md)
- [Frontend Examples](./MENU_FRONTEND_EXAMPLES.md)
- [Refactoring Summary](./MENU_REFACTORING_SUMMARY.md)

---

## 🎯 Migration Checklist

- [ ] Update TypeScript types
- [ ] Update form components
- [ ] Update API calls
- [ ] Update menu rendering
- [ ] Add mobile support
- [ ] Add accessibility features
- [ ] Update styling
- [ ] Test all functionality
- [ ] Update documentation
- [ ] Train team members

---

**Last Updated:** November 24, 2025  
**Status:** ✅ Ready for Implementation
