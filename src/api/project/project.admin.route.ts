import * as ProjectController from '@/controllers/project/Project.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import { idParamSchema } from '@/validators/common.validator'
import {
  createProjectSchema,
  projectQuerySchema,
  updateProjectSchema,
} from '@/validators/project.validator'
import { Router } from 'express'

const router = Router()

// All admin project routes require authentication
router.use(adminAuthMiddleware)

// Projects - admin CRUD
router.get(
  '/projects',
  requirePermission('project.read'),
  validate(projectQuerySchema, 'query'),
  ProjectController.list
)
router.get(
  '/projects/:id',
  requirePermission('project.read'),
  validate(idParamSchema, 'params'),
  ProjectController.getById
)
router.post(
  '/projects',
  requirePermission('project.create'),
  validate(createProjectSchema),
  ProjectController.create
)
router.put(
  '/projects/:id',
  requirePermission('project.update'),
  validateMultiple({ params: idParamSchema, body: updateProjectSchema }),
  ProjectController.update
)
router.delete(
  '/projects/:id',
  requirePermission('project.delete'),
  validate(idParamSchema, 'params'),
  ProjectController.remove
)

export default router
