import pageBuilderService from '@/services/page-builder/page-builder.service'
import { error, success } from '@/utils/response'
import type { RequestHandler } from 'express'

/**
 * List published pages only
 */
export const listPages: RequestHandler = async (req, res) => {
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
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Get published page by ID or slug
 */
export const getPage: RequestHandler = async (req, res) => {
  try {
    const { identifier } = req.params

    if (!identifier) {
      return error(res, 'Page identifier is required', 400)
    }

    const data = await pageBuilderService.getPublishedPage(identifier) // Uses cache

    if (!data) {
      return error(res, 'Page not found', 404)
    }

    return success(res, data, 'Page fetched successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}
