import { Router } from 'express'
import * as Customer from '@/controllers/customer/Customer.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'

const router = Router()

// Admin-protected customer management endpoints
router.get('/', adminAuthMiddleware, Customer.list)
router.get('/:id', adminAuthMiddleware, Customer.get)
router.post('/', adminAuthMiddleware, Customer.create)
router.patch('/:id', adminAuthMiddleware, Customer.update)
router.delete('/:id', adminAuthMiddleware, Customer.remove)

export default router
