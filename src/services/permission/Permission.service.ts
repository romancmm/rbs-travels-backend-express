import prisma from '@/utils/prisma'
import { paginate } from '@/utils/paginator'

type ListParams = { page?: number; perPage?: number; q?: string }

export const listPermissionsService = async (params: ListParams = {}) => {
 const { page = 1, perPage = 10, q } = params
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
 if (!permission) throw Object.assign(new Error('Permission not found'), { status: 404 })
 return permission
}

export const createPermissionService = async (data: any) => {
 const { name } = data || {}
 if (!name) throw Object.assign(new Error('name is required'), { status: 422 })
 const permission = await prisma.permission.create({ data: { name } })
 return permission
}

export const updatePermissionService = async (id: string, data: any) => {
 const { name } = data || {}
 if (!name) throw Object.assign(new Error('name is required'), { status: 422 })
 const permission = await prisma.permission.update({ where: { id }, data: { name } })
 return permission
}

export const deletePermissionService = async (id: string) => {
 await prisma.permission.delete({ where: { id } })
 return { id, deleted: true }
}
