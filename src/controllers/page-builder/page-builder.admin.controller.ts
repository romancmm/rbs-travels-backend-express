import pageBuilderService from '@/services/page-builder/page-builder.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

/**
 * List all pages (admin - includes unpublished)
 */
export const listPages: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit, isPublished, search } = req.query

    const data = await pageBuilderService.getAllPages(
      page ? Number(page) : 1,
      limit ? Number(limit) : 10,
      {
        isPublished: isPublished === 'true' ? true : isPublished === 'false' ? false : undefined,
        search: search as string,
      }
    )

    return success(res, data, 'Pages fetched successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Get page by ID or slug (admin - includes unpublished)
 */
export const getPage: RequestHandler = async (req, res, next) => {
  try {
    const { identifier } = req.params

    if (!identifier) {
      const error = new Error('Page identifier is required') as any
      error.status = 400
      throw error
    }

    const data = await pageBuilderService.getPage(identifier)

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

/**
 * Create new page
 */
export const createPage: RequestHandler = async (req, res, next) => {
  try {
    const data = await pageBuilderService.createPage(req.body)
    res.status(201)
    return success(res, data, 'Page created successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Update page
 */
export const updatePage: RequestHandler = async (req, res, next) => {
  console.log('[req] :>> ', req.body)
  try {
    const { id } = req.params

    if (!id) {
      const error = new Error('Page ID is required') as any
      error.status = 400
      throw error
    }

    const data = await pageBuilderService.updatePage(id, req.body)
    return success(res, data, 'Page updated successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Delete page
 */
export const deletePage: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id) {
      const error = new Error('Page ID is required') as any
      error.status = 400
      throw error
    }

    await pageBuilderService.deletePage(id)
    return success(res, null, 'Page deleted successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Duplicate page
 */
export const duplicatePage: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params
    const { title, slug } = req.body

    if (!id) {
      const error = new Error('Page ID is required') as any
      error.status = 400
      throw error
    }

    const data = await pageBuilderService.duplicatePage(id, title, slug)
    res.status(201)
    return success(res, data, 'Page duplicated successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Update page content (JSON structure)
 * Used for updating sections, rows, columns, and components
 */
export const updateContent: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id) {
      const error = new Error('Page ID is required') as any
      error.status = 400
      throw error
    }

    const data = await pageBuilderService.updateContent(id, req.body.content)
    return success(res, data, 'Page content updated successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Publish page (save draft as published version)
 */
export const publishPage: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id) {
      const error = new Error('Page ID is required') as any
      error.status = 400
      throw error
    }

    const data = await pageBuilderService.publishPage(id)
    return success(res, data, 'Page published successfully')
  } catch (err) {
    next(err)
  }
}

/**
 * Unpublish page
 */
export const unpublishPage: RequestHandler = async (req, res, next) => {
  try {
    const { id } = req.params

    if (!id) {
      const error = new Error('Page ID is required') as any
      error.status = 400
      throw error
    }

    const data = await pageBuilderService.unpublishPage(id)
    return success(res, data, 'Page unpublished successfully')
  } catch (err) {
    next(err)
  }
}
