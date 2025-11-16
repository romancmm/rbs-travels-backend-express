import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import { handleSlug } from '@/utils/slug.util'
import type { CreatePostInput, PostQueryParams, UpdatePostInput } from '@/validators/blog.validator'

export const listPostsService = async (params: PostQueryParams = {}) => {
  try {
    const {
      page = 1,
      perPage = 10,
      q,
      categoryId,
      categorySlug,
      tag,
      isPublished,
      authorId,
    } = params
    const { skip, take } = paginate(page, perPage)
    const where: any = {}

    if (typeof isPublished === 'boolean') where.isPublished = isPublished
    if (categoryId) where.categoryId = categoryId
    if (categorySlug) where.category = { slug: categorySlug }
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
  } catch (error) {
    handleServiceError(error, 'Post')
  }
}

export const getPostByIdService = async (id: string) => {
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: { author: { select: { id: true, name: true, email: true } }, category: true },
    })
    if (!post) throw createError(ErrorMessages.NOT_FOUND('Post'), 404, 'NOT_FOUND')
    return post
  } catch (error) {
    handleServiceError(error, 'Post')
  }
}

export const getPostBySlugService = async (slug: string) => {
  try {
    const post = await prisma.post.findUnique({
      where: { slug },
      include: { author: { select: { id: true, name: true, email: true } }, category: true },
    })
    if (!post) throw createError(ErrorMessages.NOT_FOUND('Post'), 404, 'NOT_FOUND')
    return post
  } catch (error) {
    handleServiceError(error, 'Post')
  }
}

export const createPostService = async (data: CreatePostInput, authorId: string) => {
  try {
    // Handle slug: auto-generate or purify client-provided slug
    const slug = await handleSlug('post', data.title, data.slug)

    const post = await prisma.post.create({
      data: {
        ...data,
        slug,
        authorId,
      },
    })
    return post
  } catch (error) {
    handleServiceError(error, 'Post')
  }
}

export const updatePostService = async (id: string, data: UpdatePostInput) => {
  try {
    // Handle slug if title or slug is being updated
    let slug = data.slug
    if (data.title || data.slug) {
      const post = await prisma.post.findUnique({ where: { id } })
      if (!post) throw createError(ErrorMessages.NOT_FOUND('Post'), 404, 'NOT_FOUND')

      const title = data.title || post.title
      slug = await handleSlug('post', title, data.slug, id)
    }

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...data,
        ...(slug && { slug }),
      },
    })
    return post
  } catch (error) {
    handleServiceError(error, 'Post')
  }
}

export const deletePostService = async (id: string) => {
  try {
    await prisma.post.delete({ where: { id } })
    return { id, deleted: true }
  } catch (error) {
    handleServiceError(error, 'Post')
  }
}
