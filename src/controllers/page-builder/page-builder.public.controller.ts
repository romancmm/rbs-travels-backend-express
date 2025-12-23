import pageBuilderService from '@/services/page-builder/page-builder.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

/**
 * List published pages only
 */
export const listPages: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit, search } = req.query

    const data = await pageBuilderService.getAllPages(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      {
        isPublished: true, // Only published pages
        search: search as string,
      }
    )

    return success(res, data, 'Pages fetched successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Get published page by ID or slug
 */
export const getPage: RequestHandler = async (req, res, next) => {
  try {
    const { identifier } = req.params

    if (!identifier) {
      const error = new Error('Page identifier is required') as any
      error.status = 400
      throw error
    }

    const data = await pageBuilderService.getPublishedPage(identifier) // Uses cache

    if (!data) {
      const error = new Error('Page not found') as any
      error.status = 404
      throw error
    }

    return success(res, data, 'Page fetched successfully')
  } catch (err) {
    next(err)
  }
}
