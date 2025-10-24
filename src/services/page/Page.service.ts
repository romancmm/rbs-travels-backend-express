import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
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
  if (!page) throw Object.assign(new Error('Page not found'), { status: 404 })
  return page
}

export const createPageService = async (data: CreatePageInput) => {
  const payload: any = { ...data }
  if (payload.content === null) payload.content = Prisma.JsonNull
  if (payload.meta === null) payload.meta = Prisma.JsonNull
  const page = await prisma.page.create({ data: payload })
  return page
}

export const updatePageService = async (id: string, data: UpdatePageInput) => {
  const payload: any = { ...data }
  if ('content' in payload && payload.content === null) payload.content = Prisma.JsonNull
  if ('meta' in payload && payload.meta === null) payload.meta = Prisma.JsonNull
  const page = await prisma.page.update({ where: { id }, data: payload })
  return page
}

export const deletePageService = async (id: string) => {
  await prisma.page.delete({ where: { id } })
  return { id, deleted: true }
}
