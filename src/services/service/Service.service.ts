import prisma from '@/utils/prisma'
import { paginate } from '@/utils/paginator'

type ListParams = {
 page?: number
 perPage?: number
 q?: string
 isPublished?: boolean
}

export const listServicesService = async (params: ListParams = {}) => {
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

export const createServiceService = async (data: any) => {
 const { title, slug, description, content, icon, featuredImage, features, price, isPublished, order } = data || {}
 if (!title || !slug || !content) throw Object.assign(new Error('title, slug, and content are required'), { status: 422 })
 
 const payload: any = { title, slug, content }
 if (description !== undefined) payload.description = description
 if (icon !== undefined) payload.icon = icon
 if (featuredImage !== undefined) payload.featuredImage = featuredImage
 if (features !== undefined) {
  payload.features = Array.isArray(features) ? features : features.split(',').map((f: string) => f.trim()).filter(Boolean)
 }
 if (price !== undefined) payload.price = price
 if (typeof isPublished === 'boolean') payload.isPublished = isPublished
 if (order !== undefined) payload.order = order
 
 const service = await prisma.service.create({ data: payload })
 return service
}

export const updateServiceService = async (id: string, data: any) => {
 const { title, slug, description, content, icon, featuredImage, features, price, isPublished, order } = data || {}
 const payload: any = {}
 
 if (title !== undefined) payload.title = title
 if (slug !== undefined) payload.slug = slug
 if (description !== undefined) payload.description = description
 if (content !== undefined) payload.content = content
 if (icon !== undefined) payload.icon = icon
 if (featuredImage !== undefined) payload.featuredImage = featuredImage
 if (features !== undefined) {
  payload.features = Array.isArray(features) ? features : features.split(',').map((f: string) => f.trim()).filter(Boolean)
 }
 if (price !== undefined) payload.price = price
 if (typeof isPublished === 'boolean') payload.isPublished = isPublished
 if (order !== undefined) payload.order = order
 
 const service = await prisma.service.update({ where: { id }, data: payload })
 return service
}

export const deleteServiceService = async (id: string) => {
 await prisma.service.delete({ where: { id } })
 return { id, deleted: true }
}
