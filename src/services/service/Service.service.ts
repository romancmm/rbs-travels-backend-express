import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import type {
  CreateServiceInput,
  ServiceQueryParams,
  UpdateServiceInput,
} from '@/validators/service.validator'

export const listServicesService = async (params: ServiceQueryParams = {}) => {
  try {
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
  } catch (error) {
    handleServiceError(error, 'Service')
  }
}

export const getServiceByIdService = async (id: string) => {
  try {
    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) throw createError(ErrorMessages.NOT_FOUND('Service'), 404, 'NOT_FOUND')
    return service
  } catch (error) {
    handleServiceError(error, 'Service')
  }
}

export const getServiceBySlugService = async (slug: string) => {
  try {
    const service = await prisma.service.findUnique({ where: { slug } })
    if (!service) throw createError(ErrorMessages.NOT_FOUND('Service'), 404, 'NOT_FOUND')
    return service
  } catch (error) {
    handleServiceError(error, 'Service')
  }
}

export const createServiceService = async (data: CreateServiceInput) => {
  try {
    const service = await prisma.service.create({ data })
    return service
  } catch (error) {
    handleServiceError(error, 'Service')
  }
}

export const updateServiceService = async (id: string, data: UpdateServiceInput) => {
  try {
    const service = await prisma.service.update({ where: { id }, data })
    return service
  } catch (error) {
    handleServiceError(error, 'Service')
  }
}

export const deleteServiceService = async (id: string) => {
  try {
    await prisma.service.delete({ where: { id } })
    return { id, deleted: true }
  } catch (error) {
    handleServiceError(error, 'Service')
  }
}
