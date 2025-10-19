import { success, error } from '@/utils/response'
import * as CustomerAuthService from '@/services/auth/customerAuth.service'
import type { RequestHandler } from 'express'

export const register: RequestHandler = async (req, res) => {
 try {
  const data = await CustomerAuthService.registerCustomerService(req.body)
  return success(res, data, 'Customer registered successfully')
 } catch (err: any) {
  return error(res, err.message)
 }
}

export const login: RequestHandler = async (req, res) => {
 try {
  const data = await CustomerAuthService.loginCustomerService(req.body)
  return success(res, data, 'Login successful')
 } catch (err: any) {
  return error(res, err.message)
 }
}

// The rest (refresh, logout, me, reset-password, change-password) follow same pattern
