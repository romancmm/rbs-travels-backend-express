import { paginate } from '@/utils/paginator'
import { hashPassword } from '@/utils/password'
import prisma from '@/utils/prisma'
import type {
  CreateCustomerInput,
  CustomerQueryParams,
  UpdateCustomerInput,
} from '@/validators/customer.validator'

export const listCustomersService = async (params: CustomerQueryParams = {}) => {
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

export const createCustomerService = async (data: CreateCustomerInput) => {
  const { name, email, password, avatar } = data || ({} as CreateCustomerInput)
  if (!name || !email || !password)
    throw Object.assign(new Error('name, email, password are required'), { status: 422 })
  const hashed = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, avatar, isAdmin: false },
  })
  const { password: _p, ...safe } = user as any
  return safe
}

export const updateCustomerService = async (id: string, data: UpdateCustomerInput) => {
  const payload: any = {}
  if (data.name !== undefined) payload.name = data.name
  if (data.email !== undefined) payload.email = data.email
  if (data.avatar !== undefined) payload.avatar = data.avatar
  if (data.isActive !== undefined) payload.isActive = data.isActive

  const user = await prisma.user.update({ where: { id }, data: payload })
  const { password, ...safe } = user as any
  return safe
}

export const softDeleteCustomerService = async (id: string) => {
  await prisma.user.update({ where: { id }, data: { isActive: false } })
  return { id, deleted: true }
}
