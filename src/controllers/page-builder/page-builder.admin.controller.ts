import pageBuilderService from '@/services/page-builder/page-builder.service'
import { error, success } from '@/utils/response'
import type { RequestHandler } from 'express'

/**
 * List all pages (admin - includes unpublished)
 */
export const listPages: RequestHandler = async (req, res) => {
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
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Get page by ID or slug (admin - includes unpublished)
 */
export const getPage: RequestHandler = async (req, res) => {
  try {
    const { identifier } = req.params

    if (!identifier) {
      return error(res, 'Page identifier is required', 400)
    }

    const data = await pageBuilderService.getPage(identifier, true)

    if (!data) {
      return error(res, 'Page not found', 404)
    }

    return success(res, data, 'Page fetched successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Create new page
 */
export const createPage: RequestHandler = async (req, res) => {
  try {
    const data = await pageBuilderService.createPage(req.body)
    res.status(201)
    return success(res, data, 'Page created successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Update page
 */
export const updatePage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return error(res, 'Page ID is required', 400)
    }

    const data = await pageBuilderService.updatePage(id, req.body)
    return success(res, data, 'Page updated successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Delete page
 */
export const deletePage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params

    if (!id) {
      return error(res, 'Page ID is required', 400)
    }

    await pageBuilderService.deletePage(id)
    return success(res, null, 'Page deleted successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Duplicate page
 */
export const duplicatePage: RequestHandler = async (req, res) => {
  try {
    const { id } = req.params
    const { title, slug } = req.body

    if (!id) {
      return error(res, 'Page ID is required', 400)
    }

    const data = await pageBuilderService.duplicatePage(id, title, slug)
    res.status(201)
    return success(res, data, 'Page duplicated successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Add section to page
 */
export const addSection: RequestHandler = async (req, res) => {
  try {
    const { pageId } = req.params

    if (!pageId) {
      return error(res, 'Page ID is required', 400)
    }

    const data = await pageBuilderService.addSection(pageId, req.body)
    res.status(201)
    return success(res, data, 'Section added successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Update section
 */
export const updateSection: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId } = req.params

    if (!pageId || !sectionId) {
      return error(res, 'Page ID and Section ID are required', 400)
    }

    const data = await pageBuilderService.updateSection(pageId, sectionId, req.body)
    return success(res, data, 'Section updated successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Delete section
 */
export const deleteSection: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId } = req.params

    if (!pageId || !sectionId) {
      return error(res, 'Page ID and Section ID are required', 400)
    }

    await pageBuilderService.deleteSection(pageId, sectionId)
    return success(res, null, 'Section deleted successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Add row to section
 */
export const addRow: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId } = req.params

    if (!pageId || !sectionId) {
      return error(res, 'Page ID and Section ID are required', 400)
    }

    const data = await pageBuilderService.addRow(pageId, sectionId, req.body)
    res.status(201)
    return success(res, data, 'Row added successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Update row
 */
export const updateRow: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId, rowId } = req.params

    if (!pageId || !sectionId || !rowId) {
      return error(res, 'Page ID, Section ID, and Row ID are required', 400)
    }

    const data = await pageBuilderService.updateRow(pageId, sectionId, rowId, req.body)
    return success(res, data, 'Row updated successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Delete row
 */
export const deleteRow: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId, rowId } = req.params

    if (!pageId || !sectionId || !rowId) {
      return error(res, 'Page ID, Section ID, and Row ID are required', 400)
    }

    await pageBuilderService.deleteRow(pageId, sectionId, rowId)
    return success(res, null, 'Row deleted successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Add column to row
 */
export const addColumn: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId, rowId } = req.params

    if (!pageId || !sectionId || !rowId) {
      return error(res, 'Page ID, Section ID, and Row ID are required', 400)
    }

    const data = await pageBuilderService.addColumn(pageId, sectionId, rowId, req.body)
    res.status(201)
    return success(res, data, 'Column added successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Update column
 */
export const updateColumn: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId, rowId, columnId } = req.params

    if (!pageId || !sectionId || !rowId || !columnId) {
      return error(res, 'All IDs are required', 400)
    }

    const data = await pageBuilderService.updateColumn(pageId, sectionId, rowId, columnId, req.body)
    return success(res, data, 'Column updated successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Delete column
 */
export const deleteColumn: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId, rowId, columnId } = req.params

    if (!pageId || !sectionId || !rowId || !columnId) {
      return error(res, 'All IDs are required', 400)
    }

    await pageBuilderService.deleteColumn(pageId, sectionId, rowId, columnId)
    return success(res, null, 'Column deleted successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Add component to column
 */
export const addComponent: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId, rowId, columnId } = req.params

    if (!pageId || !sectionId || !rowId || !columnId) {
      return error(res, 'All IDs are required', 400)
    }

    const data = await pageBuilderService.addComponent(pageId, sectionId, rowId, columnId, req.body)
    res.status(201)
    return success(res, data, 'Component added successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Update component
 */
export const updateComponent: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId, rowId, columnId, componentId } = req.params

    if (!pageId || !sectionId || !rowId || !columnId || !componentId) {
      return error(res, 'All IDs are required', 400)
    }

    const data = await pageBuilderService.updateComponent(
      pageId,
      sectionId,
      rowId,
      columnId,
      componentId,
      req.body
    )
    return success(res, data, 'Component updated successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

/**
 * Delete component
 */
export const deleteComponent: RequestHandler = async (req, res) => {
  try {
    const { pageId, sectionId, rowId, columnId, componentId } = req.params

    if (!pageId || !sectionId || !rowId || !columnId || !componentId) {
      return error(res, 'All IDs are required', 400)
    }

    await pageBuilderService.deleteComponent(pageId, sectionId, rowId, columnId, componentId)
    return success(res, null, 'Component deleted successfully')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}
