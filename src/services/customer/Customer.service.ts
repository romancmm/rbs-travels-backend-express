import prisma from '@/utils/prisma'
import { paginate } from '@/utils/paginator'
import { hashPassword } from '@/utils/password'

type ListParams = {
 page?: number
 perPage?: number
 q?: string
 isActive?: boolean
}

export const listCustomersService = async (params: ListParams = {}) => {
 const { page = 1, perPage = 10, q, isActive } = params
 const { skip, take } = paginate(page, perPage)

 const where: any = { isAdmin: false }
 if (typeof isActive === 'boolean') where.isActive = isActive
 if (q) {
  where.OR = [
   { name: { contains: q, mode: 'insensitive' } },
   { email: { contains: q, mode: 'insensitive' } },
  ]
 }

 const [items, total] = await Promise.all([
  prisma.user.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
  prisma.user.count({ where }),
 ])

 const data = items.map(({ password, ...u }) => u)
 return { items: data, page, perPage, total }
}

export const getCustomerByIdService = async (id: string) => {
 const user = await prisma.user.findUnique({ where: { id } })
 if (!user || user.isAdmin) throw Object.assign(new Error('User not found'), { status: 404 })
 const { password, ...safe } = user as any
 return safe
}

export const createCustomerService = async (data: any) => {
 const { name, email, password } = data || {}
 if (!name || !email || !password) throw Object.assign(new Error('name, email, password are required'), { status: 422 })
 const hashed = await hashPassword(password)
 const user = await prisma.user.create({
  data: { name, email, password: hashed, isAdmin: false },
 })
 const { password: _p, ...safe } = user as any
 return safe
}

export const updateCustomerService = async (id: string, data: any) => {
 const payload: any = {}
 if (data.name !== undefined) payload.name = data.name
 if (data.email !== undefined) payload.email = data.email
 if (data.isActive !== undefined) payload.isActive = data.isActive
 if (data.password) payload.password = await hashPassword(data.password)

 const user = await prisma.user.update({ where: { id }, data: payload })
 const { password, ...safe } = user as any
 return safe
}

export const softDeleteCustomerService = async (id: string) => {
 await prisma.user.update({ where: { id }, data: { isActive: false } })
 return { id, deleted: true }
}
