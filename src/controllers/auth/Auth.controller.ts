import * as AuthService from '@/services/auth/Auth.service'
import { error, success } from '@/utils/response'
import type { RequestHandler } from 'express'

// ✅ REGISTER
export const register: RequestHandler = async (req, res) => {
  try {
    const data = await AuthService.registerCustomerService(req.body)
    return success(res, data, 'Customer registered successfully')
  } catch (err: any) {
    return error(res, err.message)
  }
}

// ✅ LOGIN
export const login: RequestHandler = async (req, res) => {
  try {
    const data = await AuthService.loginCustomerService(req.body)
    return success(res, data, 'Login successful')
  } catch (err: any) {
    return error(res, err.message)
  }
}

// ✅ REFRESH TOKENS
export const refresh: RequestHandler = async (req, res) => {
  try {
    const data = await AuthService.refreshCustomerService(req.body)
    return success(res, data, 'Tokens refreshed')
  } catch (err: any) {
    return error(res, err.message)
  }
}

// ✅ LOGOUT (stateless – client should delete tokens)
export const logout: RequestHandler = async (req, res) => {
  try {
    const data = await AuthService.logoutCustomerService(req.body)
    return success(res, data, 'Logged out')
  } catch (err: any) {
    return error(res, err.message)
  }
}

// ✅ CURRENT USER PROFILE
export const me: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const data = await AuthService.getCustomerProfileService(userId)
    return success(res, data, 'Profile fetched')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

// ✅ RESET PASSWORD (by email)
export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const data = await AuthService.resetPasswordCustomerService(req.body)
    return success(res, data, 'Password reset successful')
  } catch (err: any) {
    return error(res, err.message)
  }
}

// ✅ CHANGE PASSWORD (authenticated)
export const changePassword: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const data = await AuthService.changePasswordCustomerService(userId, req.body)
    return success(res, data, 'Password changed successfully')
  } catch (err: any) {
    return error(res, err.message)
  }
}
