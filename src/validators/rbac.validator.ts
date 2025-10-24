import { z } from 'zod'
import { paginationQuerySchema, uuidSchema } from './common.validator'

/**
 * Role Validation Schemas
 */

// Create role schema
export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').max(100),
  permissions: z.array(uuidSchema).default([]).optional(),
})

// Update role schema
export const updateRoleSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  permissions: z.array(uuidSchema).optional(),
})

// Role query params schema
export const roleQuerySchema = paginationQuerySchema.extend({
  // Add specific role filters if needed
})

/**
 * Permission Validation Schemas
 */

// Create permission schema
export const createPermissionSchema = z.object({
  name: z.string().min(1, 'Permission name is required').max(100),
})

// Update permission schema
export const updatePermissionSchema = z.object({
  name: z.string().min(1).max(100).optional(),
})

// Permission query params schema
export const permissionQuerySchema = paginationQuerySchema.extend({
  // Add specific permission filters if needed
})

/**
 * Assign permissions to role schema
 */
export const assignPermissionsSchema = z.object({
  permissionIds: z.array(uuidSchema).min(1, 'At least one permission is required'),
})

/**
 * TypeScript Types
 */

// Role types
export type CreateRoleInput = z.infer<typeof createRoleSchema>
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>
export type RoleQueryParams = z.infer<typeof roleQuerySchema>

// Permission types
export type CreatePermissionInput = z.infer<typeof createPermissionSchema>
export type UpdatePermissionInput = z.infer<typeof updatePermissionSchema>
export type PermissionQueryParams = z.infer<typeof permissionQuerySchema>

// Assignment types
export type AssignPermissionsInput = z.infer<typeof assignPermissionsSchema>
