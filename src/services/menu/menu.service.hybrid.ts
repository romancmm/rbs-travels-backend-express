import { Prisma } from '@prisma/client'
import prisma from '../../config/db'
import { paginate } from '../../utils/paginator'

/**
 * ============================================
 * HYBRID MENU SERVICE
 * ============================================
 * Best of both worlds:
 * - Relational MenuItem table for data integrity and querying
 * - JSON cache for ultra-fast public API responses
 * - Automatic cache regeneration on updates
 * ============================================
 */

export class MenuService {
  /**
   * Get all menus (Admin API)
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
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.menu.count(),
    ])

    return { items, page, perPage, total }
  }

  /**
   * Get menu with items (Admin API - uses relational structure)
   * Returns full MenuItem relations for editing
   */
  async getMenu(identifier: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    )

    const where: Prisma.MenuWhereInput = isUUID ? { id: identifier } : { slug: identifier }

    const menu = await prisma.menu.findFirst({
      where,
      include: {
        items: {
          where: { parentId: null },
          include: {
            children: {
              include: {
                children: true, // Support 3 levels
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    return menu
  }

  /**
   * Get menu for public API (uses cached JSON)
   * Ultra-fast: Single query, no joins
   */
  async getPublicMenu(identifier: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    )

    const where: Prisma.MenuWhereInput = {
      isPublished: true,
      ...(isUUID ? { id: identifier } : { slug: identifier }),
    }

    const menu = await prisma.menu.findFirst({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        position: true,
        itemsCache: true, // Use cached JSON tree
        version: true,
      },
    })

    if (!menu) return null

    return {
      ...menu,
      items: menu.itemsCache, // Expose as 'items'
      itemsCache: undefined, // Hide internal field
    }
  }

  /**
   * Get menu by position (e.g., "header", "footer")
   */
  async getMenuByPosition(position: string, useCache: boolean = true) {
    if (useCache) {
      // Public API - use cache
      const menu = await prisma.menu.findFirst({
        where: { position, isPublished: true },
        select: {
          id: true,
          name: true,
          slug: true,
          position: true,
          itemsCache: true,
          version: true,
        },
      })

      if (!menu) return null

      return {
        ...menu,
        items: menu.itemsCache,
        itemsCache: undefined,
      }
    } else {
      // Admin API - use relations
      return this.getMenu(position)
    }
  }

  /**
   * Create a new menu
   */
  async createMenu(data: {
    name: string
    slug: string
    position?: string
    description?: string
    isPublished?: boolean
  }) {
    const existing = await prisma.menu.findUnique({
      where: { slug: data.slug },
    })

    if (existing) {
      throw new Error(`Menu with slug "${data.slug}" already exists`)
    }

    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        slug: data.slug,
        position: data.position,
        description: data.description,
        isPublished: data.isPublished ?? false,
        version: 1,
        cacheKey: `menu:${data.slug}:v1`,
      },
    })

    return menu
  }

  /**
   * Update menu metadata
   */
  async updateMenu(
    id: string,
    data: {
      name?: string
      slug?: string
      position?: string
      description?: string
      isPublished?: boolean
    }
  ) {
    const menu = await prisma.menu.findUnique({ where: { id } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    if (data.slug && data.slug !== menu.slug) {
      const existing = await prisma.menu.findUnique({
        where: { slug: data.slug },
      })

      if (existing) {
        throw new Error(`Menu with slug "${data.slug}" already exists`)
      }
    }

    const updated = await prisma.menu.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        position: data.position,
        description: data.description,
        isPublished: data.isPublished,
      },
    })

    return updated
  }

