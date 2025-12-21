import * as Permission from '@/controllers/permission/Permission.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import { idParamSchema } from '@/validators/common.validator'
import {
  createPermissionSchema,
  permissionQuerySchema,
  updatePermissionSchema,
} from '@/validators/rbac.validator'
import { Router } from 'express'

const router = Router()

// Admin routes protected by RBAC permissions
router.get(
  '/',
  requirePermission('permission.read'),
  validate(permissionQuerySchema, 'query'),
  Permission.list
)

router.get(
  '/:id',
  requirePermission('permission.read'),
  validate(idParamSchema, 'params'),
  Permission.get
)

router.post(
  '/',
  requirePermission('permission.create'),
  validate(createPermissionSchema),
  Permission.create
)
router.patch(
  '/:id',
  requirePermission('permission.update'),
  validateMultiple({ params: idParamSchema, body: updatePermissionSchema }),
  Permission.update
)
router.delete(
  '/:id',
  requirePermission('permission.delete'),
  validate(idParamSchema, 'params'),
  Permission.remove
)

export default router
