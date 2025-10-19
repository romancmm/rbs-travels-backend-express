import { success, error } from '../../utils/response'
import * as AdminAuthService from '../../services/auth/adminAuth.service'
import type { RequestHandler } from 'express'

export const register: RequestHandler = async (req, res) => {
 try {
  const data = await AdminAuthService.registerAdminService(req.body)
  return success(res, data, 'Admin registered successfully')
 } catch (err) {
  const message = err instanceof Error ? err.message : 'Something went wrong'
  return error(res, message)
 }
}

export const login: RequestHandler = async (req, res) => {
 try {
  const data = await AdminAuthService.loginAdminService(req.body)
  return success(res, data, 'Admin logged in successfully')
 } catch (err) {
  const message = err instanceof Error ? err.message : 'Something went wrong'
  return error(res, message)
 }
}
