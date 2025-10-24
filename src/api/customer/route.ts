import { Router } from 'express'
import * as Customer from '@/controllers/customer/Customer.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'

const router = Router()

// Admin-protected customer management endpoints
router.get('/', requirePermission('customer.list'), Customer.list)
router.get('/:id', requirePermission('customer.get'), Customer.get)
router.post('/', requirePermission('customer.create'), Customer.create)
router.patch('/:id', requirePermission('customer.update'), Customer.update)
router.delete('/:id', requirePermission('customer.delete'), Customer.remove)

export default router
