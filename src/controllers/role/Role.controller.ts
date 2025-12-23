import {
  createRoleService,
  deleteRoleService,
  getRoleByIdService,
  listRolesService,
  updateRoleService,
} from '@/services/role/Role.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const { page, perPage, q } = req.query
    const data = await listRolesService({
      page: Number(page) || 1,
      perPage: Number(perPage) || 10,
      q: (q as string) || undefined,
    })
    return success(res, data, 'Roles fetched')
  } catch (err) {
    next(err)
  }
}

export const get: RequestHandler = async (req, res, next) => {
  try {
    const data = await getRoleByIdService(req.params.id as string)
    return success(res, data, 'Role fetched')
  } catch (err) {
    next(err)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const data = await createRoleService(req.body)
    return success(res, data, 'Role created')
  } catch (err) {
    next(err)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const data = await updateRoleService(req.params.id as string, req.body)
    return success(res, data, 'Role updated')
  } catch (err) {
    next(err)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const data = await deleteRoleService(req.params.id as string)
    return success(res, data, 'Role deleted')
  } catch (err) {
    next(err)
  }
}
