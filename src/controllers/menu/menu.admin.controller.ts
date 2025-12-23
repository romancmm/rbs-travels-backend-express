import menuService from '@/services/menu/menu.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

/**
 * List all menus (admin - includes unpublished)
 */
export const listMenus: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit } = req.query

    const data = await menuService.getAllMenus(page ? Number(page) : 1, limit ? Number(limit) : 10)

    return success(res, data, 'Menus fetched successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Get menu by ID or slug (admin - includes unpublished)
 */
export const getMenu: RequestHandler = async (req, res, next) => {
  try {
    const { identifier } = req.params

    if (!identifier) {
      const error = new Error('Menu identifier is required') as any
      error.status = 400
      throw error
    }

    const data = await menuService.getMenu(identifier)

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
 * Create new menu
 */
export const createMenu: RequestHandler = async (req, res, next) => {
  try {
    const data = await menuService.createMenu(req.body)
    res.status(201)
    return success(res, data, 'Menu created successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Update menu
 */
export const updateMenu: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id) {
      const error = new Error('Menu ID is required') as any
      error.status = 400
      throw error
    }

    const data = await menuService.updateMenu(id, req.body)
    return success(res, data, 'Menu updated successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Delete menu
 */
export const deleteMenu: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id) {
      const error = new Error('Menu ID is required') as any
      error.status = 400
      throw error
    }

    await menuService.deleteMenu(id)
    return success(res, null, 'Menu deleted successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Create menu item
 */
export const createMenuItem: RequestHandler = async (req, res, next) => {
  try {
    const { menuId } = req.params

    if (!menuId) {
      const error = new Error('Menu ID is required') as any
      error.status = 400
      throw error
    }

    const data = await menuService.addMenuItem(menuId, req.body)
    res.status(201)
    return success(res, data, 'Menu item created successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Update menu item
 */
export const updateMenuItem: RequestHandler = async (req, res, next) => {
  try {
    const { menuId, itemId } = req.params

    if (!menuId || !itemId) {
      const error = new Error('Menu ID and Item ID are required') as any
      error.status = 400
      throw error
    }

    const data = await menuService.updateMenuItem(menuId, itemId, req.body)
    return success(res, data, 'Menu item updated successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Delete menu item
 */
export const deleteMenuItem: RequestHandler = async (req, res, next) => {
  try {
    const { menuId, itemId } = req.params

    if (!menuId || !itemId) {
      const error = new Error('Menu ID and Item ID are required') as any
      error.status = 400
      throw error
    }

    await menuService.deleteMenuItem(menuId, itemId)
    return success(res, null, 'Menu item deleted successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Reorder menu items
 */
export const reorderMenuItems: RequestHandler = async (req, res, next) => {
  try {
    const { menuId } = req.params

    if (!menuId) {
      const error = new Error('Menu ID is required') as any
      error.status = 400
      throw error
    }

    const data = await menuService.reorderMenuItems(menuId, req.body.items)
    return success(res, data, 'Menu items reordered successfully')
  } catch (err) {
    next(err)
  }
}
