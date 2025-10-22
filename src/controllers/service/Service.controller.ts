import type { RequestHandler } from 'express'
import { success, error } from '@/utils/response'
import {
 listServicesService,
 getServiceByIdService,
 getServiceBySlugService,
 createServiceService,
 updateServiceService,
 deleteServiceService,
} from '@/services/service/Service.service'

export const list: RequestHandler = async (req, res) => {
 try {
  const { page, perPage, q, isPublished } = req.query
  const data = await listServicesService({
   page: page ? Number(page) : undefined,
   perPage: perPage ? Number(perPage) : undefined,
   q: q as string,
   isPublished: typeof isPublished === 'string' ? isPublished === 'true' : undefined,
  })
  return success(res, data, 'Services fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

// Public list - only show published services
export const listPublished: RequestHandler = async (req, res) => {
 try {
  const { page, perPage, q } = req.query
  const data = await listServicesService({
   page: page ? Number(page) : undefined,
   perPage: perPage ? Number(perPage) : undefined,
   q: q as string,
   isPublished: true, // Always filter for published on public routes
  })
  return success(res, data, 'Services fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const getById: RequestHandler = async (req, res) => {
 try {
  const data = await getServiceByIdService(req.params.id as string)
  return success(res, data, 'Service fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const getBySlug: RequestHandler = async (req, res) => {
 try {
  const data = await getServiceBySlugService(req.params.slug as string)
  return success(res, data, 'Service fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const create: RequestHandler = async (req, res) => {
 try {
  const data = await createServiceService(req.body)
  return success(res, data, 'Service created')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const update: RequestHandler = async (req, res) => {
 try {
  const data = await updateServiceService(req.params.id as string, req.body)
  return success(res, data, 'Service updated')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const remove: RequestHandler = async (req, res) => {
 try {
  const data = await deleteServiceService(req.params.id as string)
  return success(res, data, 'Service deleted')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}
