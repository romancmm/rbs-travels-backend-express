import * as MenuController from '@/controllers/menu/menu.admin.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import {
  createMenuItemBodySchema,
  createMenuItemParamsSchema,
  createMenuSchema,
  deleteMenuItemParamsSchema,
  deleteMenuParamsSchema,
  getMenuParamsSchema,
  listMenusQuerySchema,
  reorderMenuItemsBodySchema,
  reorderMenuItemsParamsSchema,
  updateMenuBodySchema,
  updateMenuItemBodySchema,
  updateMenuItemParamsSchema,
  updateMenuParamsSchema,
} from '@/validators/menu.validator'
import { Router } from 'express'

const router = Router()

// All admin menu routes require authentication
router.use(adminAuthMiddleware)

// Menu CRUD
router.get(
  '/',
  requirePermission('menu.read'),
  validate(listMenusQuerySchema, 'query'),
  MenuController.listMenus
)

router.get(
  '/:identifier',
  requirePermission('menu.read'),
  validate(getMenuParamsSchema, 'params'),
  MenuController.getMenu
)

router.post(
  '/',
  requirePermission('menu.create'),
  validate(createMenuSchema, 'body'),
  MenuController.createMenu
)

router.put(
  '/:id',
  requirePermission('menu.update'),
  validateMultiple({ params: updateMenuParamsSchema, body: updateMenuBodySchema }),
  MenuController.updateMenu
)

router.delete(
  '/:id',
  requirePermission('menu.delete'),
  validate(deleteMenuParamsSchema, 'params'),
  MenuController.deleteMenu
)

// Menu Item CRUD
router.post(
  '/:menuId/items',
  requirePermission('menu.update'),
  validateMultiple({ params: createMenuItemParamsSchema, body: createMenuItemBodySchema }),
  MenuController.createMenuItem
)

router.put(
  '/:menuId/items/:itemId',
  requirePermission('menu.update'),
  validateMultiple({ params: updateMenuItemParamsSchema, body: updateMenuItemBodySchema }),
  MenuController.updateMenuItem
)

router.delete(
  '/:menuId/items/:itemId',
  requirePermission('menu.delete'),
  validate(deleteMenuItemParamsSchema, 'params'),
  MenuController.deleteMenuItem
)

// Reorder menu items
router.post(
  '/:menuId/reorder',
  requirePermission('menu.update'),
  validateMultiple({ params: reorderMenuItemsParamsSchema, body: reorderMenuItemsBodySchema }),
  MenuController.reorderMenuItems
)

export default router
