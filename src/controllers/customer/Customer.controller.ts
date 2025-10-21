import type { RequestHandler } from 'express'
import { success, error } from '@/utils/response'
import {
 listCustomersService,
 getCustomerByIdService,
 createCustomerService,
 updateCustomerService,
 softDeleteCustomerService,
} from '@/services/customer/Customer.service'

export const list: RequestHandler = async (req, res) => {
 try {
  const { page, perPage, q, isActive } = req.query
  const data = await listCustomersService({
   page: Number(page) || 1,
   perPage: Number(perPage) || 10,
   q: (q as string) || undefined,
   isActive: typeof isActive === 'string' ? isActive === 'true' : undefined,
  })
  return success(res, data, 'Customers fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const get: RequestHandler = async (req, res) => {
 try {
    const data = await getCustomerByIdService(req.params.id as string)
  return success(res, data, 'Customer fetched')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const create: RequestHandler = async (req, res) => {
 try {
  const data = await createCustomerService(req.body)
  return success(res, data, 'Customer created')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const update: RequestHandler = async (req, res) => {
 try {
    const data = await updateCustomerService(req.params.id as string, req.body)
  return success(res, data, 'Customer updated')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}

export const remove: RequestHandler = async (req, res) => {
 try {
    const data = await softDeleteCustomerService(req.params.id as string)
  return success(res, data, 'Customer deleted')
 } catch (err: any) {
  return error(res, err.message, err.status || 400)
 }
}
