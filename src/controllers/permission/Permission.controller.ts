import type { RequestHandler } from 'express'
import { success, error } from '@/utils/response'
import {
 listPermissionsService,
 getPermissionByIdService,
 createPermissionService,
 updatePermissionService,
 deletePermissionService,
} from '@/services/permission/Permission.service'

export const list: RequestHandler = async (req, res) => {
 try {
  const { page, perPage, q } = req.query
  const data = await listPermissionsService({
   page: Number(page) || 1,
   perPage: Number(perPage) || 10,
   q: (q as string) || undefined,
  })
  return success(res, data, 'Permissions fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const get: RequestHandler = async (req, res) => {
 try {
  const data = await getPermissionByIdService(req.params.id as string)
  return success(res, data, 'Permission fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const create: RequestHandler = async (req, res) => {
 try {
  const data = await createPermissionService(req.body)
  return success(res, data, 'Permission created')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const update: RequestHandler = async (req, res) => {
 try {
  const data = await updatePermissionService(req.params.id as string, req.body)
  return success(res, data, 'Permission updated')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const remove: RequestHandler = async (req, res) => {
 try {
  const data = await deletePermissionService(req.params.id as string)
  return success(res, data, 'Permission deleted')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}
