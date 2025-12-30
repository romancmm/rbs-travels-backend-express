import prisma from '@/config/db'
import { createError, ErrorMessages } from '@/utils/error-handler'
import type { UpdateCustomerProfileInput } from '@/validators/customer.validator'
import type { UpdateProfileInput } from '@/validators/user.validator'

export const updateProfileService = async (userId: string, data: UpdateProfileInput) => {
  const { name, email, avatar } = data || ({} as UpdateProfileInput)
  const payload: any = {}

  if (name !== undefined) payload.name = name
  if (email !== undefined) {
    // Check if email is taken by another user
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser && existingUser.id !== userId) {
      throw createError(ErrorMessages.ALREADY_EXISTS('User', 'email'), 409, 'DUPLICATE_ENTRY')
    }
    payload.email = email
  }
  if (avatar !== undefined) payload.avatar = avatar

  const user = await prisma.user.update({
    where: { id: userId },
    data: payload,
    include: {
      roles: {
        select: {
          id: true,
          name: true,
          permissions: { select: { id: true, name: true } },
        },
      },
    },
  })

  // Remove password from response
  const { password, ...safeUser } = user
  return safeUser
}

export const updateCustomerProfileService = async (
  userId: string,
  data: UpdateCustomerProfileInput
) => {
  const { name, email, avatar } = data || ({} as UpdateCustomerProfileInput)
  const payload: any = {}

  if (name !== undefined) payload.name = name
  if (email !== undefined) {
    // Check if email is taken by another user
    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser && existingUser.id !== userId) {
      throw createError(ErrorMessages.ALREADY_EXISTS('User', 'email'), 409, 'DUPLICATE_ENTRY')
    }
    payload.email = email
  }
  if (avatar !== undefined) payload.avatar = avatar

  const user = await prisma.user.update({
    where: { id: userId },
    data: payload,
  })

  // Remove password from response
  const { password, ...safe } = user as any
  return safe
}

export const uploadAvatarService = async (userId: string, avatarUrl: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: avatarUrl },
  })

  // Remove password from response
  const { password, ...safeUser } = user
  return safeUser
}

export const removeAvatarService = async (userId: string) => {
  const user = await prisma.user.update({
    where: { id: userId },
    data: { avatar: null },
  })

  // Remove password from response
  const { password, ...safeUser } = user
  return safeUser
}
