import { Prisma } from '@prisma/client'
import prisma from '../../config/db'
import { paginate } from '../../utils/paginator'

/**
 * ============================================
 * OPTIMIZED MENU SERVICE (JSON-based)
 * ============================================
 * Performance improvements:
 * - Single query to fetch entire menu tree
 * - Eliminated joins and nested queries
 * - Built-in caching support with cacheKey
 * - Version tracking for cache invalidation
 * ============================================
 */

export class MenuService {
  /**
   * Get all menus with pagination
   * Performance: Simple query without relations
   */
  async getAllMenus(page: number = 1, perPage: number = 10) {
    const { skip, take } = paginate(page, perPage)

    const [items, total] = await Promise.all([
      prisma.menu.findMany({
        skip,
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          position: true,
          description: true,
          isPublished: true,
          version: true,
          createdAt: true,
          updatedAt: true,
          // Don't return items in list view
          items: false,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.menu.count(),
    ])

    return { items, page, perPage, total }
  }

  /**
   * Get menu by ID or slug (with full tree structure)
   * Performance: Single query, entire menu tree in JSON
   */
  async getMenu(identifier: string, includeUnpublished: boolean = false) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    )

    const where: Prisma.MenuWhereInput = isUUID ? { id: identifier } : { slug: identifier }

    if (!includeUnpublished) {
      where.isPublished = true
    }

    const menu = await prisma.menu.findFirst({
      where,
    })

    return menu
  }

  /**
   * Get menu by position (e.g., "header", "footer")
   * Performance: Single query with position index
   */
  async getMenuByPosition(position: string) {
    const menu = await prisma.menu.findFirst({
      where: {
        position,
        isPublished: true,
      },
    })

    return menu
  }

  /**
   * Create a new menu
   * Performance: Single insert operation
   */
  async createMenu(data: {
    name: string
    slug: string
    position?: string
    description?: string
    items?: any[]
    isPublished?: boolean
  }) {
    // Check if slug already exists
    const existing = await prisma.menu.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      throw new Error(`Menu with slug "${data.slug}" already exists`)
    }

