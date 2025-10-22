import type { RequestHandler } from 'express'
import { success, error } from '@/utils/response'
import {
 listProjectsService,
 getProjectByIdService,
 getProjectBySlugService,
 createProjectService,
 updateProjectService,
 deleteProjectService,
} from '@/services/project/Project.service'

export const list: RequestHandler = async (req, res) => {
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
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

// Public list - only show published projects
export const listPublished: RequestHandler = async (req, res) => {
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
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const getById: RequestHandler = async (req, res) => {
 try {
  const data = await getProjectByIdService(req.params.id as string)
  return success(res, data, 'Project fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const getBySlug: RequestHandler = async (req, res) => {
 try {
  const data = await getProjectBySlugService(req.params.slug as string)
  return success(res, data, 'Project fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const create: RequestHandler = async (req, res) => {
 try {
  const data = await createProjectService(req.body)
  return success(res, data, 'Project created')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const update: RequestHandler = async (req, res) => {
 try {
  const data = await updateProjectService(req.params.id as string, req.body)
  return success(res, data, 'Project updated')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const remove: RequestHandler = async (req, res) => {
 try {
  const data = await deleteProjectService(req.params.id as string)
  return success(res, data, 'Project deleted')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}
