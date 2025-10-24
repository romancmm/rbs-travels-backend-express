import * as Customer from '@/controllers/customer/Customer.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import { idParamSchema } from '@/validators/common.validator'
import {
  createCustomerSchema,
  customerQuerySchema,
  updateCustomerSchema,
} from '@/validators/customer.validator'
import { Router } from 'express'

const router = Router()

// Admin-protected customer management endpoints
router.get(
  '/',
  requirePermission('customer.list'),
  validate(customerQuerySchema, 'query'),
  Customer.list
)
router.get(
  '/:id',
  requirePermission('customer.get'),
  validate(idParamSchema, 'params'),
  Customer.get
)
router.post(
  '/',
  requirePermission('customer.create'),
  validate(createCustomerSchema),
  Customer.create
)
router.patch(
  '/:id',
  requirePermission('customer.update'),
  validateMultiple({ params: idParamSchema, body: updateCustomerSchema }),
  Customer.update
)
router.delete(
  '/:id',
  requirePermission('customer.delete'),
  validate(idParamSchema, 'params'),
  Customer.remove
)

export default router
