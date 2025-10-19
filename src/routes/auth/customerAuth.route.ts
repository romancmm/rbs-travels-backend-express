import { Router } from 'express'
import * as CustomerAuth from '@/controllers/auth/customerAuth.controller'
import { authenticateToken } from '@/middlewares/auth.middleware'

const router = Router()

router.post('/register', CustomerAuth.register)
router.post('/login', CustomerAuth.login)
router.get('/me', authenticateToken, (req, res) => res.json((req as any).user))
router.post('/refresh', (req, res) => {})
router.post('/logout', (req, res) => {})
router.post('/reset-password', (req, res) => {})
router.post('/change-password', authenticateToken, (req, res) => {})

export default router
