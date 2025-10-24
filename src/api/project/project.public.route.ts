import * as ProjectController from '@/controllers/project/Project.controller'
import { validate } from '@/middlewares/validation.middleware'
import { idParamSchema, slugParamSchema } from '@/validators/common.validator'
import { projectQuerySchema } from '@/validators/project.validator'
import { Router } from 'express'

const router = Router()

// Projects - public read-only (published only)
router.get('/projects', validate(projectQuerySchema, 'query'), ProjectController.listPublished)
router.get('/projects/:id', validate(idParamSchema, 'params'), ProjectController.getById)
router.get('/projects/slug/:slug', validate(slugParamSchema, 'params'), ProjectController.getBySlug)

export default router
