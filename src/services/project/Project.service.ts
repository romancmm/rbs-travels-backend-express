import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
import type {
  CreateProjectInput,
  ProjectQueryParams,
  UpdateProjectInput,
} from '@/validators/project.validator'

export const listProjectsService = async (params: ProjectQueryParams = {}) => {
  try {
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
  } catch (error) {
    handleServiceError(error, 'Project')
  }
}

export const getProjectByIdService = async (id: string) => {
  try {
    const project = await prisma.project.findUnique({ where: { id } })
    if (!project) throw createError(ErrorMessages.NOT_FOUND('Project'), 404, 'NOT_FOUND')
    return project
  } catch (error) {
    handleServiceError(error, 'Project')
  }
}

export const getProjectBySlugService = async (slug: string) => {
  try {
    const project = await prisma.project.findUnique({ where: { slug } })
    if (!project) throw createError(ErrorMessages.NOT_FOUND('Project'), 404, 'NOT_FOUND')
    return project
  } catch (error) {
    handleServiceError(error, 'Project')
  }
}

export const createProjectService = async (data: CreateProjectInput) => {
  try {
    const project = await prisma.project.create({ data })
    return project
  } catch (error) {
    handleServiceError(error, 'Project')
  }
}

export const updateProjectService = async (id: string, data: UpdateProjectInput) => {
  try {
    const project = await prisma.project.update({ where: { id }, data })
    return project
  } catch (error) {
    handleServiceError(error, 'Project')
  }
}

export const deleteProjectService = async (id: string) => {
  try {
    await prisma.project.delete({ where: { id } })
    return { id, deleted: true }
  } catch (error) {
    handleServiceError(error, 'Project')
  }
}
