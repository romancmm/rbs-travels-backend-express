import * as UploadController from '@/controllers/upload/Upload.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate } from '@/middlewares/validation.middleware'
import { uploadMediaSchema } from '@/validators/media.validator'
import { Router } from 'express'
import multer from 'multer'

const router = Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

/**
 * Custom middleware to handle both single file and multiple files
 * Tries 'file' field first (single), then 'files[]' field (multiple)
 */
const uploadFlexible = (req: any, res: any, next: any) => {
  const multiUpload = upload.fields([
    { name: 'file', maxCount: 1 },
    { name: 'files[]', maxCount: 20 },
  ])

  multiUpload(req, res, (err: any) => {
    if (err) return next(err)

    // Normalize the file/files structure
    if (req.files) {
      if (req.files['file'] && req.files['file'].length > 0) {
        req.file = req.files['file'][0]
      } else if (req.files['files[]'] && req.files['files[]'].length > 0) {
        req.files = req.files['files[]']
      }
    }

    next()
  })
}

// Server-side upload to ImageKit (admin only)
// Supports both single file (field: 'file') and multiple files (field: 'files[]')
router.post(
  '/',
  requirePermission('media.create'),
  uploadFlexible,
  validate(uploadMediaSchema, 'body'),
  UploadController.upload
)

export default router
