import * as MediaController from '@/controllers/media/Media.controller'
import { validate } from '@/middlewares/validation.middleware'
import { mediaListQuerySchema } from '@/validators/media.validator'
import { Router } from 'express'

const router = Router()

// Get files by folder path (public access)
router.get('/', validate(mediaListQuerySchema, 'query'), MediaController.list)

// Get library structure (public access)
router.get('/structure', MediaController.getLibraryStructure)

export default router
