import prisma from '@/utils/prisma'
import { paginate } from '@/utils/paginator'

type ListParams = {
 page?: number
 perPage?: number
 q?: string
 category?: string
 tag?: string
 isPublished?: boolean
 isFeatured?: boolean
}

export const listProjectsService = async (params: ListParams = {}) => {
 const { page = 1, perPage = 10, q, category, tag, isPublished, isFeatured } = params
 const { skip, take } = paginate(page, perPage)
 const where: any = {}
 
 if (typeof isPublished === 'boolean') where.isPublished = isPublished
 if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured
 if (category) where.category = { contains: category, mode: 'insensitive' }
 if (tag) where.tags = { has: tag }
 if (q) {
  where.OR = [
   { title: { contains: q, mode: 'insensitive' } },
   { description: { contains: q, mode: 'insensitive' } },
   { content: { contains: q, mode: 'insensitive' } },
   { client: { contains: q, mode: 'insensitive' } },
  ]
 }

 const [items, total] = await Promise.all([
  prisma.project.findMany({
   where,
   skip,
   take,
   orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
  }),
  prisma.project.count({ where }),
 ])
 return { items, page, perPage, total }
}

export const getProjectByIdService = async (id: string) => {
 const project = await prisma.project.findUnique({ where: { id } })
 if (!project) throw Object.assign(new Error('Project not found'), { status: 404 })
 return project
}

export const getProjectBySlugService = async (slug: string) => {
 const project = await prisma.project.findUnique({ where: { slug } })
 if (!project) throw Object.assign(new Error('Project not found'), { status: 404 })
 return project
}

export const createProjectService = async (data: any) => {
 const { title, slug, description, content, client, category, tags, featuredImage, images, completedAt, isPublished, isFeatured, order } = data || {}
 if (!title || !slug || !content) throw Object.assign(new Error('title, slug, and content are required'), { status: 422 })
 
 const payload: any = { title, slug, content }
 if (description !== undefined) payload.description = description
 if (client !== undefined) payload.client = client
 if (category !== undefined) payload.category = category
 if (tags !== undefined) {
  payload.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean)
 }
 if (featuredImage !== undefined) payload.featuredImage = featuredImage
 if (images !== undefined) {
  payload.images = Array.isArray(images) ? images : images.split(',').map((i: string) => i.trim()).filter(Boolean)
 }
 if (completedAt !== undefined) payload.completedAt = completedAt
 if (typeof isPublished === 'boolean') payload.isPublished = isPublished
 if (typeof isFeatured === 'boolean') payload.isFeatured = isFeatured
 if (order !== undefined) payload.order = order
 
 const project = await prisma.project.create({ data: payload })
 return project
}

export const updateProjectService = async (id: string, data: any) => {
 const { title, slug, description, content, client, category, tags, featuredImage, images, completedAt, isPublished, isFeatured, order } = data || {}
 const payload: any = {}
 
 if (title !== undefined) payload.title = title
 if (slug !== undefined) payload.slug = slug
 if (description !== undefined) payload.description = description
 if (content !== undefined) payload.content = content
 if (client !== undefined) payload.client = client
 if (category !== undefined) payload.category = category
 if (tags !== undefined) {
  payload.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean)
 }
 if (featuredImage !== undefined) payload.featuredImage = featuredImage
 if (images !== undefined) {
  payload.images = Array.isArray(images) ? images : images.split(',').map((i: string) => i.trim()).filter(Boolean)
 }
 if (completedAt !== undefined) payload.completedAt = completedAt
 if (typeof isPublished === 'boolean') payload.isPublished = isPublished
 if (typeof isFeatured === 'boolean') payload.isFeatured = isFeatured
 if (order !== undefined) payload.order = order
 
 const project = await prisma.project.update({ where: { id }, data: payload })
 return project
}

export const deleteProjectService = async (id: string) => {
 await prisma.project.delete({ where: { id } })
 return { id, deleted: true }
}
