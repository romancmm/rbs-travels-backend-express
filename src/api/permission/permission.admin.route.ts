import { Router } from 'express'
import * as Permission from '@/controllers/permission/Permission.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'

const router = Router()

// Admin routes protected by RBAC permissions
router.get('/', adminAuthMiddleware, requirePermission('permission.read'), Permission.list)
router.get('/:id', adminAuthMiddleware, requirePermission('permission.read'), Permission.get)
router.post('/', adminAuthMiddleware, requirePermission('permission.create'), Permission.create)
router.patch('/:id', adminAuthMiddleware, requirePermission('permission.update'), Permission.update)
router.delete('/:id', adminAuthMiddleware, requirePermission('permission.delete'), Permission.remove)

export default router
