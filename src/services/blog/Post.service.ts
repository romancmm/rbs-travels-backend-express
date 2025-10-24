import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import type { CreatePostInput, PostQueryParams, UpdatePostInput } from '@/validators/blog.validator'

export const listPostsService = async (params: PostQueryParams = {}) => {
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

export const createPostService = async (data: CreatePostInput, authorId: string) => {
  const post = await prisma.post.create({ data: { ...data, authorId } })
  return post
}

export const updatePostService = async (id: string, data: UpdatePostInput) => {
  const post = await prisma.post.update({ where: { id }, data })
  return post
}

export const deletePostService = async (id: string) => {
  await prisma.post.delete({ where: { id } })
  return { id, deleted: true }
}
