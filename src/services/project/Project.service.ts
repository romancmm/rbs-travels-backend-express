import prisma from '@/config/db'
import CacheService from '@/services/cache.service'
import { createError, ErrorMessages } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import { handleSlug } from '@/utils/slug.util'
import type {
  CreateProjectInput,
  ProjectQueryParams,
  UpdateProjectInput,
} from '@/validators/project.validator'

export const listProjectsService = async (params: ProjectQueryParams = {}) => {
  const { page = 1, perPage = 10, q, category, tag, isPublished, isFeatured } = params
  const { skip, take } = paginate(page, perPage)
  const where: any = {}

  if (typeof isPublished === 'boolean') where.isPublished = isPublished
  if (typeof isFeatured === 'boolean') where.isFeatured = isFeatured
  if (category) where.category = { contains: category, mode: 'insensitive' }
  if (tag) where.tags = { has: tag }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } },
      { content: { contains: q, mode: 'insensitive' } },
      { client: { contains: q, mode: 'insensitive' } },
    ]
  }

  const [items, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take,
      orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
    }),
    prisma.project.count({ where }),
  ])
  return { items, page, perPage, total }
}

export const getProjectByIdService = async (id: string) => {
  const project = await prisma.project.findUnique({ where: { id } })
  if (!project) throw createError(ErrorMessages.NOT_FOUND('Project'), 404, 'NOT_FOUND')
  return project
}

export const getProjectBySlugService = async (slug: string) => {
  const project = await prisma.project.findUnique({ where: { slug } })
  if (!project) throw createError(ErrorMessages.NOT_FOUND('Project'), 404, 'NOT_FOUND')
  return project
}

export const createProjectService = async (data: CreateProjectInput) => {
  // Handle slug: auto-generate or purify client-provided slug
  const slug = await handleSlug('project', data.title, data.slug)

  const project = await prisma.project.create({
    data: {
      ...data,
      slug,
    },
  })

  // Invalidate project cache
  await CacheService.invalidatePattern('public:/projects*')

  return project
}

export const updateProjectService = async (id: string, data: UpdateProjectInput) => {
  // Handle slug if title or slug is being updated
  let slug = data.slug
  if (data.title || data.slug) {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) throw createError(ErrorMessages.NOT_FOUND('Project'), 404, 'NOT_FOUND')

    const title = data.title || project.title
    slug = await handleSlug('project', title, data.slug, id)
  }

  const project = await prisma.project.update({
    where: { id },
    data: {
      ...data,
      ...(slug && { slug }),
    },
  })

  // Invalidate project cache
  await CacheService.invalidatePattern('public:/projects*')

  return project
}

export const deleteProjectService = async (id: string) => {
  await prisma.project.delete({ where: { id } })

  // Invalidate project cache
  await CacheService.invalidatePattern('public:/projects*')

  return { id, deleted: true }
}
