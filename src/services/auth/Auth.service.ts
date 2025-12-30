import prisma from '@/config/db'
import { createError, ErrorMessages } from '@/utils/error-handler'
import { generateTokens, verifyRefreshToken } from '@/utils/jwt'
import { comparePassword, hashPassword } from '@/utils/password'
import type {
  ChangePasswordInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordRequestInput,
} from '@/validators/auth.validator'

export const registerCustomerService = async (data: RegisterInput) => {
  const { name, email, password, avatar } = data
  const exists = await prisma.user.findUnique({ where: { email } })
  if (exists)
    throw createError(ErrorMessages.ALREADY_EXISTS('User', 'email'), 409, 'DUPLICATE_ENTRY')

  const hashed = await hashPassword(password)
  const createdUser = await prisma.user.create({
    data: { name, email, password: hashed, avatar, isAdmin: false },
  })

  // Remove password from response
  const { password: _, ...user } = createdUser
  const tokens = generateTokens({ id: user.id, isAdmin: false })
  return { user, ...tokens }
}

export const loginCustomerService = async (data: LoginInput) => {
  const { email, password } = data
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.isAdmin)
    throw createError(ErrorMessages.INVALID_CREDENTIALS, 401, 'INVALID_CREDENTIALS')

  const valid = await comparePassword(password, user.password)
  if (!valid) throw createError(ErrorMessages.INVALID_CREDENTIALS, 401, 'INVALID_CREDENTIALS')

  // Remove password from response
  const { password: _, ...safeUser } = user
  const tokens = generateTokens({ id: safeUser.id, isAdmin: false })
  return { user: safeUser, ...tokens }
}

export const refreshCustomerService = async (data: RefreshTokenInput) => {
  const { refreshToken } = data || ({} as RefreshTokenInput)
  if (!refreshToken) throw createError('Refresh token required', 400, 'MISSING_TOKEN')

  let payload: any
  try {
    payload = verifyRefreshToken(refreshToken)
  } catch (e) {
    throw createError('Invalid or expired refresh token', 401, 'INVALID_TOKEN')
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id as string } })
  if (!user || user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('User'), 404, 'NOT_FOUND')

  const tokens = generateTokens({ id: user.id, isAdmin: false })
  return { user, ...tokens }
}

export const logoutCustomerService = async (_data: unknown) => {
  // Stateless logout. Client should delete tokens. No persistence used.
  return { revoked: true }
}

export const getCustomerProfileService = async (userId?: string) => {
  if (!userId) throw createError(ErrorMessages.UNAUTHORIZED, 401, 'UNAUTHORIZED')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('User'), 404, 'NOT_FOUND')

  const { password, ...safe } = user as any
  return safe
}

export const resetPasswordCustomerService = async (data: ResetPasswordRequestInput) => {
  const { email, newPassword } = data || ({} as ResetPasswordRequestInput)
  if (!email || !newPassword)
    throw createError('Email and newPassword are required', 400, 'VALIDATION_ERROR')

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('User'), 404, 'NOT_FOUND')

  const hashed = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  return { message: 'Password updated' }
}

export const changePasswordCustomerService = async (
  userId: string | undefined,
  data: ChangePasswordInput
) => {
  if (!userId) throw createError(ErrorMessages.UNAUTHORIZED, 401, 'UNAUTHORIZED')

  const { currentPassword, newPassword } = data || {}
  if (!currentPassword || !newPassword)
    throw createError('currentPassword and newPassword are required', 400, 'VALIDATION_ERROR')

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user || user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('User'), 404, 'NOT_FOUND')

  const valid = await comparePassword(currentPassword, user.password)
  if (!valid) throw createError('Old password is incorrect', 400, 'INVALID_PASSWORD')

  const hashed = await hashPassword(newPassword)
  await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
  return { message: 'Password changed' }
}
