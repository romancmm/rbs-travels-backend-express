import * as Page from '@/controllers/page/Page.controller'
import { validate } from '@/middlewares/validation.middleware'
import { idParamSchema } from '@/validators/common.validator'
import { pageQuerySchema } from '@/validators/page.validator'
import { Router } from 'express'

const router = Router()

// Public read-only routes (no auth)
router.get('/', validate(pageQuerySchema, 'query'), Page.list)
router.get('/:id', validate(idParamSchema, 'params'), Page.get)

export default router
