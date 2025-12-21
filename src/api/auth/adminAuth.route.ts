import * as AdminAuth from '@/controllers/auth/AdminAuth.controller'
import { validate } from '@/middlewares/validation.middleware'
import {
  adminLoginSchema,
  changePasswordSchema,
  refreshTokenSchema,
  resetPasswordRequestSchema,
} from '@/validators/auth.validator'
import { Router } from 'express'

const router = Router()

// ✅ With Zod validation
// router.post('/register', validate(registerSchema), AdminAuth.register)
router.post('/login', validate(adminLoginSchema), AdminAuth.login)
router.get('/me', AdminAuth.me)
router.post('/refresh', validate(refreshTokenSchema), AdminAuth.refresh)
router.post('/logout', AdminAuth.logout)
router.post('/reset-password', validate(resetPasswordRequestSchema), AdminAuth.resetPassword)
router.post('/change-password', validate(changePasswordSchema), AdminAuth.changePassword)

export default router
