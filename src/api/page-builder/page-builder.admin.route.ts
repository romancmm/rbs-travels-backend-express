import * as PageBuilderController from '@/controllers/page-builder/page-builder.admin.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import {
  columnBodySchema,
  columnParamsSchema,
  componentBodySchema,
  componentParamsSchema,
  createPageBuilderBodySchema,
  duplicatePageBodySchema,
  identifierParamsSchema,
  listPageBuildersQuerySchema,
  pageIdParamsSchema,
  rowBodySchema,
  rowParamsSchema,
  sectionBodySchema,
  sectionParamsSchema,
  updatePageBuilderBodySchema,
} from '@/validators/page-builder.validator'
import { Router } from 'express'

const router = Router()

// All admin page builder routes require authentication
router.use(adminAuthMiddleware)

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

// Section Management
router.post(
  '/:pageId/sections',
  requirePermission('page.update'),
  validateMultiple({ params: pageIdParamsSchema, body: sectionBodySchema }),
  PageBuilderController.addSection
)

router.put(
  '/:pageId/sections/:sectionId',
  requirePermission('page.update'),
  validateMultiple({ params: sectionParamsSchema, body: sectionBodySchema }),
  PageBuilderController.updateSection
)

router.delete(
  '/:pageId/sections/:sectionId',
  requirePermission('page.delete'),
  validate(sectionParamsSchema, 'params'),
  PageBuilderController.deleteSection
)

// Row Management
router.post(
  '/:pageId/sections/:sectionId/rows',
  requirePermission('page.update'),
  validateMultiple({ params: sectionParamsSchema, body: rowBodySchema }),
  PageBuilderController.addRow
)

router.put(
  '/:pageId/sections/:sectionId/rows/:rowId',
  requirePermission('page.update'),
  validateMultiple({ params: rowParamsSchema, body: rowBodySchema }),
  PageBuilderController.updateRow
)

router.delete(
  '/:pageId/sections/:sectionId/rows/:rowId',
  requirePermission('page.delete'),
  validate(rowParamsSchema, 'params'),
  PageBuilderController.deleteRow
)

// Column Management
router.post(
  '/:pageId/sections/:sectionId/rows/:rowId/columns',
  requirePermission('page.update'),
  validateMultiple({ params: rowParamsSchema, body: columnBodySchema }),
  PageBuilderController.addColumn
)

router.put(
  '/:pageId/sections/:sectionId/rows/:rowId/columns/:columnId',
  requirePermission('page.update'),
  validateMultiple({ params: columnParamsSchema, body: columnBodySchema }),
  PageBuilderController.updateColumn
)

router.delete(
  '/:pageId/sections/:sectionId/rows/:rowId/columns/:columnId',
  requirePermission('page.delete'),
  validate(columnParamsSchema, 'params'),
  PageBuilderController.deleteColumn
)

// Component Management
router.post(
  '/:pageId/sections/:sectionId/rows/:rowId/columns/:columnId/components',
  requirePermission('page.update'),
  validateMultiple({ params: columnParamsSchema, body: componentBodySchema }),
  PageBuilderController.addComponent
)

router.put(
  '/:pageId/sections/:sectionId/rows/:rowId/columns/:columnId/components/:componentId',
  requirePermission('page.update'),
  validateMultiple({ params: componentParamsSchema, body: componentBodySchema }),
  PageBuilderController.updateComponent
)

router.delete(
  '/:pageId/sections/:sectionId/rows/:rowId/columns/:columnId/components/:componentId',
  requirePermission('page.delete'),
  validate(componentParamsSchema, 'params'),
  PageBuilderController.deleteComponent
)

export default router