  /**
   * Delete menu
   */
  async deleteMenu(id: string) {
    const menu = await prisma.menu.findUnique({ where: { id } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    // Cascade will delete all menu items
    await prisma.menu.delete({ where: { id } })
  }

  /**
   * Duplicate menu
   */
  async duplicateMenu(id: string, newName?: string, newSlug?: string) {
    const original = await this.getMenu(id)

    if (!original) {
      throw new Error('Menu not found')
    }

    const name = newName ?? `${original.name} (Copy)`
    const slug = newSlug ?? `${original.slug}-copy-${Date.now()}`

    const existing = await prisma.menu.findUnique({ where: { slug } })

    if (existing) {
      throw new Error(`Menu with slug "${slug}" already exists`)
    }

    // Create new menu
    const duplicate = await this.createMenu({
      name,
      slug,
      position: original.position ?? undefined,
      description: original.description ?? undefined,
      isPublished: false,
    })

    // Duplicate all menu items
    const duplicateItems = async (items: any[], parentId: string | null = null) => {
      for (const item of items) {
        const newItem = await prisma.menuItem.create({
          data: {
            menuId: duplicate.id,
            title: item.title,
            type: item.type,
            link: item.link,
            categoryId: item.categoryId,
            pageId: item.pageId,
            articleId: item.articleId,
            icon: item.icon,
            target: item.target,
            cssClass: item.cssClass,
            parentId,
            order: item.order,
            isPublished: item.isPublished,
            meta: item.meta,
          },
        })

        // Recursively duplicate children
        if (item.children && item.children.length > 0) {
          await duplicateItems(item.children, newItem.id)
        }
      }
    }

    await duplicateItems(original.items)

    // Regenerate cache
    await this.regenerateCache(duplicate.id)

    return this.getMenu(duplicate.id)
  }

  /**
   * Add menu item
   */
  async addMenuItem(
    menuId: string,
    data: {
      title: string
      type: string
      link?: string
      categoryId?: string
      pageId?: string
      articleId?: string
      icon?: string
      target?: string
      cssClass?: string
      parentId?: string
      order?: number
      isPublished?: boolean
      meta?: any
    }
  ) {
    const menu = await prisma.menu.findUnique({ where: { id: menuId } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    const item = await prisma.menuItem.create({
      data: {
        menuId,
        title: data.title,
        type: data.type,
        link: data.link,
        categoryId: data.categoryId,
        pageId: data.pageId,
        articleId: data.articleId,
        icon: data.icon,
        target: data.target ?? '_self',
        cssClass: data.cssClass,
        parentId: data.parentId,
        order: data.order ?? 0,
        isPublished: data.isPublished ?? true,
        meta: data.meta,
      },
    })

    // Regenerate cache
    await this.regenerateCache(menuId)

    return item
  }

  /**
   * Update menu item
   */
  async updateMenuItem(
    menuId: string,
    itemId: string,
    data: {
      title?: string
      type?: string
      link?: string
      categoryId?: string
      pageId?: string
      articleId?: string
      icon?: string
      target?: string
      cssClass?: string
      parentId?: string
      order?: number
      isPublished?: boolean
      meta?: any
    }
  ) {
    const item = await prisma.menuItem.findFirst({
      where: { id: itemId, menuId },
    })

    if (!item) {
      throw new Error('Menu item not found')
    }

    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data,
    })

    // Regenerate cache
    await this.regenerateCache(menuId)

    return updated
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(menuId: string, itemId: string) {
    const item = await prisma.menuItem.findFirst({
      where: { id: itemId, menuId },
    })

    if (!item) {
      throw new Error('Menu item not found')
    }

    // Cascade will delete children
    await prisma.menuItem.delete({ where: { id: itemId } })

    // Regenerate cache
    await this.regenerateCache(menuId)
  }

  /**
   * Reorder menu items
   */
  async reorderMenuItems(menuId: string, itemOrders: { id: string; order: number }[]) {
    const menu = await prisma.menu.findUnique({ where: { id: menuId } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    // Update order for each item
    await Promise.all(
      itemOrders.map((item) =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: { order: item.order },
        })
      )
    )

    // Regenerate cache
    await this.regenerateCache(menuId)
  }

  /**
   * Regenerate menu cache from relational data
   * Call this after any MenuItem changes
   */
  async regenerateCache(menuId: string) {
    const menu = await prisma.menu.findUnique({
      where: { id: menuId },
      include: {
        items: {
          where: { parentId: null },
          include: {
            children: {
              include: {
                children: true,
              },
              orderBy: { order: 'asc' },
            },
          },
          orderBy: { order: 'asc' },
        },
      },
    })

    if (!menu) return

    // Build tree structure
    const buildTree = (items: any[]): any[] => {
      return items.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        link: item.link,
        categoryId: item.categoryId,
        pageId: item.pageId,
        articleId: item.articleId,
        icon: item.icon,
        target: item.target,
        cssClass: item.cssClass,
        order: item.order,
        isPublished: item.isPublished,
        meta: item.meta,
        children: item.children ? buildTree(item.children) : [],
      }))
    }

    const itemsCache = buildTree(menu.items)

    await prisma.menu.update({
      where: { id: menuId },
      data: {
        itemsCache,
        version: { increment: 1 },
        cacheKey: `menu:${menu.slug}:v${menu.version + 1}`,
        lastCached: new Date(),
      },
    })
  }

  /**
   * Regenerate all menu caches
   * Useful for bulk updates or maintenance
   */
  async regenerateAllCaches() {
    const menus = await prisma.menu.findMany()

    for (const menu of menus) {
      await this.regenerateCache(menu.id)
    }

    console.log(`✅ Regenerated cache for ${menus.length} menus`)
  }
}

export default new MenuService()
