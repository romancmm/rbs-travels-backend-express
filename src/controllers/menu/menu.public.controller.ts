import menuService from '@/services/menu/menu.service'
import { error, success } from '@/utils/response'
import type { RequestHandler } from 'express'

/**
 * List published menus only
 */
export const listMenus: RequestHandler = async (req, res) => {
  try {
    const { page, limit } = req.query

    const data = await menuService.getAllMenus(page ? Number(page) : 1, limit ? Number(limit) : 10)

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

    const data = await menuService.getPublicMenu(identifier) // Uses cache

    if (!data) {
      return error(res, 'Menu not found', 404)
    }

    return success(res, data, 'Menu fetched successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}
