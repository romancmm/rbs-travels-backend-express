import { Router } from 'express'
import * as PostController from '@/controllers/blog/Post.controller'
import * as CategoryController from '@/controllers/blog/Category.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'

const router = Router()

// All admin blog routes require authentication
router.use(adminAuthMiddleware)

// Posts - admin CRUD
router.get('/posts', requirePermission('post.read'), PostController.list)
router.get('/posts/:id', requirePermission('post.read'), PostController.getById)
router.post('/posts', requirePermission('post.create'), PostController.create)
router.put('/posts/:id', requirePermission('post.update'), PostController.update)
router.delete('/posts/:id', requirePermission('post.delete'), PostController.remove)

// Categories - admin CRUD
router.get('/categories', requirePermission('category.read'), CategoryController.list)
router.get('/categories/:id', requirePermission('category.read'), CategoryController.get)
router.post('/categories', requirePermission('category.create'), CategoryController.create)
router.put('/categories/:id', requirePermission('category.update'), CategoryController.update)
router.delete('/categories/:id', requirePermission('category.delete'), CategoryController.remove)

export default router
