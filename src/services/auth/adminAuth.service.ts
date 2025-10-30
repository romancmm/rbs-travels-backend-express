import { generateTokens } from '@/utils/jwt'
import { comparePassword, hashPassword } from '@/utils/password'
import prisma from '@/utils/prisma'
import type { AdminLoginInput, RegisterInput } from '@/validators/auth.validator'

export const registerAdminService = async (data: RegisterInput & { roleIds?: string[] }) => {
  const { name, email, password, avatar, roleIds } = data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new Error('Email already exists')

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
    include: { roles: { include: { permissions: true } } },
  })
  const tokens = generateTokens({ id: user.id, isAdmin: true })

  // Compute combined permissions
  const permissions = Array.from(
    new Set(user.roles.flatMap((r) => r.permissions.map((p) => p.name)))
  )
  const isSuperAdmin = user.email === 'superadmin@gmail.com'

  return { user: { ...user, permissions, isSuperAdmin }, ...tokens }
}

export const loginAdminService = async (data: AdminLoginInput) => {
  const { email, password } = data
  const user = await prisma.user.findUnique({
    where: { email },
    include: { roles: { include: { permissions: true } } },
  })
  if (!user || !user.isAdmin) throw new Error('Invalid credentials')

  const valid = await comparePassword(password, user.password)
  if (!valid) throw new Error('Invalid credentials')

  const tokens = generateTokens({ id: user.id, isAdmin: true })

  // Get all roles and combine permissions from all roles
  const roles = user.roles || []
  const permissions = Array.from(
    new Set(
      roles.flatMap((r: any) =>
        Array.isArray(r.permissions) ? r.permissions.map((p: any) => p.name) : []
      )
    )
  )
  const isSuperAdmin = user.email === 'superadmin@gmail.com'
  const responseUser = { ...user, roles, permissions, isSuperAdmin }
  return { user: responseUser, ...tokens }
}
