import { Router } from 'express'
import * as ProjectController from '@/controllers/project/Project.controller'

const router = Router()

// Projects - public read-only (published only)
router.get('/projects', ProjectController.listPublished)
router.get('/projects/:id', ProjectController.getById)
router.get('/projects/slug/:slug', ProjectController.getBySlug)

export default router
