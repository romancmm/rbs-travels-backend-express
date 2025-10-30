import { generateTokens } from '@/utils/jwt'
import { comparePassword, hashPassword } from '@/utils/password'
import prisma from '@/utils/prisma'
import type { AdminLoginInput, RegisterInput } from '@/validators/auth.validator'

export const registerAdminService = async (data: RegisterInput & { roleId?: string | null }) => {
  const { name, email, password, avatar, roleId } = data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists) throw new Error('Email already exists')

  const hashed = await hashPassword(password)
  const user = await prisma.user.create({
    data: { name, email, password: hashed, avatar, isAdmin: true, roleId },
    include: { role: { include: { permissions: true } } },
  })
  const tokens = generateTokens({ id: user.id, isAdmin: true })
  return { user, ...tokens }
}

export const loginAdminService = async (data: AdminLoginInput) => {
  const { email, password } = data
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: { include: { permissions: true } } },
  })
  if (!user || !user.isAdmin) throw new Error('Invalid credentials')

  const valid = await comparePassword(password, user.password)
  if (!valid) throw new Error('Invalid credentials')

  const tokens = generateTokens({ id: user.id, isAdmin: true })
  // Compute roles array and permissions list (supports current single-role schema)
  const roles = user.role ? [user.role] : (user as any).roles || []
  const permissions = Array.from(
    new Set(
      roles.flatMap((r: any) =>
        Array.isArray(r.permissions) ? r.permissions.map((p: any) => p.name) : []
      )
    )
  )
  const isSuperAdmin = user.email === 'admin@gmail.com'
  const responseUser = { ...user, roles, permissions, isSuperAdmin }
  return { user: responseUser, ...tokens }
}
