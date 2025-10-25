import * as MediaController from '@/controllers/media/Media.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate } from '@/middlewares/validation.middleware'
import {
  createFolderSchema,
  deleteFileParamsSchema,
  deleteFolderQuerySchema,
  mediaListQuerySchema,
} from '@/validators/media.validator'
import { Router } from 'express'

const router = Router()

router.get(
  '/',
  //   requirePermission('media.read'),
  validate(mediaListQuerySchema, 'query'),
  MediaController.list
)
router.post(
  '/folder',
  requirePermission('media.create'),
  validate(createFolderSchema),
  MediaController.createFolder
)
router.delete(
  '/file/:fileId',
  requirePermission('media.delete'),
  validate(deleteFileParamsSchema, 'params'),
  MediaController.deleteFile
)
router.delete(
  '/folder',
  requirePermission('media.delete'),
  validate(deleteFolderQuerySchema, 'query'),
  MediaController.deleteFolder
)

export default router
