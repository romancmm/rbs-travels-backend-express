import * as AuthService from '@/services/auth/Auth.service'
import { success } from '@/utils/response'
import type { RequestHandler } from 'express'

// ✅ REGISTER
export const register: RequestHandler = async (req, res, next) => {
  try {
    const data = await AuthService.registerCustomerService(req.body)
    return success(res, data, 'Customer registered successfully')
  } catch (err) {
    next(err)
  }
}

// ✅ LOGIN
export const login: RequestHandler = async (req, res, next) => {
  try {
    const data = await AuthService.loginCustomerService(req.body)
    return success(res, data, 'Login successful')
  } catch (err) {
    next(err)
  }
}

// ✅ REFRESH TOKENS
export const refresh: RequestHandler = async (req, res, next) => {
  try {
    const data = await AuthService.refreshCustomerService(req.body)
    return success(res, data, 'Tokens refreshed')
  } catch (err) {
    next(err)
  }
}

// ✅ LOGOUT (stateless – client should delete tokens)
export const logout: RequestHandler = async (req, res, next) => {
  try {
    const data = await AuthService.logoutCustomerService(req.body)
    return success(res, data, 'Logged out')
  } catch (err) {
    next(err)
  }
}

// ✅ CURRENT USER PROFILE
export const me: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user?.id
    const data = await AuthService.getCustomerProfileService(userId)
    return success(res, data, 'Profile fetched')
  } catch (err) {
    next(err)
  }
}

// ✅ RESET PASSWORD (by email)
export const resetPassword: RequestHandler = async (req, res, next) => {
  try {
    const data = await AuthService.resetPasswordCustomerService(req.body)
    return success(res, data, 'Password reset successful')
  } catch (err) {
    next(err)
  }
}

// ✅ CHANGE PASSWORD (authenticated)
export const changePassword: RequestHandler = async (req, res, next) => {
  try {
    const userId = (req as any).user?.id
    const data = await AuthService.changePasswordCustomerService(userId, req.body)
    return success(res, data, 'Password changed successfully')
  } catch (err) {
    next(err)
  }
}
