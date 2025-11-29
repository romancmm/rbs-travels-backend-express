import type { RequestHandler } from 'express'
import * as AdminAuthService from '../../services/auth/adminAuth.service'
import { error, success } from '../../utils/response'

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

export const me: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const data = await AdminAuthService.getAdminProfileService(userId)
    return success(res, data, 'Admin profile fetched')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}

export const refresh: RequestHandler = async (req, res) => {
  try {
    const data = await AdminAuthService.refreshAdminService(req.body)
    return success(res, data, 'Tokens refreshed')
  } catch (err: any) {
    return error(res, err.message)
  }
}

export const logout: RequestHandler = async (req, res) => {
  try {
    const data = await AdminAuthService.logoutAdminService(req.body)
    return success(res, data, 'Admin logged out')
  } catch (err: any) {
    return error(res, err.message)
  }
}

export const resetPassword: RequestHandler = async (req, res) => {
  try {
    const data = await AdminAuthService.resetPasswordAdminService(req.body)
    return success(res, data, 'Admin password reset successful')
  } catch (err: any) {
    return error(res, err.message)
  }
}

export const changePassword: RequestHandler = async (req, res) => {
  try {
    const userId = (req as any).user?.id
    const data = await AdminAuthService.changePasswordAdminService(userId, req.body)
    return success(res, data, 'Admin password changed successfully')
  } catch (err: any) {
    return error(res, err.message)
  }
}
