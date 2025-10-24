import * as CategoryController from '@/controllers/blog/Category.controller'
import * as PostController from '@/controllers/blog/Post.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import {
  categoryQuerySchema,
  createCategorySchema,
  createPostSchema,
  postQuerySchema,
  updateCategorySchema,
  updatePostSchema,
} from '@/validators/blog.validator'
import { idParamSchema } from '@/validators/common.validator'
import { Router } from 'express'

const router = Router()

// All admin blog routes require authentication
router.use(adminAuthMiddleware)

// Posts - admin CRUD
router.get(
  '/posts',
  requirePermission('post.read'),
  validate(postQuerySchema, 'query'),
  PostController.list
)
router.get(
  '/posts/:id',
  requirePermission('post.read'),
  validate(idParamSchema, 'params'),
  PostController.getById
)
router.post(
  '/posts',
  requirePermission('post.create'),
  validate(createPostSchema),
  PostController.create
)
router.put(
  '/posts/:id',
  requirePermission('post.update'),
  validateMultiple({ params: idParamSchema, body: updatePostSchema }),
  PostController.update
)
router.delete(
  '/posts/:id',
  requirePermission('post.delete'),
  validate(idParamSchema, 'params'),
  PostController.remove
)

// Categories - admin CRUD
router.get(
  '/categories',
  requirePermission('category.read'),
  validate(categoryQuerySchema, 'query'),
  CategoryController.list
)
router.get(
  '/categories/:id',
  requirePermission('category.read'),
  validate(idParamSchema, 'params'),
  CategoryController.get
)
router.post(
  '/categories',
  requirePermission('category.create'),
  validate(createCategorySchema),
  CategoryController.create
)
router.put(
  '/categories/:id',
  requirePermission('category.update'),
  validateMultiple({ params: idParamSchema, body: updateCategorySchema }),
  CategoryController.update
)
router.delete(
  '/categories/:id',
  requirePermission('category.delete'),
  validate(idParamSchema, 'params'),
  CategoryController.remove
)

export default router
