import {
  createCategoryService,
  deleteCategoryService,
  getCategoryByIdService,
  listCategoriesService,
  updateCategoryService,
} from '@/services/article/Category.service'
import { paginated, success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit, q } = req.query
    const result = await listCategoriesService({
      page: Number(page) || 1,
      limit: Number(limit) || 10,
      q: (q as string) || undefined,
    })
    return paginated(res, result.items, result, 'Categories fetched')
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
