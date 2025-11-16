import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import { handleSlug } from '@/utils/slug.util'
import type {
  CategoryQueryParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/validators/blog.validator'

export const listCategoriesService = async (params: CategoryQueryParams = {}) => {
  try {
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
  } catch (error) {
    handleServiceError(error, 'Category')
  }
}

export const getCategoryByIdService = async (id: string) => {
  try {
    const category = await prisma.category.findUnique({
      where: { id },
      include: { _count: { select: { posts: true } } },
    })
    if (!category) throw createError(ErrorMessages.NOT_FOUND('Category'), 404, 'NOT_FOUND')
    return category
  } catch (error) {
    handleServiceError(error, 'Category')
  }
}

export const createCategoryService = async (data: CreateCategoryInput) => {
  try {
    // Handle slug: auto-generate or purify client-provided slug
    const slug = await handleSlug('category', data.name, data.slug)

    const category = await prisma.category.create({
      data: {
        ...data,
        slug,
      },
    })
    return category
  } catch (error) {
    handleServiceError(error, 'Category')
  }
}

export const updateCategoryService = async (id: string, data: UpdateCategoryInput) => {
  try {
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
    return category
  } catch (error) {
    handleServiceError(error, 'Category')
  }
}

export const deleteCategoryService = async (id: string) => {
  try {
    await prisma.category.delete({ where: { id } })
    return { id, deleted: true }
  } catch (error) {
    handleServiceError(error, 'Category')
  }
}
