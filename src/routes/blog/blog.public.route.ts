import { Router } from 'express'
import * as PostController from '@/controllers/blog/Post.controller'
import * as CategoryController from '@/controllers/blog/Category.controller'

const router = Router()

// Posts - public read-only (published only)
router.get('/posts', PostController.listPublished)
router.get('/posts/:id', PostController.getById)
router.get('/posts/slug/:slug', PostController.getBySlug)

// Categories - public read-only
router.get('/categories', CategoryController.list)
router.get('/categories/:id', CategoryController.get)

export default router
