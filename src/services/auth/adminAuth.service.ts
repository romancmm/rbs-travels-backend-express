import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { generateTokens } from '@/utils/jwt'
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
