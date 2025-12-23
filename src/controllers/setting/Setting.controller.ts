import {
  bulkUpdateSettingsService,
  createSettingService,
  deleteSettingService,
  getPublicSettingsService,
  getSettingByIdService,
  getSettingByKeyService,
  getSettingsByGroupService,
  getSettingsByKeysService,
  listSettingsService,
  updateSettingByKeyService,
  updateSettingService,
} from '@/services/setting/Setting.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res, next) => {
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
  } catch (err) {
    next(err)
  }
}

export const getById: RequestHandler = async (req, res, next) => {
  try {
    const data = await getSettingByIdService(req.params.id as string)
    return success(res, data, 'Setting fetched')
  } catch (err) {
    next(err)
  }
}

export const getByKey: RequestHandler = async (req, res, next) => {
  try {
    const data = await getSettingByKeyService(req.params.key as string)
    return success(res, data, 'Setting fetched')
  } catch (err) {
    next(err)
  }
}

export const getByKeys: RequestHandler = async (req, res, next) => {
  try {
    const keys = req.body.keys || []
    if (!Array.isArray(keys)) {
      const error = new Error('keys must be an array') as any
      error.status = 422
      throw error
    }
    const data = await getSettingsByKeysService(keys)
    return success(res, data, 'Settings fetched')
  } catch (err) {
    next(err)
  }
}

export const getByGroup: RequestHandler = async (req, res, next) => {
  try {
    const data = await getSettingsByGroupService(req.params.group as string)
    return success(res, data, 'Settings fetched')
  } catch (err) {
    next(err)
  }
}

export const getPublic: RequestHandler = async (req, res, next) => {
  try {
    const data = await getPublicSettingsService()
    return success(res, data, 'Public settings fetched')
  } catch (err) {
    next(err)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const data = await createSettingService(req.body)
    return success(res, data, 'Setting created')
  } catch (err) {
    next(err)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const data = await updateSettingService(req.params.id as string, req.body)
    return success(res, data, 'Setting updated')
  } catch (err) {
    next(err)
  }
}

export const updateByKey: RequestHandler = async (req, res, next) => {
  try {
    const { value } = req.body
    if (value === undefined) {
      const error = new Error('value is required') as any
      error.status = 422
      throw error
    }
    const data = await updateSettingByKeyService(req.params.key as string, value)
    return success(res, data, 'Setting updated')
  } catch (err) {
    next(err)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const data = await deleteSettingService(req.params.id as string)
    return success(res, data, 'Setting deleted')
  } catch (err) {
    next(err)
  }
}

export const bulkUpdate: RequestHandler = async (req, res, next) => {
  try {
    const { settings } = req.body
    if (!Array.isArray(settings)) {
      const error = new Error('settings must be an array') as any
      error.status = 422
      throw error
    }
    const data = await bulkUpdateSettingsService(settings)
    return success(res, data, 'Settings updated')
  } catch (err) {
    next(err)
  }
}
