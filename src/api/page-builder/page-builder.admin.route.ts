import * as PageBuilderController from '@/controllers/page-builder/page-builder.admin.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import {
  createPageBuilderBodySchema,
  duplicatePageBodySchema,
  identifierParamsSchema,
  listPageBuildersQuerySchema,
  pageIdParamsSchema,
  updateContentBodySchema,
  updatePageBuilderBodySchema,
} from '@/validators/page-builder.validator'
import { Router } from 'express'

const router = Router()

// Page CRUD
router.get(
  '/',
  requirePermission('page.read'),
  validate(listPageBuildersQuerySchema, 'query'),
  PageBuilderController.listPages
)

router.get(
  '/:identifier',
  requirePermission('page.read'),
  validate(identifierParamsSchema, 'params'),
  PageBuilderController.getPage
)

router.post(
  '/',
  requirePermission('page.create'),
  validate(createPageBuilderBodySchema, 'body'),
  PageBuilderController.createPage
)

router.put(
  '/:id',
  requirePermission('page.update'),
  validateMultiple({ params: pageIdParamsSchema, body: updatePageBuilderBodySchema }),
  PageBuilderController.updatePage
)

router.delete(
  '/:id',
  requirePermission('page.delete'),
  validate(pageIdParamsSchema, 'params'),
  PageBuilderController.deletePage
)

router.post(
  '/:id/duplicate',
  requirePermission('page.create'),
  validateMultiple({ params: pageIdParamsSchema, body: duplicatePageBodySchema }),
  PageBuilderController.duplicatePage
)

// Content Management (JSON-based)
router.put(
  '/:id/content',
  requirePermission('page.update'),
  validateMultiple({ params: pageIdParamsSchema, body: updateContentBodySchema }),
  PageBuilderController.updateContent
)

// Publish/Unpublish
router.post(
  '/:id/publish',
  requirePermission('page.update'),
  validate(pageIdParamsSchema, 'params'),
  PageBuilderController.publishPage
)

router.post(
  '/:id/unpublish',
  requirePermission('page.update'),
  validate(pageIdParamsSchema, 'params'),
  PageBuilderController.unpublishPage
)

export default router
