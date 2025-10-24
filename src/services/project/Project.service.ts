import { paginate } from '@/utils/paginator'
import prisma from '@/utils/prisma'
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
  if (!project) throw Object.assign(new Error('Project not found'), { status: 404 })
  return project
}

export const getProjectBySlugService = async (slug: string) => {
  const project = await prisma.project.findUnique({ where: { slug } })
  if (!project) throw Object.assign(new Error('Project not found'), { status: 404 })
  return project
}

export const createProjectService = async (data: CreateProjectInput) => {
  const project = await prisma.project.create({ data })
  return project
}

export const updateProjectService = async (id: string, data: UpdateProjectInput) => {
  const project = await prisma.project.update({ where: { id }, data })
  return project
}

export const deleteProjectService = async (id: string) => {
  await prisma.project.delete({ where: { id } })
  return { id, deleted: true }
}
