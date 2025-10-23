import prisma from '@/utils/prisma'
import { paginate } from '@/utils/paginator'
import { hashPassword } from '@/utils/password'

type ListParams = {
 page?: number
 perPage?: number
 q?: string
 isActive?: boolean
 isAdmin?: boolean
 roleId?: string
}

// List admin/staff users (User model represents admin users, not customers)
export const listAdminsService = async (params: ListParams = {}) => {
 const { page = 1, perPage = 10, q, isActive, isAdmin, roleId } = params
 const { skip, take } = paginate(page, perPage)
 const where: any = {}
 
 if (typeof isActive === 'boolean') where.isActive = isActive
 if (typeof isAdmin === 'boolean') where.isAdmin = isAdmin
 if (roleId) where.roleId = roleId
 if (q) {
  where.OR = [
   { name: { contains: q, mode: 'insensitive' } },
   { email: { contains: q, mode: 'insensitive' } },
  ]
 }

 const [items, total] = await Promise.all([
  prisma.user.findMany({
   where,
   skip,
   take,
   orderBy: { createdAt: 'desc' },
   select: {
    id: true,
    name: true,
    email: true,
    isActive: true,
    isAdmin: true,
    roleId: true,
    role: {
     select: {
      id: true,
      name: true,
      permissions: { select: { id: true, name: true } },
     },
    },
    createdAt: true,
    updatedAt: true,
   },
  }),
  prisma.user.count({ where }),
 ])
 return { items, page, perPage, total }
}

export const getAdminByIdService = async (id: string) => {
 const user = await prisma.user.findUnique({
  where: { id },
  select: {
   id: true,
   name: true,
   email: true,
   isActive: true,
   isAdmin: true,
   roleId: true,
   role: {
    select: {
     id: true,
     name: true,
     permissions: { select: { id: true, name: true } },
    },
   },
   createdAt: true,
   updatedAt: true,
  },
 })
 if (!user) throw Object.assign(new Error('User not found'), { status: 404 })
 return user
}

export const createAdminService = async (data: {
 name: string
 email: string
 password: string
 isActive?: boolean
 isAdmin?: boolean
 roleId?: string
}) => {
 const { name, email, password, isActive, isAdmin, roleId } = data || {}
 if (!name || !email || !password) {
  throw Object.assign(new Error('name, email, and password are required'), { status: 422 })
 }

 // Check if email already exists
 const existingUser = await prisma.user.findUnique({ where: { email } })
 if (existingUser) {
  throw Object.assign(new Error('Email already exists'), { status: 409 })
 }

 const hashedPassword = await hashPassword(password)
 const payload: any = {
  name,
  email,
  password: hashedPassword,
 }
 
 if (typeof isActive === 'boolean') payload.isActive = isActive
 if (typeof isAdmin === 'boolean') payload.isAdmin = isAdmin
 if (roleId) payload.roleId = roleId

 const user = await prisma.user.create({
  data: payload,
  select: {
   id: true,
   name: true,
   email: true,
   isActive: true,
   isAdmin: true,
   roleId: true,
   role: {
    select: {
     id: true,
     name: true,
     permissions: { select: { id: true, name: true } },
    },
   },
   createdAt: true,
   updatedAt: true,
  },
 })
 return user
}

export const updateAdminService = async (id: string, data: any) => {
 const { name, email, password, isActive, isAdmin, roleId } = data || {}
 const payload: any = {}
 
 if (name !== undefined) payload.name = name
 if (email !== undefined) {
  // Check if email is taken by another user
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser && existingUser.id !== id) {
   throw Object.assign(new Error('Email already exists'), { status: 409 })
  }
  payload.email = email
 }
 if (password !== undefined) {
  payload.password = await hashPassword(password)
 }
 if (typeof isActive === 'boolean') payload.isActive = isActive
 if (typeof isAdmin === 'boolean') payload.isAdmin = isAdmin
 if (roleId !== undefined) payload.roleId = roleId

 const user = await prisma.user.update({
  where: { id },
  data: payload,
  select: {
   id: true,
   name: true,
   email: true,
   isActive: true,
   isAdmin: true,
   roleId: true,
   role: {
    select: {
     id: true,
     name: true,
     permissions: { select: { id: true, name: true } },
    },
   },
   createdAt: true,
   updatedAt: true,
  },
 })
 return user
}

export const deleteAdminService = async (id: string) => {
 await prisma.user.delete({ where: { id } })
 return { id, deleted: true }
}

export const toggleAdminStatusService = async (id: string) => {
 const user = await prisma.user.findUnique({ where: { id } })
 if (!user) throw Object.assign(new Error('User not found'), { status: 404 })
 
 const updated = await prisma.user.update({
  where: { id },
  data: { isActive: !user.isActive },
  select: {
   id: true,
   name: true,
   email: true,
   isActive: true,
   isAdmin: true,
   roleId: true,
   createdAt: true,
   updatedAt: true,
  },
 })
 return updated
}

export const assignRoleToAdminService = async (userId: string, roleId: string) => {
 const user = await prisma.user.update({
  where: { id: userId },
  data: { roleId },
  select: {
   id: true,
   name: true,
   email: true,
   isActive: true,
   isAdmin: true,
   roleId: true,
   role: {
    select: {
     id: true,
     name: true,
     permissions: { select: { id: true, name: true } },
    },
   },
   createdAt: true,
   updatedAt: true,
  },
 })
 return user
}
