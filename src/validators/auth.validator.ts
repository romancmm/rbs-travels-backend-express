import { z } from 'zod'
import { adminPasswordSchema, emailSchema, imageUrlSchema } from './common.validator'

/**
 * Auth Validation Schemas
 */

// Register schema
export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: emailSchema,
  password: adminPasswordSchema,
  avatar: imageUrlSchema.optional(),
})

// Login schema
export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

// Refresh token schema
export const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
})

// Reset password request schema (direct reset by email + new password)
export const resetPasswordRequestSchema = z.object({
  email: emailSchema,
  newPassword: adminPasswordSchema,
})

// Reset password schema (with token)
export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: adminPasswordSchema,
})

// Change password schema (authenticated user)
export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Old password is required'),
  newPassword: adminPasswordSchema,
  // confirmPassword: z.string().min(1, 'Password confirmation is required'),
})
// .refine((data) => data.newPassword === data.confirmPassword, {
//   message: 'Passwords do not match',
//   path: ['confirmPassword'],
// })

// Admin login schema (same as regular login but kept separate for clarity)
export const adminLoginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
})

/**
 * TypeScript Types
 */
export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type RefreshTokenInput = z.infer<typeof refreshTokenSchema>
export type ResetPasswordRequestInput = z.infer<typeof resetPasswordRequestSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type AdminLoginInput = z.infer<typeof adminLoginSchema>
