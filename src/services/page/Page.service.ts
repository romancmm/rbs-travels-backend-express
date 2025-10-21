import prisma from '@/utils/prisma'
import { paginate } from '@/utils/paginator'

type ListParams = { page?: number; perPage?: number; q?: string; isPublished?: boolean }

export const listPagesService = async (params: ListParams = {}) => {
 const { page = 1, perPage = 10, q, isPublished } = params
 const { skip, take } = paginate(page, perPage)
 const where: any = {}
 if (typeof isPublished === 'boolean') where.isPublished = isPublished
 if (q) where.OR = [{ title: { contains: q, mode: 'insensitive' } }, { slug: { contains: q, mode: 'insensitive' } }]
 const [items, total] = await Promise.all([
  prisma.page.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
  prisma.page.count({ where }),
 ])
 return { items, page, perPage, total }
}

export const getPageByIdService = async (id: string) => {
 const page = await prisma.page.findUnique({ where: { id } })
 if (!page) throw Object.assign(new Error('Page not found'), { status: 404 })
 return page
}

export const createPageService = async (data: any) => {
 const { title, slug, content, meta, isPublished } = data || {}
 if (!title || !slug || content === undefined) {
  throw Object.assign(new Error('title, slug and content are required'), { status: 422 })
 }
 const page = await prisma.page.create({ data: { title, slug, content, meta, isPublished: !!isPublished } })
 return page
}

export const updatePageService = async (id: string, data: any) => {
 const { title, slug, content, meta, isPublished } = data || {}
 const payload: any = {}
 if (title !== undefined) payload.title = title
 if (slug !== undefined) payload.slug = slug
 if (content !== undefined) payload.content = content
 if (meta !== undefined) payload.meta = meta
 if (isPublished !== undefined) payload.isPublished = !!isPublished
 const page = await prisma.page.update({ where: { id }, data: payload })
 return page
}

export const deletePageService = async (id: string) => {
 await prisma.page.delete({ where: { id } })
 return { id, deleted: true }
}
