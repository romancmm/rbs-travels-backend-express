import { Router } from 'express'
import * as Role from '@/controllers/role/Role.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'

const router = Router()

// Admin routes protected by RBAC permissions
router.get('/', adminAuthMiddleware, requirePermission('role.read'), Role.list)
router.get('/:id', adminAuthMiddleware, requirePermission('role.read'), Role.get)
router.post('/', adminAuthMiddleware, requirePermission('role.create'), Role.create)
router.patch('/:id', adminAuthMiddleware, requirePermission('role.update'), Role.update)
router.delete('/:id', adminAuthMiddleware, requirePermission('role.delete'), Role.remove)

export default router
