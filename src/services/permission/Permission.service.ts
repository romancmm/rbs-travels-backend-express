import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import type {
  CreatePermissionInput,
  PermissionQueryParams,
  UpdatePermissionInput,
} from '@/validators/rbac.validator'

export const listPermissionsService = async (params: PermissionQueryParams = {}) => {
  const { page = 1, perPage = 10, q } = params as any
  const { skip, take } = paginate(page, perPage)
  const where: any = {}
  if (q) where.name = { contains: q, mode: 'insensitive' }
  const [items, total] = await Promise.all([
    prisma.permission.findMany({ where, skip, take, orderBy: { name: 'asc' } }),
    prisma.permission.count({ where }),
  ])
  return { items, page, perPage, total }
}

export const getPermissionByIdService = async (id: string) => {
  try {
    const permission = await prisma.permission.findUnique({
      where: { id },
      include: { roles: { select: { id: true, name: true } } },
    })
    if (!permission) {
      throw createError(ErrorMessages.NOT_FOUND('Permission'), 404, 'NOT_FOUND')
    }
    return permission
  } catch (error) {
    handleServiceError(error, 'Permission')
  }
}

export const createPermissionService = async (data: CreatePermissionInput) => {
  try {
    const permission = await prisma.permission.create({ data })
    return permission
  } catch (error) {
    handleServiceError(error, 'Permission')
  }
}

export const updatePermissionService = async (id: string, data: UpdatePermissionInput) => {
  try {
    const permission = await prisma.permission.update({ where: { id }, data })
    return permission
  } catch (error) {
    handleServiceError(error, 'Permission')
  }
}

export const deletePermissionService = async (id: string) => {
  try {
    await prisma.permission.delete({ where: { id } })
    return { id, deleted: true }
  } catch (error) {
    handleServiceError(error, 'Permission')
  }
}
