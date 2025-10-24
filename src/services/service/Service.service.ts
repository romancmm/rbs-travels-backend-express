import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import type {
  CreateServiceInput,
  ServiceQueryParams,
  UpdateServiceInput,
} from '@/validators/service.validator'

export const listServicesService = async (params: ServiceQueryParams = {}) => {
  const { page = 1, perPage = 10, q, isPublished } = params
  const { skip, take } = paginate(page, perPage)
  const where: any = {}

  if (typeof isPublished === 'boolean') where.isPublished = isPublished
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.service.findMany({
      where,
      skip,
      take,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.service.count({ where }),
  ])
  return { items, page, perPage, total }
}

export const getServiceByIdService = async (id: string) => {
  const service = await prisma.service.findUnique({ where: { id } })
  if (!service) throw Object.assign(new Error('Service not found'), { status: 404 })
  return service
}

export const getServiceBySlugService = async (slug: string) => {
  const service = await prisma.service.findUnique({ where: { slug } })
  if (!service) throw Object.assign(new Error('Service not found'), { status: 404 })
  return service
}

export const createServiceService = async (data: CreateServiceInput) => {
  const service = await prisma.service.create({ data })
  return service
}

export const updateServiceService = async (id: string, data: UpdateServiceInput) => {
  const service = await prisma.service.update({ where: { id }, data })
  return service
}

export const deleteServiceService = async (id: string) => {
  await prisma.service.delete({ where: { id } })
  return { id, deleted: true }
}
