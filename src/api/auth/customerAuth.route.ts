import * as CustomerAuth from '@/controllers/auth/Auth.controller'
import { authenticateToken } from '@/middlewares/auth.middleware'
import { validate } from '@/middlewares/validation.middleware'
import {
  changePasswordSchema,
  loginSchema,
  refreshTokenSchema,
  registerSchema,
  resetPasswordRequestSchema,
} from '@/validators/auth.validator'
import { Router } from 'express'

const router = Router()

// ✅ With Zod validation
router.post('/register', validate(registerSchema), CustomerAuth.register)
router.post('/login', validate(loginSchema), CustomerAuth.login)
router.get('/me', authenticateToken, CustomerAuth.me)

router.post('/refresh', validate(refreshTokenSchema), CustomerAuth.refresh)
router.post('/logout', CustomerAuth.logout)
router.post('/reset-password', validate(resetPasswordRequestSchema), CustomerAuth.resetPassword)
router.post(
  '/change-password',
  authenticateToken,
  validate(changePasswordSchema),
  CustomerAuth.changePassword
)

export default router
