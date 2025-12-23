import {
  createPermissionService,
  deletePermissionService,
  getPermissionByIdService,
  listPermissionsService,
  updatePermissionService,
} from '@/services/permission/Permission.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const { page, perPage, q } = req.query
    const data = await listPermissionsService({
      page: Number(page) || 1,
      perPage: Number(perPage) || 10,
      q: (q as string) || undefined,
    })
    return success(res, data, 'Permissions fetched')
  } catch (err) {
    next(err)
  }
}

export const get: RequestHandler = async (req, res, next) => {
  try {
    const data = await getPermissionByIdService(req.params.id as string)
    return success(res, data, 'Permission fetched')
  } catch (err) {
    next(err)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const data = await createPermissionService(req.body)
    return success(res, data, 'Permission created')
  } catch (err) {
    next(err)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const data = await updatePermissionService(req.params.id as string, req.body)
    return success(res, data, 'Permission updated')
  } catch (err) {
    next(err)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const data = await deletePermissionService(req.params.id as string)
    return success(res, data, 'Permission deleted')
  } catch (err) {
    next(err)
  }
}
