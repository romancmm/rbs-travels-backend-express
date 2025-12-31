import prisma from '@/config/db'
import CacheService from '@/services/cache.service'
import { Prisma } from '@prisma/client'
import { paginate } from '../../utils/paginator'
import { handleSlug } from '../../utils/slug.util'

/**
 * ============================================
 * OPTIMIZED PAGE BUILDER SERVICE (JSON-based)
 * ============================================
 * Performance: Single query for entire page structure
 * - No joins or nested queries needed
 * - Draft/published content separation
 * - Built-in versioning and analytics
 * ============================================
 */

export class PageBuilderService {
  /**
   * Get all pages with pagination and filters
   * Performance: Simple query without relations
   */
  async getAllPages(
    page: number = 1,
    perPage: number = 10,
    filters?: {
      isPublished?: boolean
      isDraft?: boolean
      search?: string
    }
  ) {
    const { skip, take } = paginate(page, perPage)
    const where: Prisma.PageBuilderWhereInput = {}

    if (filters?.isPublished !== undefined) {
      where.isPublished = filters.isPublished
    }

    if (filters?.isDraft !== undefined) {
      where.isDraft = filters.isDraft
    }

    if (filters?.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { slug: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.pageBuilder.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          title: true,
          slug: true,
          description: true,
          isPublished: true,
          isDraft: true,
          publishedAt: true,
          version: true,
          viewCount: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.pageBuilder.count({ where }),
    ])

    return { items, page, perPage, total }
  }

  /**
   * Get page by ID or slug (Public API - optimized)
   * Returns published content only
   * Performance: Single query, uses publishedContent cache
   */
  async getPublishedPage(identifier: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    )

    const where: Prisma.PageBuilderWhereInput = {
      isPublished: true,
      ...(isUUID ? { id: identifier } : { slug: identifier }),
    }

    const pageData = await prisma.pageBuilder.findFirst({
      where,
      select: {
        id: true,
        title: true,
        slug: true,
        description: true,
        publishedContent: true,
        seo: true,
        publishedAt: true,
        version: true,
        cacheKey: true,
      },
    })

    if (!pageData) return null

    this.incrementViewCount(pageData.id).catch(() => {})

