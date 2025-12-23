import { createError, ErrorMessages } from '@/utils/error-handler'
import { generateTokens, verifyRefreshToken } from '@/utils/jwt'
import { comparePassword, hashPassword } from '@/utils/password'
import prisma from '@/utils/prisma'
import type { AdminLoginInput, RegisterInput } from '@/validators/auth.validator'

export const registerAdminService = async (data: RegisterInput & { roleIds?: string[] }) => {
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

  const createdUser = await prisma.user.create({ data: userData })

  // Remove password from response
  const { password: _, ...user } = createdUser
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

  const permissionNames = permissions.map((p: any) => p.name)
  const isSuperAdmin = user.email === 'superadmin@gmail.com'

  return { user: { ...user, permissions: permissionNames, isSuperAdmin }, ...tokens }
}

export const loginAdminService = async (data: AdminLoginInput) => {
  const { email, password } = data
  const user = await prisma.user.findUnique({ where: { email } })

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

  const permissionNames = permissions.map((p: any) => p.name)
  const isSuperAdmin = user.email === 'superadmin@gmail.com'

  // Remove password from response
  const { password: _, ...safeUser } = user
  const responseUser = { ...safeUser, permissions: permissionNames, isSuperAdmin }

  return { user: responseUser, ...tokens }
}

export const refreshAdminService = async (data: { refreshToken: string }) => {
  const { refreshToken } = data || {}
  if (!refreshToken) throw createError('Refresh token required', 400, 'MISSING_TOKEN')

  let payload: any
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch (e) {
    throw createError('Invalid or expired refresh token', 401, 'INVALID_TOKEN')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id as string } })

  if (!user || !user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('Admin'), 404, 'NOT_FOUND')

  // Remove password from response
  const { password: _, ...safeUser } = user
  const tokens = generateTokens({ id: safeUser.id, isAdmin: true })

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

  const permissionNames = permissions.map((p: any) => p.name)
  const isSuperAdmin = safeUser.email === 'superadmin@gmail.com'

  return { user: { ...safeUser, permissions: permissionNames, isSuperAdmin }, ...tokens }
}

export const logoutAdminService = async (_data: unknown) => {
  // Stateless logout. Client should delete tokens.
  return { revoked: true }
}

export const getAdminProfileService = async (userId?: string) => {
  if (!userId) throw createError(ErrorMessages.UNAUTHORIZED, 401, 'UNAUTHORIZED')

  const user = await prisma.user.findUnique({ where: { id: userId } })

  if (!user || !user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('Admin'), 404, 'NOT_FOUND')

  // Remove password from response
  const { password: _, ...safeUser } = user

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

  const permissionNames = permissions.map((p: any) => p.name)
  const isSuperAdmin = safeUser.email === 'superadmin@gmail.com'

  return { ...safeUser, permissions: permissionNames, isSuperAdmin }
}

export const resetPasswordAdminService = async (data: { email: string; newPassword: string }) => {
  const { email, newPassword } = data || {}
  if (!email || !newPassword)
    throw createError('Email and newPassword are required', 400, 'VALIDATION_ERROR')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || !user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('Admin'), 404, 'NOT_FOUND')

  const hashed = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  return { message: 'Admin password updated' }
}

export const changePasswordAdminService = async (
  userId: string | undefined,
  data: { currentPassword: string; newPassword: string }
) => {
  if (!userId) throw createError(ErrorMessages.UNAUTHORIZED, 401, 'UNAUTHORIZED')

  const { currentPassword, newPassword } = data || {}
  if (!currentPassword || !newPassword)
    throw createError('currentPassword and newPassword are required', 400, 'VALIDATION_ERROR')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || !user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('Admin'), 404, 'NOT_FOUND')

  const valid = await comparePassword(currentPassword, user.password)
  if (!valid) throw createError('Old password is incorrect', 400, 'INVALID_PASSWORD')

  const hashed = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  return { message: 'Admin password changed' }
}
