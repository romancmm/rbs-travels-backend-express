import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import type { CreatePageInput, PageQueryParams, UpdatePageInput } from '@/validators/page.validator'
import { Prisma } from '@prisma/client'

export const listPagesService = async (params: PageQueryParams = {}) => {
  try {
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
  } catch (error) {
    handleServiceError(error, 'Page')
  }
}

export const getPageByIdService = async (id: string) => {
  try {
    const page = await prisma.page.findUnique({ where: { id } })
    if (!page) throw createError(ErrorMessages.NOT_FOUND('Page'), 404, 'NOT_FOUND')
    return page
  } catch (error) {
    handleServiceError(error, 'Page')
  }
}

export const createPageService = async (data: CreatePageInput) => {
  try {
    const payload: any = { ...data }
    if (payload.content === null) payload.content = Prisma.JsonNull
    if (payload.meta === null) payload.meta = Prisma.JsonNull
    const page = await prisma.page.create({ data: payload })
    return page
  } catch (error) {
    handleServiceError(error, 'Page')
  }
}

export const updatePageService = async (id: string, data: UpdatePageInput) => {
  try {
    const payload: any = { ...data }
    if ('content' in payload && payload.content === null) payload.content = Prisma.JsonNull
    if ('meta' in payload && payload.meta === null) payload.meta = Prisma.JsonNull
    const page = await prisma.page.update({ where: { id }, data: payload })
    return page
  } catch (error) {
    handleServiceError(error, 'Page')
  }
}

export const deletePageService = async (id: string) => {
  try {
    await prisma.page.delete({ where: { id } })
    return { id, deleted: true }
  } catch (error) {
    handleServiceError(error, 'Page')
  }
}
