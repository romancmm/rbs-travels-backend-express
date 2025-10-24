import * as UploadController from '@/controllers/upload/Upload.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { Router } from 'express'
import multer from 'multer'

const router = Router()

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } })

// Server-side upload to ImageKit (admin only)
router.post('/', requirePermission('media.create'), upload.single('file'), UploadController.upload)

export default router
