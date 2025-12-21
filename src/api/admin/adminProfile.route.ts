import { removeAvatar, updateProfile, uploadAvatar } from '@/controllers/profile/Profile.controller'
import { validate } from '@/middlewares/validation.middleware'
import { avatarUploadSchema } from '@/validators/common.validator'
import { updateProfileSchema } from '@/validators/user.validator'
import { Router } from 'express'

const router = Router()

// Admin profile management routes (require admin authentication)
router.put('/profile', validate(updateProfileSchema), updateProfile)
router.post('/profile/avatar', validate(avatarUploadSchema), uploadAvatar)
router.delete('/profile/avatar', removeAvatar)

export default router
