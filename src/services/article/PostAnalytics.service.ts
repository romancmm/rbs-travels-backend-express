import { createError, ErrorMessages } from '@/utils/error-handler'
import prisma from '@/utils/prisma'

/**
 * Increment view count for a post (de-normalized analytics)
 */
export const incrementPostViewService = async (postId: string) => {
  const post = await prisma.post.findUnique({ where: { id: postId } })
  if (!post) throw createError(ErrorMessages.NOT_FOUND('Post'), 404, 'NOT_FOUND')

  await prisma.post.update({
    where: { id: postId },
    data: { viewCount: { increment: 1 } },
  })

  return { success: true, viewCount: post.viewCount + 1 }
}

/**
 * Increment view count by slug (for public endpoints)
 */
export const incrementPostViewBySlugService = async (slug: string) => {
  const post = await prisma.post.findUnique({ where: { slug } })
  if (!post) throw createError(ErrorMessages.NOT_FOUND('Post'), 404, 'NOT_FOUND')

  await prisma.post.update({
    where: { slug },
    data: { viewCount: { increment: 1 } },
  })

  return { success: true, viewCount: post.viewCount + 1 }
}

/**
 * Get top posts by view count
 */
export const getTopPostsByViewsService = async (limit: number = 10) => {
  const posts = await prisma.post.findMany({
    where: { isPublished: true },
    orderBy: { viewCount: 'desc' },
    take: limit,
    select: {
      id: true,
      title: true,
      slug: true,
      excerpt: true,
      thumbnail: true,
      authorName: true,
      viewCount: true,
      categoryCount: true,
      createdAt: true,
    },
  })

  return posts
}
