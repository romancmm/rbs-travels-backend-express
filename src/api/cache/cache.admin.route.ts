import * as CacheController from '@/controllers/cache/Cache.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate } from '@/middlewares/validation.middleware'
import { cacheDeleteOneQuerySchema, cacheListQuerySchema } from '@/validators/cache.validator'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  requirePermission('admin.read'),
  validate(cacheListQuerySchema, 'query'),
  CacheController.list
)

router.delete(
  '/item',
  requirePermission('admin.delete'),
  validate(cacheDeleteOneQuerySchema, 'query'),
  CacheController.removeOne
)

router.delete('/all', requirePermission('admin.delete'), CacheController.clearAll)

export default router
