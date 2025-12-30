import prisma from '@/config/db'
import CacheService from '@/services/cache.service'
import { createError, ErrorMessages } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import { handleSlug } from '@/utils/slug.util'
import type {
  CategoryQueryParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/validators/article.validator'

export const listCategoriesService = async (params: CategoryQueryParams = {}) => {
  const { page = 1, perPage = 10, q } = params as any
  const { skip, take } = paginate(page, perPage)
  const where: any = {}
  if (q) where.name = { contains: q, mode: 'insensitive' }
  const [items, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take,
      include: { _count: { select: { posts: true } } },
      orderBy: { name: 'asc' },
    }),
    prisma.category.count({ where }),
  ])
  return { items, page, perPage, total }
}

export const getCategoryByIdService = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: { _count: { select: { posts: true } } },
  })
  if (!category) throw createError(ErrorMessages.NOT_FOUND('Category'), 404, 'NOT_FOUND')
  return category
}

export const createCategoryService = async (data: CreateCategoryInput) => {
  // Handle slug: auto-generate or purify client-provided slug
  const slug = await handleSlug('category', data.name, data.slug)

  const category = await prisma.category.create({
    data: {
      ...data,
      slug,
    },
  })

  // Invalidate article cache on category create
  await CacheService.invalidatePattern('public:/articles*')

  return category
}

export const updateCategoryService = async (id: string, data: UpdateCategoryInput) => {
  // Handle slug if name or slug is being updated
  let slug = data.slug
  if (data.name || data.slug) {
    const category = await prisma.category.findUnique({ where: { id } })
    if (!category) throw createError(ErrorMessages.NOT_FOUND('Category'), 404, 'NOT_FOUND')

    const name = data.name || category.name
    slug = await handleSlug('category', name, data.slug, id)
  }

  const category = await prisma.category.update({
    where: { id },
    data: {
      ...data,
      ...(slug && { slug }),
    },
  })

  // Invalidate article cache on category update
  await CacheService.invalidatePattern('public:/articles*')

  return category
}

export const deleteCategoryService = async (id: string) => {
  await prisma.category.delete({ where: { id } })

  // Invalidate article cache on category delete
  await CacheService.invalidatePattern('public:/articles*')

  return { id, deleted: true }
}
