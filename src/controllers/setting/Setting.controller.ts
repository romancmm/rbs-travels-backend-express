import type { RequestHandler } from 'express'
import { success, error } from '@/utils/response'
import {
 listSettingsService,
 getSettingByIdService,
 getSettingByKeyService,
 getSettingsByKeysService,
 getSettingsByGroupService,
 getPublicSettingsService,
 createSettingService,
 updateSettingService,
 updateSettingByKeyService,
 deleteSettingService,
 bulkUpdateSettingsService,
} from '@/services/setting/Setting.service'

export const list: RequestHandler = async (req, res) => {
 try {
  const { page, perPage, q, group, isPublic } = req.query
  const data = await listSettingsService({
   page: page ? Number(page) : undefined,
   perPage: perPage ? Number(perPage) : undefined,
   q: q as string,
   group: group as string,
   isPublic: typeof isPublic === 'string' ? isPublic === 'true' : undefined,
  })
  return success(res, data, 'Settings fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const getById: RequestHandler = async (req, res) => {
 try {
  const data = await getSettingByIdService(req.params.id as string)
  return success(res, data, 'Setting fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const getByKey: RequestHandler = async (req, res) => {
 try {
  const data = await getSettingByKeyService(req.params.key as string)
  return success(res, data, 'Setting fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const getByKeys: RequestHandler = async (req, res) => {
 try {
  const keys = req.body.keys || []
  if (!Array.isArray(keys)) {
   return error(res, 'keys must be an array', 422)
  }
  const data = await getSettingsByKeysService(keys)
  return success(res, data, 'Settings fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const getByGroup: RequestHandler = async (req, res) => {
 try {
  const data = await getSettingsByGroupService(req.params.group as string)
  return success(res, data, 'Settings fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const getPublic: RequestHandler = async (req, res) => {
 try {
  const data = await getPublicSettingsService()
  return success(res, data, 'Public settings fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const create: RequestHandler = async (req, res) => {
 try {
  const data = await createSettingService(req.body)
  return success(res, data, 'Setting created')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const update: RequestHandler = async (req, res) => {
 try {
  const data = await updateSettingService(req.params.id as string, req.body)
  return success(res, data, 'Setting updated')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const updateByKey: RequestHandler = async (req, res) => {
 try {
  const { value } = req.body
  if (value === undefined) {
   return error(res, 'value is required', 422)
  }
  const data = await updateSettingByKeyService(req.params.key as string, value)
  return success(res, data, 'Setting updated')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const remove: RequestHandler = async (req, res) => {
 try {
  const data = await deleteSettingService(req.params.id as string)
  return success(res, data, 'Setting deleted')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const bulkUpdate: RequestHandler = async (req, res) => {
 try {
  const { settings } = req.body
  if (!Array.isArray(settings)) {
   return error(res, 'settings must be an array', 422)
  }
  const data = await bulkUpdateSettingsService(settings)
  return success(res, data, 'Settings updated')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}
