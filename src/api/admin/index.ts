import * as AdminController from '@/controllers/admin/Admin.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import { idParamSchema } from '@/validators/common.validator'
import { createUserSchema, updateUserSchema, userQuerySchema } from '@/validators/user.validator'
import { Router } from 'express'
import { z } from 'zod'

const router = Router()

// Schema for assign role endpoint
const assignRoleSchema = z.object({
  roleId: z.string().uuid(),
})

// All admin user routes require authentication
router.use(adminAuthMiddleware)

// Admin Users Management - CRUD for admin/staff users only
router.get(
  '/admins',
  requirePermission('admin.read'),
  validate(userQuerySchema, 'query'),
  AdminController.list
)
router.get(
  '/admins/:id',
  requirePermission('admin.read'),
  validate(idParamSchema, 'params'),
  AdminController.getById
)
router.post(
  '/admins',
  requirePermission('admin.create'),
  validate(createUserSchema),
  AdminController.create
)
router.put(
  '/admins/:id',
  requirePermission('admin.update'),
  validateMultiple({ params: idParamSchema, body: updateUserSchema }),
  AdminController.update
)
router.delete(
  '/admins/:id',
  requirePermission('admin.delete'),
  validate(idParamSchema, 'params'),
  AdminController.remove
)
router.patch(
  '/admins/:id/toggle-status',
  requirePermission('admin.update'),
  validate(idParamSchema, 'params'),
  AdminController.toggleStatus
)
router.post(
  '/admins/:id/assign-role',
  requirePermission('admin.update'),
  validateMultiple({ params: idParamSchema, body: assignRoleSchema }),
  AdminController.assignRole
)

export default router
