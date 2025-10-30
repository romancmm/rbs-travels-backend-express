import {
  removeAvatarService,
  updateCustomerProfileService,
  uploadAvatarService,
} from '@/services/profile/Profile.service'
import { success } from '@/utils/response'
import type { NextFunction, Request, Response } from 'express'

export const updateCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw Object.assign(new Error('User not authenticated'), { status: 401 })
    }

    const user = await updateCustomerProfileService(userId, req.body)
    return success(res, { user }, 'Profile updated successfully')
  } catch (error) {
    next(error)
  }
}

export const uploadCustomerAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw Object.assign(new Error('User not authenticated'), { status: 401 })
    }

    const { avatarUrl } = req.body
    if (!avatarUrl) {
      throw Object.assign(new Error('Avatar URL is required'), { status: 400 })
    }

    const user = await uploadAvatarService(userId, avatarUrl)
    return success(res, { user }, 'Avatar uploaded successfully')
  } catch (error) {
    next(error)
  }
}

export const removeCustomerAvatar = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user?.id
    if (!userId) {
      throw Object.assign(new Error('User not authenticated'), { status: 401 })
    }

    const user = await removeAvatarService(userId)
    return success(res, { user }, 'Avatar removed successfully')
  } catch (error) {
    next(error)
  }
}
