import prisma from '@/utils/prisma'
import { paginate } from '@/utils/paginator'

type ListParams = { page?: number; perPage?: number; q?: string }

export const listCategoriesService = async (params: ListParams = {}) => {
 const { page = 1, perPage = 10, q } = params
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

export const createCategoryService = async (data: any) => {
 const { name, slug, description } = data || {}
 if (!name || !slug) throw Object.assign(new Error('name and slug are required'), { status: 422 })
 const category = await prisma.category.create({ data: { name, slug, description } })
 return category
}

export const updateCategoryService = async (id: string, data: any) => {
 const { name, slug, description } = data || {}
 const payload: any = {}
 if (name !== undefined) payload.name = name
 if (slug !== undefined) payload.slug = slug
 if (description !== undefined) payload.description = description
 const category = await prisma.category.update({ where: { id }, data: payload })
 return category
}

export const deleteCategoryService = async (id: string) => {
 await prisma.category.delete({ where: { id } })
 return { id, deleted: true }
}
