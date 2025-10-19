import { generateTokens } from '@/utils/jwt'
import { comparePassword, hashPassword } from '@/utils/password'
import prisma from '@/utils/prisma'

export const registerCustomerService = async (data: any) => {
 const { name, email, password } = data
 const exists = await prisma.user.findUnique({ where: { email } })
 if (exists) throw new Error('Email already exists')

 const hashed = await hashPassword(password)
 const user = await prisma.user.create({
  data: { name, email, password: hashed, isAdmin: false },
 })
 const tokens = generateTokens({ id: user.id, isAdmin: false })
 return { user, ...tokens }
}

export const loginCustomerService = async (data: any) => {
 const { email, password } = data
 const user = await prisma.user.findUnique({ where: { email } })
 if (!user || user.isAdmin) throw new Error('Invalid credentials')

 const valid = await comparePassword(password, user.password)
 if (!valid) throw new Error('Invalid credentials')

 const tokens = generateTokens({ id: user.id, isAdmin: false })
 return { user, ...tokens }
}
