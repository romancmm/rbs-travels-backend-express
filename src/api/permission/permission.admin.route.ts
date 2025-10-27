import * as Permission from '@/controllers/permission/Permission.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
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
  adminAuthMiddleware,
  requirePermission('permission.read'),
  validate(permissionQuerySchema, 'query'),
  Permission.list
)

router.get(
  '/:id',
  adminAuthMiddleware,
  requirePermission('permission.read'),
  validate(idParamSchema, 'params'),
  Permission.get
)

router.post(
  '/',
  adminAuthMiddleware,
  requirePermission('permission.create'),
  validate(createPermissionSchema),
  Permission.create
)
router.patch(
  '/:id',
  adminAuthMiddleware,
  requirePermission('permission.update'),
  validateMultiple({ params: idParamSchema, body: updatePermissionSchema }),
  Permission.update
)
router.delete(
  '/:id',
  adminAuthMiddleware,
  requirePermission('permission.delete'),
  validate(idParamSchema, 'params'),
  Permission.remove
)

export default router
