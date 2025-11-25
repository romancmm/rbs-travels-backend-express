/**
 * Menu Item Types
 * Generic, polymorphic structure for all menu item types
 */

export type MenuItemType =
  | 'page' // Links to a Page
  | 'post' // Links to a Post/Article
  | 'category' // Links to a Category
  | 'service' // Links to a Service
  | 'project' // Links to a Project
  | 'custom-link' // Custom internal link (legacy)
  | 'custom-link' // Custom internal link
  | 'external-link' // External link (legacy)
  | 'external-link' // External link

export type MenuItemTarget = '_self' | '_blank'

export interface MenuItem {
  id: string
  menuId: string
  title: string
  slug: string
  type: MenuItemType
  reference: string | null // Slug of referenced entity (page, post, category, etc.)
  url: string | null // URL for custom/external links or resolved URL
  icon?: string | null
  target: MenuItemTarget
  cssClass?: string | null
  parentId?: string | null
  order: number
  isPublished: boolean
  meta?: Record<string, any> | null
  createdAt: Date
  updatedAt: Date
  children?: MenuItem[]
}

export interface CreateMenuItemInput {
  title: string
  slug?: string
  type: MenuItemType
  reference?: string // Slug of referenced entity
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
  reference?: string // Slug of referenced entity
  url?: string
  icon?: string
  target?: MenuItemTarget
  cssClass?: string
  parentId?: string | null
  order?: number
  isPublished?: boolean
  meta?: Record<string, any>
}

export interface Menu {
  id: string
  name: string
  slug: string
  position?: string | null
  description?: string | null
  items: MenuItem[]
  isPublished: boolean
  version: number
  createdAt: Date
  updatedAt: Date
}

export interface CreateMenuInput {
  name: string
  slug?: string
  position?: string
  description?: string
  items?: CreateMenuItemInput[]
  isPublished?: boolean
}

export interface UpdateMenuInput {
  name?: string
  slug?: string
  position?: string
  description?: string
  items?: CreateMenuItemInput[]
  isPublished?: boolean
}

/**
 * Type guards for menu items
 */
export const isEntityMenuItem = (item: MenuItem): boolean => {
  return ['page', 'post', 'category', 'service', 'project'].includes(item.type)
}

export const isExternalMenuItem = (item: MenuItem): boolean => {
  return item.type === 'external-link' || item.type === 'external-link'
}

export const isCustomMenuItem = (item: MenuItem): boolean => {
  return item.type === 'custom-link' || item.type === 'custom-link'
}

export const hasChildren = (item: MenuItem): boolean => {
  return Array.isArray(item.children) && item.children.length > 0
}

/**
 * Helper to validate menu item structure
 */
export const validateMenuItem = (item: CreateMenuItemInput): string[] => {
  const errors: string[] = []

  // Entity types require reference
  if (['page', 'post', 'category', 'service', 'project'].includes(item.type)) {
    if (!item.reference) {
      errors.push(`Reference (slug) is required for ${item.type} type`)
    }
  }

  // Custom/External types require url
  if (['custom-link', 'custom-link', 'external-link', 'external-link'].includes(item.type)) {
    if (!item.url) {
      errors.push(`URL is required for ${item.type} type`)
    }
  }

  // External links should start with http:// or https://
  if ((item.type === 'external-link' || item.type === 'external-link') && item.url) {
    if (!item.url.startsWith('http://') && !item.url.startsWith('https://')) {
      errors.push('External URLs must start with http:// or https://')
    }
  }

  return errors
}

/**
 * Helper to build menu item URL from reference
 */
export const getMenuItemUrl = (item: MenuItem): string | null => {
  // Return existing URL if set
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
