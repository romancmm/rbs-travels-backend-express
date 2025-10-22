import prisma from '@/utils/prisma'
import { paginate } from '@/utils/paginator'

type ListParams = {
 page?: number
 perPage?: number
 q?: string
 categoryId?: string
 tag?: string
 isPublished?: boolean
 authorId?: string
}

export const listPostsService = async (params: ListParams = {}) => {
 const { page = 1, perPage = 10, q, categoryId, tag, isPublished, authorId } = params
 const { skip, take } = paginate(page, perPage)
 const where: any = {}
 
 if (typeof isPublished === 'boolean') where.isPublished = isPublished
 if (categoryId) where.categoryId = categoryId
 if (authorId) where.authorId = authorId
 if (tag) where.tags = { has: tag }
 if (q) {
  where.OR = [
   { title: { contains: q, mode: 'insensitive' } },
   { excerpt: { contains: q, mode: 'insensitive' } },
   { content: { contains: q, mode: 'insensitive' } },
  ]
 }

 const [items, total] = await Promise.all([
  prisma.post.findMany({
   where,
   skip,
   take,
   include: { author: { select: { id: true, name: true, email: true } }, category: true },
   orderBy: { createdAt: 'desc' },
  }),
  prisma.post.count({ where }),
 ])
 return { items, page, perPage, total }
}

export const getPostByIdService = async (id: string) => {
 const post = await prisma.post.findUnique({
  where: { id },
  include: { author: { select: { id: true, name: true, email: true } }, category: true },
 })
 if (!post) throw Object.assign(new Error('Post not found'), { status: 404 })
 return post
}

export const getPostBySlugService = async (slug: string) => {
 const post = await prisma.post.findUnique({
  where: { slug },
  include: { author: { select: { id: true, name: true, email: true } }, category: true },
 })
 if (!post) throw Object.assign(new Error('Post not found'), { status: 404 })
 return post
}

export const createPostService = async (data: any, authorId: string) => {
 const { title, slug, excerpt, content, featuredImage, categoryId, tags, isPublished, publishedAt } = data || {}
 if (!title || !slug || !content) throw Object.assign(new Error('title, slug, and content are required'), { status: 422 })
 
 const payload: any = {
  title,
  slug,
  content,
  authorId,
 }
 if (excerpt !== undefined) payload.excerpt = excerpt
 if (featuredImage !== undefined) payload.featuredImage = featuredImage
 if (categoryId !== undefined) payload.categoryId = categoryId
 if (tags !== undefined) {
  // Tags can be a comma-separated string or an array
  payload.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean)
 }
 if (typeof isPublished === 'boolean') payload.isPublished = isPublished
 if (publishedAt !== undefined) payload.publishedAt = publishedAt
 
 const post = await prisma.post.create({ data: payload })
 return post
}

export const updatePostService = async (id: string, data: any) => {
 const { title, slug, excerpt, content, featuredImage, categoryId, tags, isPublished, publishedAt } = data || {}
 const payload: any = {}
 
 if (title !== undefined) payload.title = title
 if (slug !== undefined) payload.slug = slug
 if (excerpt !== undefined) payload.excerpt = excerpt
 if (content !== undefined) payload.content = content
 if (featuredImage !== undefined) payload.featuredImage = featuredImage
 if (categoryId !== undefined) payload.categoryId = categoryId
 if (tags !== undefined) {
  // Tags can be a comma-separated string or an array
  payload.tags = Array.isArray(tags) ? tags : tags.split(',').map((t: string) => t.trim()).filter(Boolean)
 }
 if (typeof isPublished === 'boolean') payload.isPublished = isPublished
 if (publishedAt !== undefined) payload.publishedAt = publishedAt
 
 const post = await prisma.post.update({ where: { id }, data: payload })
 return post
}

export const deletePostService = async (id: string) => {
 await prisma.post.delete({ where: { id } })
 return { id, deleted: true }
}
