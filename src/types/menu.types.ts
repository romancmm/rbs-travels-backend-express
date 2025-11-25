/**
 * Menu Item Types
 * Generic, polymorphic structure for all menu item types
 */

export type MenuItemType =
  | 'category-articles' // Category listing page (multiple categories via references[])
  | 'single-article' // Single article/post (via reference)
  | 'page' // Single page (via reference)
  | 'service' // Single service (via reference)
  | 'project' // Single project (via reference)
  | 'custom-link' // Custom URL (internal or external)
  | 'external-link' // External link with validation

export type MenuItemTarget = '_self' | '_blank'

export interface MenuItem {
  id: string
  menuId: string
  title: string
  slug: string
  type: MenuItemType
  reference: string | string[] | null // String for single entity OR Array for category-articles
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
  reference?: string | string[] | null // String for single entity OR Array for category-articles
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
  reference?: string | string[] | null // String for single entity OR Array for category-articles
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
  return ['single-article', 'page', 'service', 'project'].includes(item.type)
}

export const isCategoryArticlesMenuItem = (item: MenuItem): boolean => {
  return item.type === 'category-articles'
}

export const isExternalMenuItem = (item: MenuItem): boolean => {
  return item.type === 'external-link'
}

export const isCustomMenuItem = (item: MenuItem): boolean => {
  return ['custom-link', 'external-link'].includes(item.type)
}

export const hasChildren = (item: MenuItem): boolean => {
  return Array.isArray(item.children) && item.children.length > 0
}

/**
 * Helper to validate menu item structure
 */
export const validateMenuItem = (item: CreateMenuItemInput): string[] => {
  const errors: string[] = []

  // Category-articles requires array of references
  if (item.type === 'category-articles') {
    if (!Array.isArray(item.reference) || item.reference.length === 0) {
      errors.push('At least one category is required for category-articles type')
    }
  }

  // Entity types require single string reference
  if (['single-article', 'page', 'service', 'project'].includes(item.type)) {
    if (!item.reference || typeof item.reference !== 'string') {
      errors.push(`Reference (slug) is required for ${item.type} type`)
    }
  }

  // Link types require url
  if (['custom-link', 'external-link'].includes(item.type)) {
    if (!item.url) {
      errors.push(`URL is required for ${item.type} type`)
    }
  }

  // External links should start with http:// or https://
  if (item.type === 'external-link' && item.url) {
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
  // Return existing URL if set (for custom-link and external-link)
  if (item.url) return item.url

  // Category-articles: construct URL from reference array
  if (item.type === 'category-articles' && Array.isArray(item.reference)) {
    if (item.reference.length > 0) {
      // If single category, link to that category
      if (item.reference.length === 1) {
        return `/articles/category/${item.reference[0]}`
      }
      // If multiple categories, link to articles with category filter
      return `/articles?categories=${item.reference.join(',')}`
    }
    return '/articles' // Default articles listing
  }

  // For entity types, construct URL from reference string
  if (item.reference && typeof item.reference === 'string') {
    switch (item.type) {
      case 'single-article':
        return `/articles/${item.reference}`
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
