import * as PageBuilderController from '@/controllers/page-builder/page-builder.public.controller'
import { validate } from '@/middlewares/validation.middleware'
import {
  identifierParamsSchema,
  listPageBuildersQuerySchema,
} from '@/validators/page-builder.validator'
import { Router } from 'express'

const router = Router()

// Public page builder routes - only show published pages
router.get('/', validate(listPageBuildersQuerySchema, 'query'), PageBuilderController.listPages)

router.get(
  '/:identifier',
  validate(identifierParamsSchema, 'params'),
  PageBuilderController.getPage
)

export default router
