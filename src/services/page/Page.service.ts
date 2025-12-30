import prisma from '@/config/db'
import CacheService from '@/services/cache.service'
import { createError, ErrorMessages } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import { handleSlug } from '@/utils/slug.util'
import type { CreatePageInput, PageQueryParams, UpdatePageInput } from '@/validators/page.validator'
import { Prisma } from '@prisma/client'

export const listPagesService = async (params: PageQueryParams = {}) => {
  const { page = 1, perPage = 10, q, isPublished } = params
  const { skip, take } = paginate(page, perPage)
  const where: any = {}
  if (typeof isPublished === 'boolean') where.isPublished = isPublished
  if (q)
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { slug: { contains: q, mode: 'insensitive' } },
    ]
  const [items, total] = await Promise.all([
    prisma.page.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } }),
    prisma.page.count({ where }),
  ])
  return { items, page, perPage, total }
}

export const getPageByIdService = async (id: string) => {
  const page = await prisma.page.findUnique({ where: { id } })
  if (!page) throw createError(ErrorMessages.NOT_FOUND('Page'), 404, 'NOT_FOUND')
  return page
}

export const createPageService = async (data: CreatePageInput) => {
  // Handle slug: auto-generate or purify client-provided slug
  const slug = await handleSlug('page', data.title, data.slug)

  const payload: any = { ...data, slug }
  if (payload.content === null) payload.content = Prisma.JsonNull
  if (payload.meta === null) payload.meta = Prisma.JsonNull
  const page = await prisma.page.create({ data: payload })

  // Invalidate page cache
  await CacheService.invalidatePattern('public:/page*')

  return page
}

export const updatePageService = async (id: string, data: UpdatePageInput) => {
  // Handle slug if title or slug is being updated
  let slug = data.slug
  if (data.title || data.slug) {
    const page = await prisma.page.findUnique({ where: { id } })
    if (!page) throw createError(ErrorMessages.NOT_FOUND('Page'), 404, 'NOT_FOUND')

    const title = data.title || page.title
    slug = await handleSlug('page', title, data.slug, id)
  }

  const payload: any = { ...data, ...(slug && { slug }) }
  if ('content' in payload && payload.content === null) payload.content = Prisma.JsonNull
  if ('meta' in payload && payload.meta === null) payload.meta = Prisma.JsonNull
  const page = await prisma.page.update({ where: { id }, data: payload })

  // Invalidate page cache
  await CacheService.invalidatePattern('public:/page*')

  return page
}

export const deletePageService = async (id: string) => {
  await prisma.page.delete({ where: { id } })

  // Invalidate page cache
  await CacheService.invalidatePattern('public:/page*')

  return { id, deleted: true }
}
