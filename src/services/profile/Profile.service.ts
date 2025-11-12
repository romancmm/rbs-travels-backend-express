import { createError, ErrorMessages, handleServiceError } from '@/utils/error-handler'
import prisma from '@/utils/prisma'
import type { UpdateCustomerProfileInput } from '@/validators/customer.validator'
import type { UpdateProfileInput } from '@/validators/user.validator'

export const updateProfileService = async (userId: string, data: UpdateProfileInput) => {
  try {
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
      select: {
        id: true,
        name: true,
        email: true,
        avatar: true,
        isActive: true,
        isAdmin: true,
        roles: {
          select: {
            id: true,
            name: true,
            permissions: { select: { id: true, name: true } },
          },
        },
        createdAt: true,
        updatedAt: true,
      },
    })
    return user
  } catch (error) {
    handleServiceError(error, 'Profile')
  }
}

export const updateCustomerProfileService = async (
  userId: string,
  data: UpdateCustomerProfileInput
) => {
  try {
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
  } catch (error) {
    handleServiceError(error, 'Profile')
  }
}

export const uploadAvatarService = async (userId: string, avatarUrl: string) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
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
    return user
  } catch (error) {
    handleServiceError(error, 'Avatar')
  }
}

export const removeAvatarService = async (userId: string) => {
  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { avatar: null },
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
    return user
  } catch (error) {
    handleServiceError(error, 'Avatar')
  }
}
