import menuService from '@/services/menu/menu.service'
import { error, success } from '@/utils/response'
import type { RequestHandler } from 'express'

/**
 * List all menus (admin - includes unpublished)
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
 * Get menu by ID or slug (admin - includes unpublished)
 */
export const getMenu: RequestHandler = async (req, res) => {
  try {
    const { identifier } = req.params

    if (!identifier) {
      return error(res, 'Menu identifier is required', 400)
    }

    const data = await menuService.getMenu(identifier)

    if (!data) {
      return error(res, 'Menu not found', 404)
    }

    return success(res, data, 'Menu fetched successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Create new menu
 */
export const createMenu: RequestHandler = async (req, res) => {
  try {
    const data = await menuService.createMenu(req.body)
    res.status(201)
    return success(res, data, 'Menu created successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Update menu
 */
export const updateMenu: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return error(res, 'Menu ID is required', 400)
    }

    const data = await menuService.updateMenu(id, req.body)
    return success(res, data, 'Menu updated successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Delete menu
 */
export const deleteMenu: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return error(res, 'Menu ID is required', 400)
    }

    await menuService.deleteMenu(id)
    return success(res, null, 'Menu deleted successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Create menu item
 */
export const createMenuItem: RequestHandler = async (req, res) => {
  try {
    const { menuId } = req.params

    if (!menuId) {
      return error(res, 'Menu ID is required', 400)
    }

    const data = await menuService.addMenuItem(menuId, req.body)
    res.status(201)
    return success(res, data, 'Menu item created successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Update menu item
 */
export const updateMenuItem: RequestHandler = async (req, res) => {
  try {
    const { menuId, itemId } = req.params

    if (!menuId || !itemId) {
      return error(res, 'Menu ID and Item ID are required', 400)
    }

    const data = await menuService.updateMenuItem(menuId, itemId, req.body)
    return success(res, data, 'Menu item updated successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Delete menu item
 */
export const deleteMenuItem: RequestHandler = async (req, res) => {
  try {
    const { menuId, itemId } = req.params

    if (!menuId || !itemId) {
      return error(res, 'Menu ID and Item ID are required', 400)
    }

    await menuService.deleteMenuItem(menuId, itemId)
    return success(res, null, 'Menu item deleted successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Reorder menu items
 */
export const reorderMenuItems: RequestHandler = async (req, res) => {
  try {
    const { menuId } = req.params

    if (!menuId) {
      return error(res, 'Menu ID is required', 400)
    }

    const data = await menuService.reorderMenuItems(menuId, req.body.items)
    return success(res, data, 'Menu items reordered successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}
