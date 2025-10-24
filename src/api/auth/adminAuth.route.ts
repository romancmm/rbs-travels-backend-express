import * as AdminAuth from '@/controllers/auth/AdminAuth.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
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
// router.post('/register', adminAuthMiddleware, validate(registerSchema), AdminAuth.register)
router.post('/login', validate(adminLoginSchema), AdminAuth.login)
router.get('/me', adminAuthMiddleware, (req, res) => res.json((req as any).user))
router.post('/refresh', validate(refreshTokenSchema), (req, res) => {})
router.post('/logout', (req, res) => {})
router.post('/reset-password', validate(resetPasswordRequestSchema), (req, res) => {})
router.post(
  '/change-password',
  adminAuthMiddleware,
  validate(changePasswordSchema),
  (req, res) => {}
)

export default router
