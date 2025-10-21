import prisma from '@/utils/prisma'
import { paginate } from '@/utils/paginator'

type ListParams = { page?: number; perPage?: number; q?: string }

export const listRolesService = async (params: ListParams = {}) => {
 const { page = 1, perPage = 10, q } = params
 const { skip, take } = paginate(page, perPage)
 const where: any = {}
 if (q) where.name = { contains: q, mode: 'insensitive' }
 const [items, total] = await Promise.all([
  prisma.role.findMany({
   where,
   skip,
   take,
   include: { permissions: true },
   orderBy: { name: 'asc' },
  }),
  prisma.role.count({ where }),
 ])
 return { items, page, perPage, total }
}

export const getRoleByIdService = async (id: string) => {
 const role = await prisma.role.findUnique({
  where: { id },
  include: { permissions: true, users: { select: { id: true, name: true, email: true } } },
 })
 if (!role) throw Object.assign(new Error('Role not found'), { status: 404 })
 return role
}

export const createRoleService = async (data: any) => {
 const { name, permissionIds } = data || {}
 if (!name) throw Object.assign(new Error('name is required'), { status: 422 })
 const role = await prisma.role.create({
  data: {
   name,
   permissions: permissionIds?.length
    ? { connect: permissionIds.map((id: string) => ({ id })) }
    : undefined,
  },
  include: { permissions: true },
 })
 return role
}

export const updateRoleService = async (id: string, data: any) => {
 const { name, permissionIds } = data || {}
 const payload: any = {}
 if (name !== undefined) payload.name = name
 if (permissionIds !== undefined) {
  // Reset permissions: disconnect all, reconnect from list
  const existing = await prisma.role.findUnique({ where: { id }, include: { permissions: true } })
  if (!existing) throw Object.assign(new Error('Role not found'), { status: 404 })
  payload.permissions = {
   disconnect: existing.permissions.map((p) => ({ id: p.id })),
   connect: permissionIds.map((pid: string) => ({ id: pid })),
  }
 }
 const role = await prisma.role.update({
  where: { id },
  data: payload,
  include: { permissions: true },
 })
 return role
}

export const deleteRoleService = async (id: string) => {
 await prisma.role.delete({ where: { id } })
 return { id, deleted: true }
}
