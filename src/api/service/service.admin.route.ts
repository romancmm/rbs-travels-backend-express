import { Router } from 'express'
import * as ServiceController from '@/controllers/service/Service.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'

const router = Router()

// All admin service routes require authentication
router.use(adminAuthMiddleware)

// Services - admin CRUD
router.get('/services', requirePermission('service.read'), ServiceController.list)
router.get('/services/:id', requirePermission('service.read'), ServiceController.getById)
router.post('/services', requirePermission('service.create'), ServiceController.create)
router.put('/services/:id', requirePermission('service.update'), ServiceController.update)
router.delete('/services/:id', requirePermission('service.delete'), ServiceController.remove)

export default router
