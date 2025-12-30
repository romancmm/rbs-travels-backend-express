import prisma from '@/config/db'
import CacheService from '@/services/cache.service'
import { createError, ErrorMessages } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import { handleSlug } from '@/utils/slug.util'
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
  if (!service) throw createError(ErrorMessages.NOT_FOUND('Service'), 404, 'NOT_FOUND')
  return service
}

export const getServiceBySlugService = async (slug: string) => {
  const service = await prisma.service.findUnique({ where: { slug } })
  if (!service) throw createError(ErrorMessages.NOT_FOUND('Service'), 404, 'NOT_FOUND')
  return service
}

export const createServiceService = async (data: CreateServiceInput) => {
  // Handle slug: auto-generate or purify client-provided slug
  const slug = await handleSlug('service', data.title, data.slug)

  const service = await prisma.service.create({
    data: {
      ...data,
      slug,
    },
  })

  // Invalidate service cache
  await CacheService.invalidatePattern('public:/services*')

  return service
}

export const updateServiceService = async (id: string, data: UpdateServiceInput) => {
  // Handle slug if title or slug is being updated
  let slug = data.slug
  if (data.title || data.slug) {
    const service = await prisma.service.findUnique({ where: { id } })
    if (!service) throw createError(ErrorMessages.NOT_FOUND('Service'), 404, 'NOT_FOUND')

    const title = data.title || service.title
    slug = await handleSlug('service', title, data.slug, id)
  }

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...data,
      ...(slug && { slug }),
    },
  })

  // Invalidate service cache
  await CacheService.invalidatePattern('public:/services*')

  return service
}

export const deleteServiceService = async (id: string) => {
  await prisma.service.delete({ where: { id } })

  // Invalidate service cache
  await CacheService.invalidatePattern('public:/services*')

  return { id, deleted: true }
}
