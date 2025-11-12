import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { paginate } from '@/utils/paginator'
import { hashPassword } from '@/utils/password'
import prisma from '@/utils/prisma'
import type { CreateUserInput, UpdateUserInput, UserQueryParams } from '@/validators/user.validator'

// List admin/staff users (User model represents admin users, not customers)
export const listAdminsService = async (params: UserQueryParams = {}) => {
  try {
    const { page = 1, perPage = 10, q, isActive, isAdmin, roleId } = params as any
    const { skip, take } = paginate(page, perPage)
    const where: any = {}

    if (typeof isActive === 'boolean') where.isActive = isActive
    if (typeof isAdmin === 'boolean') where.isAdmin = isAdmin
    if (roleId) {
      // Filter users who have this specific role
      where.roles = { some: { id: roleId } }
    }
    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
      ]
    }

    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          avatar: true,
          isActive: true,
          isAdmin: true,
          roles: {
            select: {
              id: true,
              name: true,
              permissions: { select: { id: true, name: true } },
            },
          },
          createdAt: true,
          updatedAt: true,
        },
      }),
      prisma.user.count({ where }),
    ])
    return { items, page, perPage, total }
  } catch (error) {
    handleServiceError(error, 'User')
  }
}

export const getAdminByIdService = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        isAdmin: true,
        roles: {
          select: {
            id: true,
            name: true,
            permissions: { select: { id: true, name: true } },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user) throw createError(ErrorMessages.NOT_FOUND('User'), 404, 'NOT_FOUND')
    return user
  } catch (error) {
    handleServiceError(error, 'User')
  }
}

export const createAdminService = async (data: CreateUserInput) => {
  try {
    const { name, email, password, avatar, isActive, isAdmin, roleIds } =
      data || ({} as CreateUserInput)

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      throw createError(ErrorMessages.ALREADY_EXISTS('User', 'email'), 409, 'DUPLICATE_ENTRY')
    }

    const hashedPassword = await hashPassword(password)
    const payload: any = {
      name,
      email,
      password: hashedPassword,
    }

    if (avatar !== undefined) payload.avatar = avatar
    if (typeof isActive === 'boolean') payload.isActive = isActive
    if (typeof isAdmin === 'boolean') payload.isAdmin = isAdmin

    // Only assign roles if user is an admin (isAdmin = true)
    if (isAdmin && roleIds && roleIds.length > 0) {
      payload.roles = {
        connect: roleIds.map((id) => ({ id })),
      }
    }

    const user = await prisma.user.create({
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        isAdmin: true,
        roles: {
          select: {
            id: true,
            name: true,
            permissions: { select: { id: true, name: true } },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })
    return user
  } catch (error) {
    handleServiceError(error, 'User')
  }
}

export const updateAdminService = async (id: string, data: UpdateUserInput) => {
  try {
    const { name, email, password, avatar, isActive, isAdmin, roleIds } =
      data || ({} as UpdateUserInput)
    const payload: any = {}

    if (name !== undefined) payload.name = name
    if (email !== undefined) {
      // Check if email is taken by another user
      const existingUser = await prisma.user.findUnique({ where: { email } })
      if (existingUser && existingUser.id !== id) {
        throw createError(ErrorMessages.ALREADY_EXISTS('User', 'email'), 409, 'DUPLICATE_ENTRY')
      }
      payload.email = email
    }
    if (password !== undefined) {
      payload.password = await hashPassword(password)
    }
    if (avatar !== undefined) payload.avatar = avatar
    if (typeof isActive === 'boolean') payload.isActive = isActive
    if (typeof isAdmin === 'boolean') payload.isAdmin = isAdmin

    // Get current user to check if they're an admin
    const currentUser = await prisma.user.findUnique({ where: { id } })
    if (!currentUser) throw createError(ErrorMessages.NOT_FOUND('User'), 404, 'NOT_FOUND')

    // Only update roles if user is/will be an admin
    const willBeAdmin = isAdmin !== undefined ? isAdmin : currentUser.isAdmin
    if (willBeAdmin && roleIds !== undefined) {
      payload.roles = {
        set: roleIds.map((roleId) => ({ id: roleId })),
      }
    } else if (!willBeAdmin && roleIds !== undefined) {
      // If user is being demoted from admin, clear all roles
      payload.roles = { set: [] }
    }

    const user = await prisma.user.update({
      where: { id },
      data: payload,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        isAdmin: true,
        roles: {
          select: {
            id: true,
            name: true,
            permissions: { select: { id: true, name: true } },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })
    return user
  } catch (error) {
    handleServiceError(error, 'User')
  }
}

export const deleteAdminService = async (id: string) => {
  try {
    await prisma.user.delete({ where: { id } })
    return { id, deleted: true }
  } catch (error) {
    handleServiceError(error, 'User')
  }
}

export const toggleAdminStatusService = async (id: string) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } })
    if (!user) throw createError(ErrorMessages.NOT_FOUND('User'), 404, 'NOT_FOUND')

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        isAdmin: true,
        roles: {
          select: {
            id: true,
            name: true,
            permissions: { select: { id: true, name: true } },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })
    return updated
  } catch (error) {
    handleServiceError(error, 'User')
  }
}

export const assignRolesToAdminService = async (userId: string, roleIds: string[]) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        roles: {
          set: roleIds.map((id) => ({ id })),
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        isAdmin: true,
        roles: {
          select: {
            id: true,
            name: true,
            permissions: { select: { id: true, name: true } },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })
    return user
  } catch (error) {
    handleServiceError(error, 'User')
  }
}
