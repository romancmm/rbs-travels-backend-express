import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { Prisma } from '@prisma/client'
import prisma from '../../config/db'
import { paginate } from '../../utils/paginator'
import { handleSlug } from '../../utils/slug.util'

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
  // main-menu

  async getAllMenus(page: number = 1, perPage: number = 10) {
    try {
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
    } catch (error) {
      handleServiceError(error, 'Menu')
    }
  }

  /**
   * Get published menus only (Public API)
   */
  async getPublishedMenus(page: number = 1, perPage: number = 10) {
    const { skip, take } = paginate(page, perPage)

    const [items, total] = await Promise.all([
      prisma.menu.findMany({
        where: { isPublished: true },
        skip,
        take,
        select: {
          id: true,
          name: true,
          slug: true,
          position: true,
          description: true,
          version: true,
          createdAt: true,
          updatedAt: true,
          _count: {
            select: { items: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.menu.count({ where: { isPublished: true } }),
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
          where: { parentId: null }, // Admin sees all items (published and unpublished)
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
   * Get published menu with only published items (Public API alternative)
   */
  async getPublishedMenu(identifier: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    )

    const where: Prisma.MenuWhereInput = {
      isPublished: true,
      ...(isUUID ? { id: identifier } : { slug: identifier }),
    }

    const menu = await prisma.menu.findFirst({
      where,
      include: {
        items: {
          where: {
            parentId: null,
            isPublished: true, // Only published items
          },
          include: {
            children: {
              where: { isPublished: true }, // Only published children
              include: {
                children: {
                  where: { isPublished: true }, // Only published grandchildren
                },
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
    slug?: string
    position?: string
    description?: string
    isPublished?: boolean
  }) {
    try {
      // Handle slug: auto-generate or purify client-provided slug
      const slug = await handleSlug('menu', data.name, data.slug)

      const menu = await prisma.menu.create({
        data: {
          name: data.name,
          slug,
          position: data.position,
          description: data.description,
          isPublished: data.isPublished ?? false,
          version: 1,
          cacheKey: `menu:${slug}:v1`,
        },
      })

      return menu
    } catch (error) {
      handleServiceError(error, 'Menu')
    }
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
    try {
      const menu = await prisma.menu.findUnique({ where: { id } })

      if (!menu) {
        throw createError(ErrorMessages.NOT_FOUND('Menu'), 404, 'NOT_FOUND')
      }

      // Handle slug if name or slug is being updated
      let slug = data.slug
      if (data.name || data.slug) {
        const name = data.name || menu.name
        slug = await handleSlug('menu', name, data.slug, id)
      }

      const updated = await prisma.menu.update({
        where: { id },
        data: {
          name: data.name,
          slug,
          position: data.position,
          description: data.description,
          isPublished: data.isPublished,
        },
      })

      return updated
    } catch (error) {
      handleServiceError(error, 'Menu')
    }
  }

  /**
   * Delete menu
   */
  async deleteMenu(id: string) {
    try {
      const menu = await prisma.menu.findUnique({ where: { id } })

      if (!menu) {
        throw createError(ErrorMessages.NOT_FOUND('Menu'), 404, 'NOT_FOUND')
      }

      // Cascade will delete all menu items
      await prisma.menu.delete({ where: { id } })
    } catch (error) {
      handleServiceError(error, 'Menu')
    }
  }

  /**
   * Duplicate menu
   */
  async duplicateMenu(id: string, newName?: string, newSlug?: string) {
    try {
      const original = await this.getMenu(id)

      if (!original) {
        throw createError(ErrorMessages.NOT_FOUND('Menu'), 404, 'NOT_FOUND')
      }

      const name = newName ?? `${original.name} (Copy)`

      // Handle slug with auto-suffixing if needed
      const slug = await handleSlug('menu', name, newSlug)

      // Create new menu
      const duplicate = await this.createMenu({
        name,
        slug,
        position: original.position ?? undefined,
        description: original.description ?? undefined,
        isPublished: false,
      })

      if (!duplicate) {
        throw createError('Failed to create duplicate menu', 500, 'CREATION_FAILED')
      }

      // Duplicate all menu items
      const duplicateItems = async (items: any[], parentId: string | null = null) => {
        for (const item of items) {
          // Generate unique slug for duplicated item
          const uniqueSlug = await handleSlug('menuItem', item.title, item.slug)

          const newItem = await prisma.menuItem.create({
            data: {
              menuId: duplicate.id,
              title: item.title,
              slug: uniqueSlug,
              type: item.type,
              reference: item.reference,
              url: item.url,
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
    } catch (error) {
      handleServiceError(error, 'Menu')
    }
  }

  /**
   * Add menu item
   */
  async addMenuItem(
    menuId: string,
    data: {
      title: string
      slug?: string // Optional slug, will be auto-generated if not provided
      type: string // 'page' | 'post' | 'category' | 'service' | 'project' | 'custom-link' | 'custom-link' | 'external-link' | 'external-link'
      reference?: string // Slug of referenced entity
      url?: string // URL for custom/external links or resolved URL
      icon?: string
      target?: string
      cssClass?: string
      parentId?: string
      order?: number
      isPublished?: boolean
      meta?: any
    }
  ) {
    try {
      const menu = await prisma.menu.findUnique({ where: { id: menuId } })

      if (!menu) {
        throw createError(ErrorMessages.NOT_FOUND('Menu'), 404, 'NOT_FOUND')
      }

      // Handle slug: auto-generate or purify client-provided slug
      const uniqueSlug = await handleSlug('menuItem', data.title, data.slug)

      const item = await prisma.menuItem.create({
        data: {
          menuId,
          title: data.title,
          slug: uniqueSlug,
          type: data.type,
          reference: data.reference,
          url: data.url,
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
    } catch (error) {
      handleServiceError(error, 'MenuItem')
    }
  }

  /**
   * Update menu item
   */
  async updateMenuItem(
    menuId: string,
    itemId: string,
    data: {
      title?: string
      slug?: string
      type?: string // 'page' | 'post' | 'category' | 'service' | 'project' | 'custom-link' | 'custom-link' | 'external-link' | 'external-link'
      reference?: string // Slug of referenced entity
      url?: string // URL for custom/external links or resolved URL
      icon?: string
      target?: string
      cssClass?: string
      parentId?: string
      order?: number
      isPublished?: boolean
      meta?: any
    }
  ) {
    try {
      const item = await prisma.menuItem.findFirst({
        where: { id: itemId, menuId },
      })

      if (!item) {
        throw createError(ErrorMessages.NOT_FOUND('MenuItem'), 404, 'NOT_FOUND')
      }

      // Handle slug if title or slug is being updated
      let uniqueSlug = data.slug
      if (data.title || data.slug) {
        const title = data.title || item.title
        uniqueSlug = await handleSlug('menuItem', title, data.slug, itemId)
      }

      const updated = await prisma.menuItem.update({
        where: { id: itemId },
        data: {
          ...data,
          ...(uniqueSlug && { slug: uniqueSlug }),
        },
      })

      // Regenerate cache
      await this.regenerateCache(menuId)

      return updated
    } catch (error) {
      handleServiceError(error, 'MenuItem')
    }
  }

  /**
   * Delete menu item
   */
  async deleteMenuItem(menuId: string, itemId: string) {
    try {
      const item = await prisma.menuItem.findFirst({
        where: { id: itemId, menuId },
      })

      if (!item) {
        throw createError(ErrorMessages.NOT_FOUND('MenuItem'), 404, 'NOT_FOUND')
      }

      // Cascade will delete children
      await prisma.menuItem.delete({ where: { id: itemId } })

      // Regenerate cache
      await this.regenerateCache(menuId)
    } catch (error) {
      handleServiceError(error, 'MenuItem')
    }
  }

  /**
   * Reorder menu items
   */
  async reorderMenuItems(menuId: string, itemOrders: { id: string; order: number }[]) {
    try {
      const menu = await prisma.menu.findUnique({ where: { id: menuId } })

      if (!menu) {
        throw createError(ErrorMessages.NOT_FOUND('Menu'), 404, 'NOT_FOUND')
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
    } catch (error) {
      handleServiceError(error, 'Menu')
    }
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
          where: {
            parentId: null,
            isPublished: true, // Only include published items
          },
          include: {
            children: {
              where: { isPublished: true }, // Only include published children
              include: {
                children: {
                  where: { isPublished: true }, // Only include published grandchildren
                },
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
        slug: item.slug,
        type: item.type,
        reference: item.reference,
        url: item.url,
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
