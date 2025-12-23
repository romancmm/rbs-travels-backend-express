import CacheService from '@/services/cache.service'
import { createError, ErrorMessages } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import { handleSlug } from '@/utils/slug.util'
import type {
  CreatePostInput,
  PostQueryParams,
  UpdatePostInput,
} from '@/validators/article.validator'

export const listPostsService = async (params: PostQueryParams = {}) => {
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

  // Filter by categories - handle both IDs and slugs
  // Normalize to arrays: handle string (single or comma-separated) or array inputs
  const normalizeCategoryArray = (value: any): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
      return value
        .split(',')
        .map((item: string) => item.trim())
        .filter(Boolean)
    }
    return [String(value)]
  }

  const categoryIdsArray = normalizeCategoryArray(categoryIds)
  const categorySlugsArray = normalizeCategoryArray(categorySlugs)

  if (categoryIdsArray.length > 0 || categorySlugsArray.length > 0) {
    const categoryFilters = []

    if (categoryIdsArray.length > 0) {
      categoryFilters.push({ id: { in: categoryIdsArray } })
    }

    if (categorySlugsArray.length > 0) {
      categoryFilters.push({ slug: { in: categorySlugsArray } })
    }

    // If both filters exist, use OR; otherwise use the single filter
    where.categories = {
      some: categoryFilters.length > 1 ? { OR: categoryFilters } : categoryFilters[0],
    }
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
}

export const getPostByIdService = async (id: string) => {
  const post = await prisma.post.findUnique({
    where: { id },
    include: { author: { select: { id: true, name: true, email: true } }, categories: true },
  })
  if (!post) throw createError(ErrorMessages.NOT_FOUND('Post'), 404, 'NOT_FOUND')
  return post
}

export const getPostBySlugService = async (slug: string) => {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { author: { select: { id: true, name: true, email: true } }, categories: true },
  })
  if (!post) throw createError(ErrorMessages.NOT_FOUND('Post'), 404, 'NOT_FOUND')
  return post
}

export const createPostService = async (data: CreatePostInput, authorId: string) => {
  // Handle slug: auto-generate or purify client-provided slug
  const slug = await handleSlug('post', data.title, data.slug)

  const { categoryIds, ...postData } = data

  // Get author name for de-normalized field
  const author = await prisma.user.findUnique({ where: { id: authorId }, select: { name: true } })
  if (!author) throw createError(ErrorMessages.NOT_FOUND('Author'), 404, 'NOT_FOUND')

  const categoryCount = categoryIds?.length || 0

  const post = await prisma.post.create({
    data: {
      ...postData,
      slug,
      authorId,
      authorName: author.name,
      categoryCount,
      categories:
        categoryIds && categoryIds.length > 0
          ? { connect: categoryIds.map((id) => ({ id })) }
          : undefined,
    },
    include: { categories: true },
  })

  // Update User.postCount (de-normalized)
  await prisma.user.update({
    where: { id: authorId },
    data: { postCount: { increment: 1 } },
  })

  // Update Category.postCount for each category (de-normalized)
  if (categoryIds && categoryIds.length > 0) {
    await prisma.category.updateMany({
      where: { id: { in: categoryIds } },
      data: { postCount: { increment: 1 } },
    })
  }

  // Invalidate article cache on create
  await CacheService.invalidatePattern('public:/articles*')

  return post
}

export const updatePostService = async (id: string, data: UpdatePostInput) => {
  // Get existing post to compare category changes
  const existingPost = await prisma.post.findUnique({
    where: { id },
    include: { categories: { select: { id: true } } },
  })
  if (!existingPost) throw createError(ErrorMessages.NOT_FOUND('Post'), 404, 'NOT_FOUND')

  // Handle slug if title or slug is being updated
  let slug = data.slug
  if (data.title || data.slug) {
    const title = data.title || existingPost.title
    slug = await handleSlug('post', title, data.slug, id)
  }

  const { categoryIds, ...postData } = data

  // Calculate category changes for de-normalized postCount
  let oldCategoryIds: string[] = []
  let newCategoryIds: string[] = []
  if (categoryIds !== undefined) {
    oldCategoryIds = existingPost.categories.map((c) => c.id)
    newCategoryIds = categoryIds

    // Categories to remove (decrement postCount)
    const removedCategories = oldCategoryIds.filter((id) => !newCategoryIds.includes(id))
    if (removedCategories.length > 0) {
      await prisma.category.updateMany({
        where: { id: { in: removedCategories } },
        data: { postCount: { decrement: 1 } },
      })
    }

    // Categories to add (increment postCount)
    const addedCategories = newCategoryIds.filter((id) => !oldCategoryIds.includes(id))
    if (addedCategories.length > 0) {
      await prisma.category.updateMany({
        where: { id: { in: addedCategories } },
        data: { postCount: { increment: 1 } },
      })
    }
  }

  const categoryCount =
    categoryIds !== undefined ? categoryIds.length : existingPost.categories.length

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...postData,
      ...(slug && { slug }),
      ...(categoryIds !== undefined && { categoryCount }),
      ...(categoryIds !== undefined && {
        categories: {
          set: categoryIds.map((id) => ({ id })),
        },
      }),
    },
    include: { categories: true },
  })

  // Invalidate article cache on update
  await CacheService.invalidatePattern('public:/articles*')

  return post
}

export const deletePostService = async (id: string) => {
  // Get post with author and categories before deletion
  const post = await prisma.post.findUnique({
    where: { id },
    include: { categories: { select: { id: true } } },
  })
  if (!post) throw createError(ErrorMessages.NOT_FOUND('Post'), 404, 'NOT_FOUND')

  await prisma.post.delete({ where: { id } })

  // Decrement User.postCount (de-normalized)
  await prisma.user.update({
    where: { id: post.authorId },
    data: { postCount: { decrement: 1 } },
  })

  // Decrement Category.postCount for each category (de-normalized)
  if (post.categories.length > 0) {
    await prisma.category.updateMany({
      where: { id: { in: post.categories.map((c) => c.id) } },
      data: { postCount: { decrement: 1 } },
    })
  }

  // Invalidate article cache on delete
  await CacheService.invalidatePattern('public:/articles*')
  return { id, deleted: true }
}
