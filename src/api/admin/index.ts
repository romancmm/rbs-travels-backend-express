import { Router } from 'express'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'
import * as AdminController from '@/controllers/admin/Admin.controller'

const router = Router()

// All admin user routes require authentication
router.use(adminAuthMiddleware)

// Admin Users Management - CRUD for admin/staff users only
router.get('/admins', requirePermission('admin.read'), AdminController.list)
router.get(
 '/admins/:id',
 requirePermission('admin.read'),
 AdminController.getById,
)
router.post(
 '/admins',
 requirePermission('admin.create'),
 AdminController.create,
)
router.put(
 '/admins/:id',
 requirePermission('admin.update'),
 AdminController.update,
)
router.delete(
 '/admins/:id',
 requirePermission('admin.delete'),
 AdminController.remove,
)
router.patch(
 '/admins/:id/toggle-status',
 requirePermission('admin.update'),
 AdminController.toggleStatus,
)
router.post(
 '/admins/:id/assign-role',
 requirePermission('admin.update'),
 AdminController.assignRole,
)

export default router
