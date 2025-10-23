import { Router } from 'express'
import * as Customer from '@/controllers/customer/Customer.controller'

const router = Router()

// Admin-protected customer management endpoints
router.get('/', Customer.list)
router.get('/:id', Customer.get)
router.post('/', Customer.create)
router.patch('/:id', Customer.update)
router.delete('/:id', Customer.remove)

export default router
