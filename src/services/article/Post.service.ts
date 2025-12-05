import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import { handleSlug } from '@/utils/slug.util'
import type {
  CreatePostInput,
  PostQueryParams,
  UpdatePostInput,
} from '@/validators/article.validator'

export const listPostsService = async (params: PostQueryParams = {}) => {
  try {
    const {
      page = 1,
      perPage = 10,
      q,
      categoryIds,
      categorySlugs,
      tag,
      isPublished,
      authorId,
    } = params
    const { skip, take } = paginate(page, perPage)
    const where: any = {}

    if (typeof isPublished === 'boolean') where.isPublished = isPublished

    // Filter by multiple category IDs
    if (categoryIds && categoryIds.length > 0) {
      where.categories = { some: { id: { in: categoryIds } } }
    }

    // Filter by multiple category slugs
    if (categorySlugs && categorySlugs.length > 0) {
      where.categories = { some: { slug: { in: categorySlugs } } }
    }

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
        include: { author: { select: { id: true, name: true, email: true } }, categories: true },
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
      include: { author: { select: { id: true, name: true, email: true } }, categories: true },
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
      include: { author: { select: { id: true, name: true, email: true } }, categories: true },
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

    const { categoryIds, ...postData } = data

    const post = await prisma.post.create({
      data: {
        ...postData,
        slug,
        authorId,
        categories:
          categoryIds && categoryIds.length > 0
            ? { connect: categoryIds.map((id) => ({ id })) }
            : undefined,
      },
      include: { categories: true },
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

    const { categoryIds, ...postData } = data

    const post = await prisma.post.update({
      where: { id },
      data: {
        ...postData,
        ...(slug && { slug }),
        ...(categoryIds !== undefined && {
          category:
            categoryIds.length > 0 ? { connect: { id: categoryIds[0] } } : { disconnect: true },
        }),
      },
      include: { categories: true },
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
