import { Router } from 'express'
import * as ServiceController from '@/controllers/service/Service.controller'

const router = Router()

// Services - public read-only (published only)
router.get('/services', ServiceController.listPublished)
router.get('/services/:id', ServiceController.getById)
router.get('/services/slug/:slug', ServiceController.getBySlug)

export default router
