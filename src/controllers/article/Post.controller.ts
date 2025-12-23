import {
  createPostService,
  deletePostService,
  getPostByIdService,
  getPostBySlugService,
  listPostsService,
  updatePostService,
} from '@/services/article/Post.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res, next) => {
  try {
    // Query params are already validated and transformed by Zod middleware
    const data = await listPostsService(req.query)
    return success(res, data, 'Posts fetched')
  } catch (err) {
    next(err)
  }
}

// Public list - only show published posts
export const listPublished: RequestHandler = async (req, res, next) => {
  try {
    // Query params are already validated and transformed by Zod middleware
    // Override isPublished to always be true for public routes
    const data = await listPostsService({ ...req.query, isPublished: true })
    return success(res, data, 'Posts fetched')
  } catch (err) {
    next(err)
  }
}

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const data = await getPostByIdService(req.params.id as string)
    return success(res, data, 'Post fetched')
  } catch (err) {
    next(err)
  }
}

export const getBySlug: RequestHandler = async (req, res, next) => {
  try {
    const data = await getPostBySlugService(req.params.slug as string)
    return success(res, data, 'Post fetched')
  } catch (err) {
    next(err)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const data = await createPostService(req.body, req.user?.id as string)
    return success(res, data, 'Post created')
  } catch (err) {
    next(err)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const data = await updatePostService(req.params.id as string, req.body)
    return success(res, data, 'Post updated')
  } catch (err) {
    next(err)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const data = await deletePostService(req.params.id as string)
    return success(res, data, 'Post deleted')
  } catch (err) {
    next(err)
  }
}
