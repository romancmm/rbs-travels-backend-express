import * as Page from '@/controllers/page/Page.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import { idParamSchema } from '@/validators/common.validator'
import { createPageSchema, pageQuerySchema, updatePageSchema } from '@/validators/page.validator'
import { Router } from 'express'

const router = Router()

// Admin-protected page management routes
router.get('/', adminAuthMiddleware, validate(pageQuerySchema, 'query'), Page.list)
router.get('/:id', adminAuthMiddleware, validate(idParamSchema, 'params'), Page.get)
router.post('/', adminAuthMiddleware, validate(createPageSchema), Page.create)
router.patch(
  '/:id',
  adminAuthMiddleware,
  validateMultiple({ params: idParamSchema, body: updatePageSchema }),
  Page.update
)
router.delete('/:id', adminAuthMiddleware, validate(idParamSchema, 'params'), Page.remove)

export default router
