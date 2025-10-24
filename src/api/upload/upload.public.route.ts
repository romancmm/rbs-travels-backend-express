import * as UploadController from '@/controllers/upload/Upload.controller'
import { Router } from 'express'

const router = Router()

// Return ImageKit auth parameters for client-side uploads
router.get('/auth', UploadController.getAuth)

export default router
