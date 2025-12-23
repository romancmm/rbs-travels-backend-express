import {
  assignRolesToAdminService,
  createAdminService,
  deleteAdminService,
  getAdminByIdService,
  listAdminsService,
  toggleAdminStatusService,
  updateAdminService,
} from '@/services/admin/Admin.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

// Admin Users Management - handles admin/staff users only
// Note: Customers use separate Customer model/routes
// Future: Merchants, Vendors, Suppliers will have their own models/routes

export const list: RequestHandler = async (req, res, next) => {
  try {
    const result = await listAdminsService(req.query)
    return success(res, result, 'Admins fetched successfully')
  } catch (err) {
    next(err)
  }
}

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const user = await getAdminByIdService(req.params.id as string)
    return success(res, user, 'Admin fetched successfully')
  } catch (err) {
    next(err)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const user = await createAdminService(req.body)
    return success(res, user, 'Admin created successfully')
  } catch (err) {
    next(err)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const user = await updateAdminService(req.params.id as string, req.body)
    return success(res, user, 'Admin updated successfully')
  } catch (err) {
    next(err)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const result = await deleteAdminService(req.params.id as string)
    return success(res, result, 'Admin deleted successfully')
  } catch (err) {
    next(err)
  }
}

export const toggleStatus: RequestHandler = async (req, res, next) => {
  try {
    const user = await toggleAdminStatusService(req.params.id as string)
    return success(res, user, 'Admin status toggled successfully')
  } catch (err) {
    next(err)
  }
}

export const assignRole: RequestHandler = async (req, res, next) => {
  try {
    const { roleIds } = req.body
    if (!roleIds || !Array.isArray(roleIds) || roleIds.length === 0) {
      const error = new Error('roleIds array is required') as any
      error.status = 422
      throw error
    }
    const user = await assignRolesToAdminService(req.params.id as string, roleIds)
    return success(res, user, 'Roles assigned successfully')
  } catch (err) {
    next(err)
  }
}
