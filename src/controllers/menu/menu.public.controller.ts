import menuService from '@/services/menu/menu.service'
import { paginated, success } from '@/utils/response'
import type { RequestHandler } from 'express'

/**
 * List published menus only
 */
export const listMenus: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = req.query

    const result = await menuService.getPublishedMenus(
      page ? Number(page) : 0,
      limit ? Number(limit) : 10
    )

    return paginated(res, result.items, result, 'Menus fetched successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Get published menu by ID or slug
 */
export const getMenu: RequestHandler = async (req, res, next) => {
  try {
    const { identifier } = req.params

    if (!identifier) {
      const error = new Error('Menu identifier is required') as any
      error.status = 400
      throw error
    }

    const data = await menuService.getPublicMenu(identifier) // Uses cache

    if (!data) {
      const error = new Error('Menu not found') as any
      error.status = 404
      throw error
    }

    return success(res, data, 'Menu fetched successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Get menu item by slug
 */
export const getMenuItem: RequestHandler = async (req, res, next) => {
  try {
    const { slug } = req.params

    if (!slug) {
      const error = new Error('Menu item slug is required') as any
      error.status = 400
      throw error
    }

    const data = await menuService.getMenuItemBySlug(slug)

    return success(res, data, 'Menu item fetched successfully')
  } catch (err) {
    next(err)
  }
}
