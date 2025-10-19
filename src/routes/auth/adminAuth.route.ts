import { Router } from 'express'
import * as AdminAuth from '@/controllers/auth/adminAuth.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'

const router = Router()

router.post('/register', adminAuthMiddleware, AdminAuth.register)
router.post('/login', AdminAuth.login)
router.get('/me', adminAuthMiddleware, (req, res) =>
 res.json((req as any).user),
)
router.post('/refresh', (req, res) => {})
router.post('/logout', (req, res) => {})
router.post('/reset-password', (req, res) => {})
router.post('/change-password', adminAuthMiddleware, (req, res) => {})

export default router
