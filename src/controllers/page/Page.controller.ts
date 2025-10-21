import type { RequestHandler } from 'express'
import { success, error } from '@/utils/response'
import {
 listPagesService,
 getPageByIdService,
 createPageService,
 updatePageService,
 deletePageService,
} from '@/services/page/Page.service'

export const list: RequestHandler = async (req, res) => {
 try {
  const { page, perPage, q, isPublished } = req.query
  const data = await listPagesService({
   page: Number(page) || 1,
   perPage: Number(perPage) || 10,
   q: (q as string) || undefined,
   isPublished: typeof isPublished === 'string' ? isPublished === 'true' : undefined,
  })
  return success(res, data, 'Pages fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const get: RequestHandler = async (req, res) => {
 try {
    const data = await getPageByIdService(req.params.id as string)
  return success(res, data, 'Page fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const create: RequestHandler = async (req, res) => {
 try {
  const data = await createPageService(req.body)
  return success(res, data, 'Page created')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const update: RequestHandler = async (req, res) => {
 try {
    const data = await updatePageService(req.params.id as string, req.body)
  return success(res, data, 'Page updated')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const remove: RequestHandler = async (req, res) => {
 try {
    const data = await deletePageService(req.params.id as string)
  return success(res, data, 'Page deleted')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}
