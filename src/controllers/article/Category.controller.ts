import {
  createCategoryService,
  deleteCategoryService,
  getCategoryByIdService,
  listCategoriesService,
  updateCategoryService,
} from '@/services/article/Category.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const { page, perPage, q } = req.query
    const data = await listCategoriesService({
      page: Number(page) || 1,
      perPage: Number(perPage) || 10,
      q: (q as string) || undefined,
    })
    return success(res, data, 'Categories fetched')
  } catch (err) {
    next(err)
  }
}

export const get: RequestHandler = async (req, res, next) => {
  try {
    const data = await getCategoryByIdService(req.params.id as string)
    return success(res, data, 'Category fetched')
  } catch (err) {
    next(err)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const data = await createCategoryService(req.body)
    return success(res, data, 'Category created')
  } catch (err) {
    next(err)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const data = await updateCategoryService(req.params.id as string, req.body)
    return success(res, data, 'Category updated')
  } catch (err) {
    next(err)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const data = await deleteCategoryService(req.params.id as string)
    return success(res, data, 'Category deleted')
  } catch (err) {
    next(err)
  }
}
