import { Router } from 'express'
import * as Customer from '@/controllers/customer/Customer.controller'

const router = Router()

// Public customer read endpoints (no auth)
router.get('/', Customer.list)
router.get('/:id', Customer.get)

export default router
