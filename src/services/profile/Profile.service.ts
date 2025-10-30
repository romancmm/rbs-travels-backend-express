import prisma from '@/utils/prisma'
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
      throw Object.assign(new Error('Email already exists'), { status: 409 })
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
      throw Object.assign(new Error('Email already exists'), { status: 409 })
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
}

export const removeAvatarService = async (userId: string) => {
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
}
