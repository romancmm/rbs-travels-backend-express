import * as MediaController from '@/controllers/media/Media.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate } from '@/middlewares/validation.middleware'
import {
  bulkAddTagsSchema,
  bulkCopyFilesSchema,
  bulkDeleteFilesSchema,
  bulkMoveFilesSchema,
  bulkRemoveTagsSchema,
  copyFileSchema,
  copyItemSchema,
  createFolderSchema,
  fileDetailsParamsSchema,
  mediaListQuerySchema,
  moveFileSchema,
  moveItemSchema,
  renameItemSchema,
  searchMediaSchema,
  updateFileSchema,
} from '@/validators/media.validator'
import { Router } from 'express'

const router = Router()

// ============================================================================
// MEDIA LISTING & STRUCTURE
// ============================================================================

router.get(
  '/',
  //   requirePermission('media.read'),
  validate(mediaListQuerySchema, 'query'),
  MediaController.list
)

router.get(
  '/structure',
  // requirePermission('media.read'),
  MediaController.getLibraryStructure
)

// ============================================================================
// SEARCH
// ============================================================================

router.get(
  '/search',
  requirePermission('media.read'),
  validate(searchMediaSchema, 'query'),
  MediaController.search
)

// ============================================================================
// FOLDER OPERATIONS
// ============================================================================

router.post(
  '/folder',
  requirePermission('media.create'),
  validate(createFolderSchema),
  MediaController.createFolder
)

// ============================================================================
// UNIFIED OPERATIONS (Files & Folders)
// ============================================================================

router.put(
  '/rename',
  requirePermission('media.update'),
  validate(renameItemSchema),
  MediaController.renameItem
)

router.put(
  '/move',
  requirePermission('media.update'),
  validate(moveItemSchema),
  MediaController.moveItem
)

router.put(
  '/copy',
  requirePermission('media.create'),
  validate(copyItemSchema),
  MediaController.copyItem
)

router.delete('/:id', requirePermission('media.delete'), MediaController.deleteItem)

// ============================================================================
// FILE OPERATIONS (Legacy - for backward compatibility)
// ============================================================================

router.get(
  '/file/:fileId',
  requirePermission('media.read'),
  validate(fileDetailsParamsSchema, 'params'),
  MediaController.getFileDetails
)

router.put(
  '/file/:fileId',
  requirePermission('media.update'),
  validate(updateFileSchema),
  MediaController.updateFile
)

router.put(
  '/file/:fileId/move',
  requirePermission('media.update'),
  validate(moveFileSchema),
  MediaController.moveFile
)

router.put(
  '/file/:fileId/copy',
  requirePermission('media.create'),
  validate(copyFileSchema),
  MediaController.copyFile
)

// ============================================================================
// BULK OPERATIONS
// ============================================================================

router.post(
  '/bulk/delete',
  requirePermission('media.delete'),
  validate(bulkDeleteFilesSchema),
  MediaController.bulkDeleteFiles
)

router.post(
  '/bulk/move',
  requirePermission('media.update'),
  validate(bulkMoveFilesSchema),
  MediaController.bulkMoveFiles
)

router.post(
  '/bulk/copy',
  requirePermission('media.create'),
  validate(bulkCopyFilesSchema),
  MediaController.bulkCopyFiles
)

router.post(
  '/bulk/tags/add',
  requirePermission('media.update'),
  validate(bulkAddTagsSchema),
  MediaController.bulkAddTags
)

router.post(
  '/bulk/tags/remove',
  requirePermission('media.update'),
  validate(bulkRemoveTagsSchema),
  MediaController.bulkRemoveTags
)

export default router
