import type { RequestHandler } from 'express'
import { success, error } from '@/utils/response'
import {
 listAdminsService,
 getAdminByIdService,
 createAdminService,
 updateAdminService,
 deleteAdminService,
 toggleAdminStatusService,
 assignRoleToAdminService,
} from '@/services/admin/Admin.service'

// Admin Users Management - handles admin/staff users only
// Note: Customers use separate Customer model/routes
// Future: Merchants, Vendors, Suppliers will have their own models/routes

export const list: RequestHandler = async (req, res) => {
 try {
  const result = await listAdminsService(req.query)
  return success(res, result, 'Admins fetched successfully')
 } catch (err: any) {
  return error(res, err.message, err.status || 500)
 }
}

export const getById: RequestHandler = async (req, res) => {
 try {
  const user = await getAdminByIdService(req.params.id as string)
  return success(res, user, 'Admin fetched successfully')
 } catch (err: any) {
  return error(res, err.message, err.status || 500)
 }
}

export const create: RequestHandler = async (req, res) => {
 try {
  const user = await createAdminService(req.body)
  return success(res, user, 'Admin created successfully')
 } catch (err: any) {
  return error(res, err.message, err.status || 500)
 }
}

export const update: RequestHandler = async (req, res) => {
 try {
  const user = await updateAdminService(req.params.id as string, req.body)
  return success(res, user, 'Admin updated successfully')
 } catch (err: any) {
  return error(res, err.message, err.status || 500)
 }
}

export const remove: RequestHandler = async (req, res) => {
 try {
  const result = await deleteAdminService(req.params.id as string)
  return success(res, result, 'Admin deleted successfully')
 } catch (err: any) {
  return error(res, err.message, err.status || 500)
 }
}

export const toggleStatus: RequestHandler = async (req, res) => {
 try {
  const user = await toggleAdminStatusService(req.params.id as string)
  return success(res, user, 'Admin status toggled successfully')
 } catch (err: any) {
  return error(res, err.message, err.status || 500)
 }
}

export const assignRole: RequestHandler = async (req, res) => {
 try {
  const { roleId } = req.body
  if (!roleId) {
   return error(res, 'roleId is required', 422)
  }
  const user = await assignRoleToAdminService(req.params.id as string, roleId)
  return success(res, user, 'Role assigned successfully')
 } catch (err: any) {
  return error(res, err.message, err.status || 500)
 }
}
