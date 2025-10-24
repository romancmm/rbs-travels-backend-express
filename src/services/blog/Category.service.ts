import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import type {
  CategoryQueryParams,
  CreateCategoryInput,
  UpdateCategoryInput,
} from '@/validators/blog.validator'

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
  if (!category) throw Object.assign(new Error('Category not found'), { status: 404 })
  return category
}

export const createCategoryService = async (data: CreateCategoryInput) => {
  const category = await prisma.category.create({ data })
  return category
}

export const updateCategoryService = async (id: string, data: UpdateCategoryInput) => {
  const category = await prisma.category.update({ where: { id }, data })
  return category
}

export const deleteCategoryService = async (id: string) => {
  await prisma.category.delete({ where: { id } })
  return { id, deleted: true }
}
