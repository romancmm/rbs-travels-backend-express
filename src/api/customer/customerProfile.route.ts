import {
  removeCustomerAvatar,
  updateCustomerProfile,
  uploadCustomerAvatar,
} from '@/controllers/customer/customerProfile.controller'
import { authenticateToken } from '@/middlewares/auth.middleware'
import { validate } from '@/middlewares/validation.middleware'
import { avatarUploadSchema } from '@/validators/common.validator'
import { updateCustomerProfileSchema } from '@/validators/customer.validator'
import { Router } from 'express'

const router = Router()

// Profile management routes (require authentication)
router.put(
  '/profile',
  authenticateToken,
  validate(updateCustomerProfileSchema),
  updateCustomerProfile
)
router.post(
  '/profile/avatar',
  authenticateToken,
  validate(avatarUploadSchema),
  uploadCustomerAvatar
)
router.delete('/profile/avatar', authenticateToken, removeCustomerAvatar)

export default router
