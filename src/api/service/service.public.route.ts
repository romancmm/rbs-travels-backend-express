import * as ServiceController from '@/controllers/service/Service.controller'
import { validate } from '@/middlewares/validation.middleware'
import { idParamSchema, slugParamSchema } from '@/validators/common.validator'
import { serviceQuerySchema } from '@/validators/service.validator'
import { Router } from 'express'

const router = Router()

// Services - public read-only (published only)
router.get('/services', validate(serviceQuerySchema, 'query'), ServiceController.listPublished)
router.get('/services/:id', validate(idParamSchema, 'params'), ServiceController.getById)
router.get('/services/slug/:slug', validate(slugParamSchema, 'params'), ServiceController.getBySlug)

export default router
