import {
  createCustomerService,
  getCustomerByIdService,
  listCustomersService,
  softDeleteCustomerService,
  updateCustomerService,
} from '@/services/customer/Customer.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

export const list: RequestHandler = async (req, res, next) => {
  try {
    const { page, perPage, q, isActive } = req.query
    const data = await listCustomersService({
      page: Number(page) || 1,
      perPage: Number(perPage) || 10,
      q: (q as string) || undefined,
      isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
    })
    return success(res, data, 'Customers fetched')
  } catch (err) {
    next(err)
  }
}

export const get: RequestHandler = async (req, res, next) => {
  try {
    const data = await getCustomerByIdService(req.params.id as string)
    return success(res, data, 'Customer fetched')
  } catch (err) {
    next(err)
  }
}

export const create: RequestHandler = async (req, res, next) => {
  try {
    const data = await createCustomerService(req.body)
    return success(res, data, 'Customer created')
  } catch (err) {
    next(err)
  }
}

export const update: RequestHandler = async (req, res, next) => {
  try {
    const data = await updateCustomerService(req.params.id as string, req.body)
    return success(res, data, 'Customer updated')
  } catch (err) {
    next(err)
  }
}

export const remove: RequestHandler = async (req, res, next) => {
  try {
    const data = await softDeleteCustomerService(req.params.id as string)
    return success(res, data, 'Customer deleted')
  } catch (err) {
    next(err)
  }
}
