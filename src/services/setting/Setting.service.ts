import CacheService from '@/services/cache.service'
import { createError, ErrorMessages } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import type {
  CreateSettingInput,
  SettingQueryParams,
  UpdateSettingInput,
} from '@/validators/setting.validator'
import { Prisma } from '@prisma/client'

export const listSettingsService = async (params: SettingQueryParams = {}) => {
  const { page = 1, perPage = 50, q, group, isPublic } = params
  const { skip, take } = paginate(page, perPage)
  const where: any = {}

  if (typeof isPublic === 'boolean') where.isPublic = isPublic
  if (group) where.group = group
  if (q) {
    where.OR = [
      { key: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.setting.findMany({
      where,
      skip,
      take,
      orderBy: { key: 'asc' },
    }),
    prisma.setting.count({ where }),
  ])
  return { items, page, perPage, total }
}

export const getSettingByKeyService = async (key: string) => {
  const setting = await prisma.setting.findUnique({ where: { key } })
  if (!setting) throw createError(ErrorMessages.NOT_FOUND('Setting'), 404, 'NOT_FOUND')
  return setting
}

export const getSettingByIdService = async (id: string) => {
  const setting = await prisma.setting.findUnique({ where: { id } })
  if (!setting) throw createError(ErrorMessages.NOT_FOUND('Setting'), 404, 'NOT_FOUND')
  return setting
}

// Get multiple settings by keys (useful for frontend)
export const getSettingsByKeysService = async (keys: string[]) => {
  const settings = await prisma.setting.findMany({
    where: { key: { in: keys } },
  })
  // Return as key-value object
  return settings.reduce((acc: any, setting: any) => {
    acc[setting.key] = setting.value
    return acc
  }, {})
}

// Get all settings in a group
export const getSettingsByGroupService = async (group: string) => {
  const settings = await prisma.setting.findMany({
    where: { group },
    orderBy: { key: 'asc' },
  })
  return settings
}

// Get public settings (for frontend without auth)
export const getPublicSettingsService = async () => {
  const settings = await prisma.setting.findMany({
    where: { isPublic: true },
    select: { key: true, value: true, group: true },
  })
  // Return as key-value object grouped by group
  return settings.reduce((acc: any, setting: any) => {
    if (!acc[setting.group || 'general']) {
      acc[setting.group || 'general'] = {}
    }
    acc[setting.group || 'general'][setting.key] = setting.value
    return acc
  }, {})
}

export const createSettingService = async (data: CreateSettingInput) => {
  const payload: any = { ...data }
  if (payload.value === null) payload.value = Prisma.JsonNull
  const setting = await prisma.setting.create({ data: payload })

  // Invalidate settings cache
  await CacheService.invalidatePattern('public:/settings*')

  return setting
}

export const updateSettingService = async (id: string, data: UpdateSettingInput) => {
  const payload: any = { ...data }
  if ('value' in payload && payload.value === null) payload.value = Prisma.JsonNull
  const setting = await prisma.setting.update({ where: { id }, data: payload })

  // Invalidate settings cache
  await CacheService.invalidatePattern('public:/settings*')

  return setting
}

export const updateSettingByKeyService = async (key: string, value: any) => {
  const setting = await prisma.setting.update({
    where: { key },
    data: { value },
  })

  // Invalidate settings cache
  await CacheService.invalidatePattern('public:/settings*')

  return setting
}

export const deleteSettingService = async (id: string) => {
  await prisma.setting.delete({ where: { id } })

  // Invalidate settings cache
  await CacheService.invalidatePattern('public:/settings*')

  return { id, deleted: true }
}

// Bulk update settings
export const bulkUpdateSettingsService = async (settings: Array<{ key: string; value: any }>) => {
  const updates = settings.map(({ key, value }) =>
    prisma.setting.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  )
  await prisma.$transaction(updates)
  return { updated: settings.length }
}
