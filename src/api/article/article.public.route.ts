import * as CategoryController from '@/controllers/article/Category.controller'
import * as PostController from '@/controllers/article/Post.controller'
import { validate } from '@/middlewares/validation.middleware'
import { categoryQuerySchema, postQuerySchema } from '@/validators/article.validator'
import { idParamSchema, slugParamSchema } from '@/validators/common.validator'
import { Router } from 'express'

const router = Router()

// Posts - public read-only (published only)
router.get('/posts', validate(postQuerySchema, 'query'), PostController.listPublished)
router.get('/posts/:id', validate(idParamSchema, 'params'), PostController.getById)
router.get('/posts/slug/:slug', validate(slugParamSchema, 'params'), PostController.getBySlug)

// Categories - public read-only
router.get('/categories', validate(categoryQuerySchema, 'query'), CategoryController.list)
router.get('/categories/:id', validate(idParamSchema, 'params'), CategoryController.get)

export default router
