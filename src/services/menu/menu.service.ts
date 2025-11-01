import { Prisma } from '@prisma/client'
import prisma from '../../config/db'
import { paginate } from '../../utils/paginator'

export class MenuService {
  /**
   * Get all menus with pagination and filters
   */
  async getAllMenus(
    page: number = 1,
    perPage: number = 10,
    filters?: {
      position?: string
      isPublished?: boolean
    }
  ) {
    const { skip, take } = paginate(page, perPage)
    const where: Prisma.MenuWhereInput = {}

    if (filters?.position) {
      where.position = filters.position
    }

    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished
    }

    const [items, total] = await Promise.all([
      prisma.menu.findMany({
        where,
        skip,
        take,
        include: {
          items: {
            where: { parentId: null },
            orderBy: { order: 'asc' },
            include: {
              children: {
                orderBy: { order: 'asc' },
                include: {
                  children: {
                    orderBy: { order: 'asc' },
                    include: {
                      children: true,
                    },
                  },
                },
              },
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.menu.count({ where }),
    ])

    return { items, page, perPage, total }
  }

  /**
   * Get menu by ID or slug
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
      include: {
        items: {
          where: {
            parentId: null,
            ...(includeUnpublished ? {} : { isPublished: true }),
          },
          orderBy: { order: 'asc' },
          include: {
            children: {
              where: includeUnpublished ? {} : { isPublished: true },
              orderBy: { order: 'asc' },
              include: {
                children: {
                  where: includeUnpublished ? {} : { isPublished: true },
                  orderBy: { order: 'asc' },
                  include: {
                    children: {
                      where: includeUnpublished ? {} : { isPublished: true },
                      orderBy: { order: 'asc' },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    return menu
  }

  /**
   * Create a new menu
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

    const menu = await prisma.menu.create({
      data: {
        name: data.name,
        slug: data.slug,
        position: data.position,
        description: data.description,
        isPublished: data.isPublished ?? false,
      },
      include: {
        items: {
          orderBy: { order: 'asc' },
        },
      },
    })

    // If items are provided, create them
    if (data.items && data.items.length > 0) {
      await this.createMenuItems(menu.id, data.items)
    }

    return this.getMenu(menu.id, true)
  }

  /**
   * Update menu
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

    // Update menu basic info
    await prisma.menu.update({
      where: { id },
      data: {
        name: data.name,
        slug: data.slug,
        position: data.position,
        description: data.description,
        isPublished: data.isPublished,
      },
    })

    // If items are provided, replace all items
    if (data.items !== undefined) {
      await prisma.menuItem.deleteMany({ where: { menuId: id } })
      if (data.items.length > 0) {
        await this.createMenuItems(id, data.items)
      }
    }

    return this.getMenu(id, true)
  }

  /**
   * Delete menu
   */
  async deleteMenu(id: string) {
    const menu = await prisma.menu.findUnique({ where: { id } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    await prisma.menu.delete({ where: { id } })
  }

  /**
   * Create menu items recursively
   */
  private async createMenuItems(
    menuId: string,
    items: any[],
    parentId: string | null = null
  ): Promise<void> {
    for (const item of items) {
      const created = await prisma.menuItem.create({
        data: {
          menuId,
          title: item.title,
          type: item.type,
          link: item.link,
          icon: item.icon,
          target: item.target ?? '_self',
          cssClass: item.cssClass,
          parentId: parentId,
          order: item.order ?? 0,
          isPublished: item.isPublished ?? true,
          meta: item.meta ?? {},
        },
      })

      // Recursively create children
      if (item.children && item.children.length > 0) {
        await this.createMenuItems(menuId, item.children, created.id)
      }
    }
  }

  /**
   * Create a single menu item
   */
  async createMenuItem(menuId: string, data: any) {
    const menu = await prisma.menu.findUnique({ where: { id: menuId } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    // Validate parent exists if provided
    if (data.parentId) {
      const parent = await prisma.menuItem.findFirst({
        where: { id: data.parentId, menuId },
      })

      if (!parent) {
        throw new Error('Parent menu item not found')
      }
    }

    const item = await prisma.menuItem.create({
      data: {
        menuId,
        title: data.title,
        type: data.type,
        link: data.link,
        icon: data.icon,
        target: data.target ?? '_self',
        cssClass: data.cssClass,
        parentId: data.parentId,
        order: data.order ?? 0,
        isPublished: data.isPublished ?? true,
        meta: data.meta ?? {},
      },
      include: {
        children: true,
      },
    })

    return item
  }

  /**
   * Update menu item
   */
  async updateMenuItem(menuId: string, itemId: string, data: any) {
    const item = await prisma.menuItem.findFirst({
      where: { id: itemId, menuId },
    })

    if (!item) {
      throw new Error('Menu item not found')
    }

    // Validate parent exists if provided
    if (data.parentId !== undefined) {
      if (data.parentId === itemId) {
        throw new Error('Menu item cannot be its own parent')
      }

      if (data.parentId) {
        const parent = await prisma.menuItem.findFirst({
          where: { id: data.parentId, menuId },
        })

        if (!parent) {
          throw new Error('Parent menu item not found')
        }

        // Check for circular reference
        const isCircular = await this.checkCircularReference(data.parentId, itemId)
        if (isCircular) {
          throw new Error('Circular reference detected')
        }
      }
    }

    const updated = await prisma.menuItem.update({
      where: { id: itemId },
      data: {
        title: data.title,
        type: data.type,
        link: data.link,
        icon: data.icon,
        target: data.target,
        cssClass: data.cssClass,
        parentId: data.parentId,
        order: data.order,
        isPublished: data.isPublished,
        meta: data.meta,
      },
      include: {
        children: true,
      },
    })

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

    await prisma.menuItem.delete({ where: { id: itemId } })
  }

  /**
   * Reorder menu items
   */
  async reorderMenuItems(
    menuId: string,
    items: Array<{ id: string; order: number; parentId?: string | null }>
  ) {
    const menu = await prisma.menu.findUnique({ where: { id: menuId } })

    if (!menu) {
      throw new Error('Menu not found')
    }

    // Update each item
    await prisma.$transaction(
      items.map((item) =>
        prisma.menuItem.update({
          where: { id: item.id },
          data: {
            order: item.order,
            parentId: item.parentId !== undefined ? item.parentId : undefined,
          },
        })
      )
    )

    return this.getMenu(menuId, true)
  }

  /**
   * Check for circular reference in menu hierarchy
   */
  private async checkCircularReference(parentId: string, childId: string): Promise<boolean> {
    let currentId: string | null = parentId

    while (currentId) {
      if (currentId === childId) {
        return true
      }

      const item: { parentId: string | null } | null = await prisma.menuItem.findUnique({
        where: { id: currentId },
        select: { parentId: true },
      })

      currentId = item?.parentId ?? null
    }

    return false
  }
}

export default new MenuService()