    const items = data.items ?? []
    const cacheKey = `menu:${data.slug}:v1`

    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        slug: data.slug,
        position: data.position,
        description: data.description,
        items,
        isPublished: data.isPublished ?? false,
        version: 1,
        cacheKey,
      },
    })

    return menu
  }

  /**
   * Update menu
   * Performance: Single update operation
   */
  async updateMenu(
    id: string,
    data: {
      name?: string
      slug?: string
      position?: string
      description?: string
      items?: any[]
      isPublished?: boolean
    }
  ) {
    const menu = await prisma.menu.findUnique({ where: { id } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    // Check if new slug already exists
    if (data.slug && data.slug !== menu.slug) {
      const existing = await prisma.menu.findUnique({
        where: { slug: data.slug },
      })

      if (existing) {
        throw new Error(`Menu with slug "${data.slug}" already exists`)
      }
    }

    const updateData: Prisma.MenuUpdateInput = {}

    if (data.name) updateData.name = data.name
    if (data.slug) updateData.slug = data.slug
    if (data.position !== undefined) updateData.position = data.position
    if (data.description !== undefined) updateData.description = data.description
    if (data.items !== undefined) updateData.items = data.items
    if (data.isPublished !== undefined) updateData.isPublished = data.isPublished

    // Update cache key and version if content changed
    if (data.items !== undefined || data.slug) {
      const newSlug = data.slug ?? menu.slug
      updateData.cacheKey = `menu:${newSlug}:v${menu.version + 1}`
      updateData.version = { increment: 1 }
      updateData.lastCached = null // Invalidate cache
    }

    const updated = await prisma.menu.update({
      where: { id },
      data: updateData,
    })

    return updated
  }

  /**
   * Delete menu
   * Performance: Single delete operation
   */
  async deleteMenu(id: string) {
    const menu = await prisma.menu.findUnique({ where: { id } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    await prisma.menu.delete({ where: { id } })
  }

  /**
   * Duplicate menu
   * Performance: Single query + single insert
   */
  async duplicateMenu(id: string, newName?: string, newSlug?: string) {
    const original = await this.getMenu(id, true)

    if (!original) {
      throw new Error('Menu not found')
    }

    const name = newName ?? `${original.name} (Copy)`
    const slug = newSlug ?? `${original.slug}-copy-${Date.now()}`

    // Check if new slug already exists
    const existing = await prisma.menu.findUnique({
      where: { slug },
    })

    if (existing) {
      throw new Error(`Menu with slug "${slug}" already exists`)
    }

    // Create duplicate with same items structure
    const duplicate = await this.createMenu({
      name,
      slug,
      position: original.position ?? undefined,
      description: original.description ?? undefined,
      items: original.items as any[],
      isPublished: false, // Always create as draft
    })

    return duplicate
  }

  /**
   * Add menu item to menu
   * Performance: Single query + single update
   */
  async addMenuItem(
    menuId: string,
    item: {
      title: string
      type: string
      link: string
      icon?: string
      target?: string
      cssClass?: string
      order?: number
      parentId?: string
      meta?: any
    }
  ) {
    const menu = await prisma.menu.findUnique({ where: { id: menuId } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    const items = (menu.items as any[]) ?? []
    const newItem = {
      id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      title: item.title,
      type: item.type,
      link: item.link,
      icon: item.icon ?? null,
      target: item.target ?? '_self',
      cssClass: item.cssClass ?? null,
      order: item.order ?? items.length,
      isPublished: true,
      meta: item.meta ?? null,
      children: [],
    }

    // If has parentId, add as child
    if (item.parentId) {
      const addToParent = (itemsList: any[]): boolean => {
        for (const existingItem of itemsList) {
          if (existingItem.id === item.parentId) {
            existingItem.children = existingItem.children || []
            existingItem.children.push(newItem)
            return true
          }
          if (existingItem.children && addToParent(existingItem.children)) {
            return true
          }
        }
        return false
      }

      if (!addToParent(items)) {
        throw new Error('Parent menu item not found')
      }
    } else {
      // Add as top-level item
      items.push(newItem)
    }

    const updated = await prisma.menu.update({
      where: { id: menuId },
      data: {
        items,
        version: { increment: 1 },
        cacheKey: `menu:${menu.slug}:v${menu.version + 1}`,
        lastCached: null,
      },
    })

    return updated
  }

  /**
   * Update menu item
   * Performance: Single query + single update
   */
  async updateMenuItem(
    menuId: string,
    itemId: string,
    data: {
      title?: string
      type?: string
      link?: string
      icon?: string
      target?: string
      cssClass?: string
      order?: number
      meta?: any
    }
  ) {
    const menu = await prisma.menu.findUnique({ where: { id: menuId } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    const items = (menu.items as any[]) ?? []

    const updateInTree = (itemsList: any[]): boolean => {
      for (const item of itemsList) {
        if (item.id === itemId) {
          Object.assign(item, data)
          return true
        }
        if (item.children && updateInTree(item.children)) {
          return true
        }
      }
      return false
    }

    if (!updateInTree(items)) {
      throw new Error('Menu item not found')
    }

    const updated = await prisma.menu.update({
      where: { id: menuId },
      data: {
        items,
        version: { increment: 1 },
        cacheKey: `menu:${menu.slug}:v${menu.version + 1}`,
        lastCached: null,
      },
    })

    return updated
  }

  /**
   * Delete menu item
   * Performance: Single query + single update
   */
  async deleteMenuItem(menuId: string, itemId: string) {
    const menu = await prisma.menu.findUnique({ where: { id: menuId } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    const items = (menu.items as any[]) ?? []

    const deleteFromTree = (itemsList: any[]): boolean => {
      for (let i = 0; i < itemsList.length; i++) {
        if (itemsList[i].id === itemId) {
          itemsList.splice(i, 1)
          return true
        }
        if (itemsList[i].children && deleteFromTree(itemsList[i].children)) {
          return true
        }
      }
      return false
    }

    if (!deleteFromTree(items)) {
      throw new Error('Menu item not found')
    }

    const updated = await prisma.menu.update({
      where: { id: menuId },
      data: {
        items,
        version: { increment: 1 },
        cacheKey: `menu:${menu.slug}:v${menu.version + 1}`,
        lastCached: null,
      },
    })

    return updated
  }

  /**
   * Update cache metadata (for Redis integration)
   */
  async updateCacheMetadata(id: string, cacheKey: string) {
    await prisma.menu.update({
      where: { id },
      data: {
        cacheKey,
        lastCached: new Date(),
      },
    })
  }
}

export default new MenuService()
