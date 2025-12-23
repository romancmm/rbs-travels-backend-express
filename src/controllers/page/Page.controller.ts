import {
  createPageService,
  deletePageService,
  getPageByIdService,
  listPagesService,
  updatePageService,
} from '@/services/page/Page.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const { page, perPage, q, isPublished } = req.query
    const data = await listPagesService({
      page: Number(page) || 1,
      perPage: Number(perPage) || 10,
      q: (q as string) || undefined,
      isPublished: typeof isPublished === 'string' ? isPublished === 'true' : undefined,
    })
    return success(res, data, 'Pages fetched')
  } catch (err) {
    next(err)
  }
}

export const get: RequestHandler = async (req, res, next) => {
  try {
    const data = await getPageByIdService(req.params.id as string)
    return success(res, data, 'Page fetched')
  } catch (err) {
    next(err)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const data = await createPageService(req.body)
    return success(res, data, 'Page created')
  } catch (err) {
    next(err)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const data = await updatePageService(req.params.id as string, req.body)
    return success(res, data, 'Page updated')
  } catch (err) {
    next(err)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const data = await deletePageService(req.params.id as string)
    return success(res, data, 'Page deleted')
  } catch (err) {
    next(err)
  }
}
