import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import { generateTokens, verifyRefreshToken } from '@/utils/jwt'
import { comparePassword, hashPassword } from '@/utils/password'
import prisma from '@/utils/prisma'
import type {
  ChangePasswordInput,
  LoginInput,
  RefreshTokenInput,
  RegisterInput,
  ResetPasswordRequestInput,
} from '@/validators/auth.validator'

export const registerCustomerService = async (data: RegisterInput) => {
  try {
    const { name, email, password, avatar } = data
    const exists = await prisma.user.findUnique({ where: { email } })
    if (exists)
      throw createError(ErrorMessages.ALREADY_EXISTS('User', 'email'), 409, 'DUPLICATE_ENTRY')

    const hashed = await hashPassword(password)
    const user = await prisma.user.create({
      data: { name, email, password: hashed, avatar, isAdmin: false },
    })
    const tokens = generateTokens({ id: user.id, isAdmin: false })
    return { user, ...tokens }
  } catch (error) {
    handleServiceError(error, 'User')
  }
}

export const loginCustomerService = async (data: LoginInput) => {
  try {
    const { email, password } = data
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.isAdmin)
      throw createError(ErrorMessages.INVALID_CREDENTIALS, 401, 'INVALID_CREDENTIALS')

    const valid = await comparePassword(password, user.password)
    if (!valid) throw createError(ErrorMessages.INVALID_CREDENTIALS, 401, 'INVALID_CREDENTIALS')

    const tokens = generateTokens({ id: user.id, isAdmin: false })
    return { user, ...tokens }
  } catch (error) {
    handleServiceError(error, 'Authentication')
  }
}

export const refreshCustomerService = async (data: RefreshTokenInput) => {
  try {
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
  } catch (error) {
    handleServiceError(error, 'Authentication')
  }
}

export const logoutCustomerService = async (_data: unknown) => {
  // Stateless logout. Client should delete tokens. No persistence used.
  return { revoked: true }
}

export const getCustomerProfileService = async (userId?: string) => {
  try {
    if (!userId) throw createError(ErrorMessages.UNAUTHORIZED, 401, 'UNAUTHORIZED')

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('User'), 404, 'NOT_FOUND')

    const { password, ...safe } = user as any
    return safe
  } catch (error) {
    handleServiceError(error, 'User')
  }
}

export const resetPasswordCustomerService = async (data: ResetPasswordRequestInput) => {
  try {
    const { email, newPassword } = data || ({} as ResetPasswordRequestInput)
    if (!email || !newPassword)
      throw createError('Email and newPassword are required', 400, 'VALIDATION_ERROR')

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user || user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('User'), 404, 'NOT_FOUND')

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    return { message: 'Password updated' }
  } catch (error) {
    handleServiceError(error, 'Password Reset')
  }
}

export const changePasswordCustomerService = async (
  userId: string | undefined,
  data: ChangePasswordInput
) => {
  try {
    if (!userId) throw createError(ErrorMessages.UNAUTHORIZED, 401, 'UNAUTHORIZED')

    const { oldPassword, newPassword } = data || {}
    if (!oldPassword || !newPassword)
      throw createError('oldPassword and newPassword are required', 400, 'VALIDATION_ERROR')

    const user = await prisma.user.findUnique({ where: { id: userId } })
    if (!user || user.isAdmin) throw createError(ErrorMessages.NOT_FOUND('User'), 404, 'NOT_FOUND')

    const valid = await comparePassword(oldPassword, user.password)
    if (!valid) throw createError('Old password is incorrect', 400, 'INVALID_PASSWORD')

    const hashed = await hashPassword(newPassword)
    await prisma.user.update({ where: { id: user.id }, data: { password: hashed } })
    return { message: 'Password changed' }
  } catch (error) {
    handleServiceError(error, 'Password Change')
  }
}
