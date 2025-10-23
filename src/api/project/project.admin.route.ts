import { Router } from 'express'
import * as ProjectController from '@/controllers/project/Project.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'

const router = Router()

// All admin project routes require authentication
router.use(adminAuthMiddleware)

// Projects - admin CRUD
router.get('/projects', requirePermission('project.read'), ProjectController.list)
router.get('/projects/:id', requirePermission('project.read'), ProjectController.getById)
router.post('/projects', requirePermission('project.create'), ProjectController.create)
router.put('/projects/:id', requirePermission('project.update'), ProjectController.update)
router.delete('/projects/:id', requirePermission('project.delete'), ProjectController.remove)

export default router
