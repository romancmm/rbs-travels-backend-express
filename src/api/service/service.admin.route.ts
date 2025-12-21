import * as ServiceController from '@/controllers/service/Service.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import { idParamSchema } from '@/validators/common.validator'
import {
  createServiceSchema,
  serviceQuerySchema,
  updateServiceSchema,
} from '@/validators/service.validator'
import { Router } from 'express'

const router = Router()

// Services - admin CRUD
router.get(
  '/services',
  requirePermission('service.read'),
  validate(serviceQuerySchema, 'query'),
  ServiceController.list
)
router.get(
  '/services/:id',
  requirePermission('service.read'),
  validate(idParamSchema, 'params'),
  ServiceController.getById
)
router.post(
  '/services',
  requirePermission('service.create'),
  validate(createServiceSchema),
  ServiceController.create
)
router.put(
  '/services/:id',
  requirePermission('service.update'),
  validateMultiple({ params: idParamSchema, body: updateServiceSchema }),
  ServiceController.update
)
router.delete(
  '/services/:id',
  requirePermission('service.delete'),
  validate(idParamSchema, 'params'),
  ServiceController.remove
)

export default router
