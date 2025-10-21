import { Router } from 'express'
import * as CustomerAuth from '@/controllers/auth/Auth.controller'
import { authenticateToken } from '@/middlewares/auth.middleware'

const router = Router()

router.post('/register', CustomerAuth.register)
router.post('/login', CustomerAuth.login)
router.get('/me', authenticateToken, CustomerAuth.me)
router.post('/refresh', CustomerAuth.refresh)
router.post('/logout', CustomerAuth.logout)
router.post('/reset-password', CustomerAuth.resetPassword)
router.post('/change-password', authenticateToken, CustomerAuth.changePassword)

export default router
