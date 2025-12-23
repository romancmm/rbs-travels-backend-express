import {
  createProjectService,
  deleteProjectService,
  getProjectByIdService,
  getProjectBySlugService,
  listProjectsService,
  updateProjectService,
} from '@/services/project/Project.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const { page, perPage, q, category, tag, isPublished, isFeatured } = req.query
    const data = await listProjectsService({
      page: page ? Number(page) : undefined,
      perPage: perPage ? Number(perPage) : undefined,
      q: q as string,
      category: category as string,
      tag: tag as string,
      isPublished: typeof isPublished === 'string' ? isPublished === 'true' : undefined,
      isFeatured: typeof isFeatured === 'string' ? isFeatured === 'true' : undefined,
    })
    return success(res, data, 'Projects fetched')
  } catch (err) {
    next(err)
  }
}

// Public list - only show published projects
export const listPublished: RequestHandler = async (req, res, next) => {
  try {
    const { page, perPage, q, category, tag, isFeatured } = req.query
    const data = await listProjectsService({
      page: page ? Number(page) : undefined,
      perPage: perPage ? Number(perPage) : undefined,
      q: q as string,
      category: category as string,
      tag: tag as string,
      isPublished: true, // Always filter for published on public routes
      isFeatured: typeof isFeatured === 'string' ? isFeatured === 'true' : undefined,
    })
    return success(res, data, 'Projects fetched')
  } catch (err) {
    next(err)
  }
}

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const data = await getProjectByIdService(req.params.id as string)
    return success(res, data, 'Project fetched')
  } catch (err) {
    next(err)
  }
}

export const getBySlug: RequestHandler = async (req, res, next) => {
  try {
    const data = await getProjectBySlugService(req.params.slug as string)
    return success(res, data, 'Project fetched')
  } catch (err) {
    next(err)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const data = await createProjectService(req.body)
    return success(res, data, 'Project created')
  } catch (err) {
    next(err)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const data = await updateProjectService(req.params.id as string, req.body)
    return success(res, data, 'Project updated')
  } catch (err) {
    next(err)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const data = await deleteProjectService(req.params.id as string)
    return success(res, data, 'Project deleted')
  } catch (err) {
    next(err)
  }
}
