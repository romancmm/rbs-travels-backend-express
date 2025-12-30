import prisma from '@/config/db'
import { createError, ErrorMessages } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
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
  const permission = await prisma.permission.findUnique({
    where: { id },
    include: { roles: { select: { id: true, name: true } } },
  })
  if (!permission) {
    throw createError(ErrorMessages.NOT_FOUND('Permission'), 404, 'NOT_FOUND')
  }
  return permission
}

export const createPermissionService = async (data: CreatePermissionInput) => {
  const permission = await prisma.permission.create({ data })
  return permission
}

export const updatePermissionService = async (id: string, data: UpdatePermissionInput) => {
  const permission = await prisma.permission.update({ where: { id }, data })
  return permission
}

export const deletePermissionService = async (id: string) => {
  await prisma.permission.delete({ where: { id } })
  return { id, deleted: true }
}
