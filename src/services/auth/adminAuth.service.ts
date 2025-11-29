import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { generateTokens, verifyRefreshToken } from '@/utils/jwt'
import { comparePassword, hashPassword } from '@/utils/password'
import prisma from '@/utils/prisma'
import type { AdminLoginInput, RegisterInput } from '@/validators/auth.validator'

export const registerAdminService = async (data: RegisterInput & { roleIds?: string[] }) => {
  try {
    const { name, email, password, avatar, roleIds } = data
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists)
      throw createError(ErrorMessages.ALREADY_EXISTS('User', 'email'), 409, 'DUPLICATE_ENTRY')

    const hashed = await hashPassword(password)
    const userData: any = {
      name,
      email,
      password: hashed,
      avatar,
      isAdmin: true,
    }

    if (roleIds && roleIds.length > 0) {
      userData.roles = {
        connect: roleIds.map((id) => ({ id })),
      }
    }

    const user = await prisma.user.create({
      data: userData,
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    const tokens = generateTokens({ id: user.id, isAdmin: true })

    // Fetch permissions separately (more efficient than including full roles)
    const permissions = await prisma.permission.findMany({
      where: {
        roles: {
          some: {
            users: {
              some: {
                id: user.id,
              },
            },
          },
        },
      },
      select: {
        name: true,
      },
    })

    const permissionNames = permissions.map((p) => p.name)
    const isSuperAdmin = user.email === 'superadmin@gmail.com'

    return { user: { ...user, permissions: permissionNames, isSuperAdmin }, ...tokens }
  } catch (error) {
    handleServiceError(error, 'Admin')
  }
}

export const loginAdminService = async (data: AdminLoginInput) => {
  try {
    const { email, password } = data
    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        name: true,
        email: true,
        password: true,
        avatar: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    })
    if (!user || !user.isAdmin)
      throw createError(ErrorMessages.INVALID_CREDENTIALS, 401, 'INVALID_CREDENTIALS')

    const valid = await comparePassword(password, user.password)
    if (!valid) throw createError(ErrorMessages.INVALID_CREDENTIALS, 401, 'INVALID_CREDENTIALS')

    const tokens = generateTokens({ id: user.id, isAdmin: true })

    // Fetch permissions separately (more efficient than including full roles)
    const permissions = await prisma.permission.findMany({
      where: {
        roles: {
          some: {
            users: {
              some: {
                id: user.id,
              },
            },
          },
        },
      },
      select: {
        name: true,
      },
    })

    const permissionNames = permissions.map((p) => p.name)
    const isSuperAdmin = user.email === 'superadmin@gmail.com'

    // Remove password from response
    const { password: _, ...safeUser } = user
    const responseUser = { ...safeUser, permissions: permissionNames, isSuperAdmin }

    return { user: responseUser, ...tokens }
  } catch (error) {
    handleServiceError(error, 'Admin Authentication')
  }
}

export const refreshAdminService = async (data: { refreshToken: string }) => {
  try {
    const { refreshToken } = data || {}
    if (!refreshToken) throw createError('Refresh token required', 400, 'MISSING_TOKEN')

    let payload: any
    try {
      payload = verifyRefreshToken(refreshToken)
    } catch (e) {
      throw createError('Invalid or expired refresh token', 401, 'INVALID_TOKEN')
    }

    const user = await prisma.user.findUnique({
      where: { id: payload.id as string },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user || !user.isAdmin)
      throw createError(ErrorMessages.NOT_FOUND('Admin'), 404, 'NOT_FOUND')

    const tokens = generateTokens({ id: user.id, isAdmin: true })

    // Fetch permissions
    const permissions = await prisma.permission.findMany({
      where: {
        roles: {
          some: {
            users: {
              some: {
                id: user.id,
              },
            },
          },
        },
      },
      select: {
        name: true,
      },
    })

    const permissionNames = permissions.map((p) => p.name)
    const isSuperAdmin = user.email === 'superadmin@gmail.com'

    return { user: { ...user, permissions: permissionNames, isSuperAdmin }, ...tokens }
  } catch (error) {
    handleServiceError(error, 'Admin Token Refresh')
  }
}

export const logoutAdminService = async (_data: unknown) => {
  // Stateless logout. Client should delete tokens.
  return { revoked: true }
}

export const getAdminProfileService = async (userId?: string) => {
  try {
    if (!userId) throw createError(ErrorMessages.UNAUTHORIZED, 401, 'UNAUTHORIZED')

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        isAdmin: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    if (!user || !user.isAdmin)
      throw createError(ErrorMessages.NOT_FOUND('Admin'), 404, 'NOT_FOUND')

    // Fetch permissions
    const permissions = await prisma.permission.findMany({
      where: {
        roles: {
          some: {
            users: {
              some: {
                id: user.id,
              },
            },
          },
        },
      },
      select: {
        name: true,
      },
    })

    const permissionNames = permissions.map((p) => p.name)
    const isSuperAdmin = user.email === 'superadmin@gmail.com'

    return { ...user, permissions: permissionNames, isSuperAdmin }
  } catch (error) {
    handleServiceError(error, 'Admin')
  }
}

export const resetPasswordAdminService = async (data: { email: string; newPassword: string }) => {
  try {
    const { email, newPassword } = data || {}
    if (!email || !newPassword)
      throw createError('Email and newPassword are required', 400, 'VALIDATION_ERROR')

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || !user.isAdmin)
      throw createError(ErrorMessages.NOT_FOUND('Admin'), 404, 'NOT_FOUND')

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    return { message: 'Admin password updated' }
  } catch (error) {
    handleServiceError(error, 'Admin Password Reset')
  }
}

export const changePasswordAdminService = async (
  userId: string | undefined,
  data: { oldPassword: string; newPassword: string }
) => {
  try {
    if (!userId) throw createError(ErrorMessages.UNAUTHORIZED, 401, 'UNAUTHORIZED')

    const { oldPassword, newPassword } = data || {}
    if (!oldPassword || !newPassword)
      throw createError('oldPassword and newPassword are required', 400, 'VALIDATION_ERROR')

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || !user.isAdmin)
      throw createError(ErrorMessages.NOT_FOUND('Admin'), 404, 'NOT_FOUND')

    const valid = await comparePassword(oldPassword, user.password)
    if (!valid) throw createError('Old password is incorrect', 400, 'INVALID_PASSWORD')

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    return { message: 'Admin password changed' }
  } catch (error) {
    handleServiceError(error, 'Admin Password Change')
  }
}
