import {
  createPostService,
  deletePostService,
  getPostByIdService,
  getPostBySlugService,
  listPostsService,
  updatePostService,
} from '@/services/blog/Post.service'
import { error, success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res) => {
  try {
    const { page, perPage, categoryId, categorySlug, tag, authorId, isPublished, q } = req.query
    const data = await listPostsService({
      page: page ? Number(page) : undefined,
      perPage: perPage ? Number(perPage) : undefined,
      categoryId: categoryId as string,
      categorySlug: categorySlug as string,
      tag: tag as string,
      authorId: authorId as string,
      isPublished: typeof isPublished === 'string' ? isPublished === 'true' : undefined,
      q: q as string,
    })
    return success(res, data, 'Posts fetched')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

// Public list - only show published posts
export const listPublished: RequestHandler = async (req, res) => {
  try {
    const { page, perPage, categoryId, categorySlug, tag, authorId, q } = req.query
    const data = await listPostsService({
      page: page ? Number(page) : undefined,
      perPage: perPage ? Number(perPage) : undefined,
      categoryId: categoryId as string,
      categorySlug: categorySlug as string,
      tag: tag as string,
      authorId: authorId as string,
      isPublished: true, // Always filter for published on public routes
      q: q as string,
    })
    return success(res, data, 'Posts fetched')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

export const getById: RequestHandler = async (req, res) => {
  try {
    const data = await getPostByIdService(req.params.id as string)
    return success(res, data, 'Post fetched')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

export const getBySlug: RequestHandler = async (req, res) => {
  try {
    const data = await getPostBySlugService(req.params.slug as string)
    return success(res, data, 'Post fetched')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

export const create: RequestHandler = async (req, res) => {
  try {
    const data = await createPostService(req.body, req.user?.id as string)
    return success(res, data, 'Post created')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

export const update: RequestHandler = async (req, res) => {
  try {
    const data = await updatePostService(req.params.id as string, req.body)
    return success(res, data, 'Post updated')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

export const remove: RequestHandler = async (req, res) => {
  try {
    const data = await deletePostService(req.params.id as string)
    return success(res, data, 'Post deleted')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}
