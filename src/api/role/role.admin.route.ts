import * as Role from '@/controllers/role/Role.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import { idParamSchema } from '@/validators/common.validator'
import { createRoleSchema, roleQuerySchema, updateRoleSchema } from '@/validators/rbac.validator'
import { Router } from 'express'

const router = Router()

// Admin routes protected by RBAC permissions
router.get('/', requirePermission('role.read'), validate(roleQuerySchema, 'query'), Role.list)
router.get('/:id', requirePermission('role.read'), validate(idParamSchema, 'params'), Role.get)
router.post('/', requirePermission('role.create'), validate(createRoleSchema), Role.create)
router.patch(
  '/:id',
  requirePermission('role.update'),
  validateMultiple({ params: idParamSchema, body: updateRoleSchema }),
  Role.update
)
router.delete(
  '/:id',
  requirePermission('role.delete'),
  validate(idParamSchema, 'params'),
  Role.remove
)

export default router
