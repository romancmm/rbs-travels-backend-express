import {
  createPermissionService,
  deletePermissionService,
  getPermissionByIdService,
  listPermissionsService,
  updatePermissionService,
} from '@/services/permission/Permission.service'
import { paginated, success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const { page, limit, q } = req.query
    const result = await listPermissionsService({
      page: Number(page) || 0,
      limit: Number(limit) || 10,
      q: (q as string) || undefined,
    })
    return paginated(res, result.items, result, 'Permissions fetched')
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