    return {
      ...pageData,
      content: pageData.publishedContent,
      publishedContent: undefined,
    }
  }

  /**
   * Get page by ID or slug (Admin API)
   * Returns draft content for editing
   * Performance: Single query, no joins
   */
  async getPage(identifier: string) {
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
      identifier
    )

    const where: Prisma.PageBuilderWhereInput = isUUID ? { id: identifier } : { slug: identifier }

    return await prisma.pageBuilder.findFirst({ where })
  }

  /**
   * Create a new page
   * Performance: Single insert operation
   */
  async createPage(data: {
    title: string
    slug?: string
    description?: string
    content?: any
    seo?: any
    isPublished?: boolean
  }) {
    // Handle slug: auto-generate or purify client-provided slug
    const slug = await handleSlug('pageBuilder', data.title, data.slug)

    const content = data.content ?? { sections: [] }
    const cacheKey = `page:${slug}:v1`

    const page = await prisma.pageBuilder.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        content,
        draftContent: content,
        seo: data.seo ?? {},
        isPublished: data.isPublished ?? false,
        isDraft: true,
        publishedAt: data.isPublished ? new Date() : null,
        publishedContent: data.isPublished ? content : null,
        version: 1,
        cacheKey,
      },
    })

    // Invalidate page cache
    await CacheService.invalidatePattern('public:/pages*')

    return page
  }

  /**
   * Update page
   */
  async updatePage(
    id: string,
    data: {
      title?: string
      slug?: string
      description?: string
      content?: any
      seo?: any
      isPublished?: boolean
    }
  ) {
    const pageData = await prisma.pageBuilder.findUnique({ where: { id } })

    if (!pageData) {
      throw new Error('Page not found')
    }

    const updateData: Prisma.PageBuilderUpdateInput = {}

    if (data.title) updateData.title = data.title
    if (data.description !== undefined) updateData.description = data.description
    if (data.seo !== undefined) updateData.seo = data.seo

    // Handle slug if title or slug is being updated
    if (data.title || data.slug) {
      const title = data.title || pageData.title
      const slug = await handleSlug('pageBuilder', title, data.slug, id)
      updateData.slug = slug
      updateData.cacheKey = `page:${slug}:v${pageData.version + 1}`
      updateData.version = { increment: 1 }
    }

    if (data.content !== undefined) {
      updateData.content = data.content
      updateData.draftContent = data.content
      updateData.isDraft = true
    }

    if (data.isPublished !== undefined) {
      updateData.isPublished = data.isPublished

      if (data.isPublished && !pageData.isPublished) {
        updateData.publishedAt = new Date()
      }
    }

    return await prisma.pageBuilder
      .update({
        where: { id },
        data: updateData,
      })
      .then(async (page) => {
        // Invalidate page cache
        await CacheService.invalidatePattern('public:/pages*')
        return page
      })
  }

  /**
   * Publish page
   */
  async publishPage(id: string) {
    const pageData = await prisma.pageBuilder.findUnique({ where: { id } })

    if (!pageData) {
      throw new Error('Page not found')
    }

    return await prisma.pageBuilder
      .update({
        where: { id },
        data: {
          isPublished: true,
          isDraft: false,
          publishedAt: new Date(),
          publishedContent: pageData.content as any,
          version: { increment: 1 },
          cacheKey: `page:${pageData.slug}:v${pageData.version + 1}`,
          lastCached: null,
        },
      })
      .then(async (page) => {
        // Invalidate page cache
        await CacheService.invalidatePattern('public:/pages*')
        return page
      })
  }

  /**
   * Unpublish page
   */
  async unpublishPage(id: string) {
    const pageData = await prisma.pageBuilder.findUnique({ where: { id } })

    if (!pageData) {
      throw new Error('Page not found')
    }

    return await prisma.pageBuilder.update({
      where: { id },
      data: {
        isPublished: false,
        publishedAt: null,
      },
    })
  }

  /**
   * Delete page
   */
  async deletePage(id: string) {
    const pageData = await prisma.pageBuilder.findUnique({ where: { id } })

    if (!pageData) {
      throw new Error('Page not found')
    }

    await prisma.pageBuilder.delete({ where: { id } })

    // Invalidate page cache
    await CacheService.invalidatePattern('public:/pages*')
  }

  /**
   * Duplicate page
   */
  async duplicatePage(id: string, newTitle?: string, newSlug?: string) {
    const original = await this.getPage(id)

    if (!original) {
      throw new Error('Page not found')
    }

    const title = newTitle ?? `${original.title} (Copy)`

    // Handle slug with auto-suffixing if needed
    const slug = await handleSlug('pageBuilder', title, newSlug)

    return await this.createPage({
      title,
      slug,
      description: original.description ?? undefined,
      content: original.content,
      seo: original.seo as any,
      isPublished: false,
    })
  }

  /**
   * Update content
   */
  async updateContent(id: string, content: any) {
    const pageData = await prisma.pageBuilder.findUnique({ where: { id } })

    if (!pageData) {
      throw new Error('Page not found')
    }

    return await prisma.pageBuilder.update({
      where: { id },
      data: {
        content,
        draftContent: content,
        isDraft: true,
      },
    })
  }

  /**
   * Increment view count
   */
  private async incrementViewCount(id: string) {
    await prisma.pageBuilder.update({
      where: { id },
      data: {
        viewCount: { increment: 1 },
        lastViewed: new Date(),
      },
    })
  }

  /**
   * Get analytics
   */
  async getPageAnalytics(id: string) {
    return await prisma.pageBuilder.findUnique({
      where: { id },
      select: {
        id: true,
        title: true,
        slug: true,
        viewCount: true,
        lastViewed: true,
        createdAt: true,
        updatedAt: true,
        publishedAt: true,
        version: true,
      },
    })
  }

  /**
   * Update cache metadata
   */
  async updateCacheMetadata(id: string, cacheKey: string) {
    await prisma.pageBuilder.update({
      where: { id },
      data: {
        cacheKey,
        lastCached: new Date(),
      },
    })
  }
}

export default new PageBuilderService()
