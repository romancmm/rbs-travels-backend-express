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
  copyFolderSchema,
  createFolderSchema,
  fileDetailsParamsSchema,
  mediaListQuerySchema,
  moveFileSchema,
  moveFolderSchema,
  renameFolderSchema,
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

router.put(
  '/folder/rename',
  requirePermission('media.update'),
  validate(renameFolderSchema),
  MediaController.renameFolder
)

router.put(
  '/folder/move',
  requirePermission('media.update'),
  validate(moveFolderSchema),
  MediaController.moveFolder
)

router.put(
  '/folder/copy',
  requirePermission('media.create'),
  validate(copyFolderSchema),
  MediaController.copyFolder
)

// ============================================================================
// FILE OPERATIONS
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
// UNIFIED DELETE - Handles both files and folders
// ============================================================================

router.delete('/:id', requirePermission('media.delete'), MediaController.deleteItem)

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
