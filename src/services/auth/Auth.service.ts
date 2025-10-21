import { generateTokens, verifyRefreshToken } from '@/utils/jwt'
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

export const refreshCustomerService = async (data: any) => {
 const { refreshToken } = data || {}
 if (!refreshToken) throw new Error('Refresh token required')
 let payload: any
 try {
  payload = verifyRefreshToken(refreshToken)
 } catch (e) {
  throw new Error('Invalid or expired refresh token')
 }
 const user = await prisma.user.findUnique({ where: { id: payload.id as string } })
 if (!user || user.isAdmin) throw new Error('User not found')
 const tokens = generateTokens({ id: user.id, isAdmin: false })
 return { user, ...tokens }
}

export const logoutCustomerService = async (_data: any) => {
 // Stateless logout. Client should delete tokens. No persistence used.
 return { revoked: true }
}

export const getCustomerProfileService = async (userId?: string) => {
 if (!userId) throw new Error('Unauthorized')
 const user = await prisma.user.findUnique({ where: { id: userId } })
 if (!user || user.isAdmin) throw new Error('User not found')
 // omit password
 const { password, ...safe } = user as any
 return safe
}

export const resetPasswordCustomerService = async (data: any) => {
 const { email, newPassword } = data || {}
 if (!email || !newPassword)
  throw new Error('Email and newPassword are required')
 const user = await prisma.user.findUnique({ where: { email } })
 if (!user || user.isAdmin) throw new Error('User not found')
 const hashed = await hashPassword(newPassword)
 await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
 return { message: 'Password updated' }
}

export const changePasswordCustomerService = async (
 userId: string | undefined,
 data: any,
) => {
 if (!userId) throw new Error('Unauthorized')
 const { oldPassword, newPassword } = data || {}
 if (!oldPassword || !newPassword)
  throw new Error('oldPassword and newPassword are required')
 const user = await prisma.user.findUnique({ where: { id: userId } })
 if (!user || user.isAdmin) throw new Error('User not found')
 const valid = await comparePassword(oldPassword, user.password)
 if (!valid) throw new Error('Old password is incorrect')
 const hashed = await hashPassword(newPassword)
 await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
 return { message: 'Password changed' }
}
