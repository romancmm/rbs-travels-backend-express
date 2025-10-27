import type { NextFunction, Request, Response } from 'express'

/**
 * Middleware factory to check if authenticated admin has a specific permission.
 * Usage: router.get('/resource', adminAuthMiddleware, requirePermission('resource.read'), handler)
 */
export function requirePermission(permissionName: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: admin access required' })
    }
    // Superadmin bypass by email
    if (user.email === 'admin@gmail.com') {
      return next()
    }
    // Support single role or multiple roles
    const singleRole = user.role
    const roles = user.roles || (singleRole ? [singleRole] : [])
    if (!roles.length) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: no role or permissions assigned' })
    }
    const hasPermission = roles.some(
      (r: any) =>
        Array.isArray(r.permissions) && r.permissions.some((p: any) => p.name === permissionName)
    )
    if (!hasPermission) {
      return res
        .status(403)
        .json({ success: false, message: `Forbidden: missing permission '${permissionName}'` })
    }
    return next()
  }
}

/**
 * Middleware to check if user has ANY of the specified permissions (OR logic).
 */
export function requireAnyPermission(...permissionNames: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as any).user
    if (!user || !user.isAdmin) {
      return res.status(403).json({ success: false, message: 'Forbidden: admin access required' })
    }
    // SuperAdmin bypass by email
    if (user.email === 'admin@gmail.com') {
      return next()
    }
    const singleRole = user.role
    const roles = user.roles || (singleRole ? [singleRole] : [])
    if (!roles.length) {
      return res
        .status(403)
        .json({ success: false, message: 'Forbidden: no role or permissions assigned' })
    }
    const hasPermission = roles.some(
      (r: any) =>
        Array.isArray(r.permissions) &&
        r.permissions.some((p: any) => permissionNames.includes(p.name))
    )
    if (!hasPermission) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: requires one of [${permissionNames.join(', ')}]`,
      })
    }
    return next()
  }
}
