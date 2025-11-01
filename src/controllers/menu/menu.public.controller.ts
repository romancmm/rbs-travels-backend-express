import menuService from '@/services/menu/menu.service'
import { error, success } from '@/utils/response'
import type { RequestHandler } from 'express'

/**
 * List published menus only
 */
export const listMenus: RequestHandler = async (req, res) => {
  try {
    const { page, limit, position } = req.query

    const data = await menuService.getAllMenus(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      {
        position: position as string,
        isPublished: true, // Only published menus
      }
    )

    return success(res, data, 'Menus fetched successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Get published menu by ID or slug
 */
export const getMenu: RequestHandler = async (req, res) => {
  try {
    const { identifier } = req.params

    if (!identifier) {
      return error(res, 'Menu identifier is required', 400)
    }

    const data = await menuService.getMenu(identifier, false) // Only published

    if (!data) {
      return error(res, 'Menu not found', 404)
    }

    return success(res, data, 'Menu fetched successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}
