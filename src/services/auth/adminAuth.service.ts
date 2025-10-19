import { generateTokens } from '@/utils/jwt'
import { comparePassword, hashPassword } from '@/utils/password'
import prisma from '@/utils/prisma'

export const registerAdminService = async (data: any) => {
 const { name, email, password, roleId } = data
 const exists = await prisma.user.findUnique({ where: { email } })
 if (exists) throw new Error('Email already exists')

 const hashed = await hashPassword(password)
 const user = await prisma.user.create({
  data: { name, email, password: hashed, isAdmin: true, roleId },
  include: { role: { include: { permissions: true } } },
 })
 const tokens = generateTokens({ id: user.id, isAdmin: true })
 return { user, ...tokens }
}

export const loginAdminService = async (data: any) => {
 const { email, password } = data
 const user = await prisma.user.findUnique({
  where: { email },
  include: { role: { include: { permissions: true } } },
 })
 if (!user || !user.isAdmin) throw new Error('Invalid credentials')

 const valid = await comparePassword(password, user.password)
 if (!valid) throw new Error('Invalid credentials')

 const tokens = generateTokens({ id: user.id, isAdmin: true })
 return { user, ...tokens }
}
