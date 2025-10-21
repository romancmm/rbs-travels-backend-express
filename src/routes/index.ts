import { Router } from 'express'
import customerAuthRoutes from '@/routes/auth/customerAuth.route'
import adminAuthRoutes from '@/routes/auth/adminAuth.route'
import customerPublicRoutes from '@/routes/customer/customer.public.route'
import customerAdminRoutes from '@/routes/customer/customer.admin.route'
import pagePublicRoutes from '@/routes/page/page.public.route'
import pageAdminRoutes from '@/routes/page/page.admin.route'
import roleAdminRoutes from '@/routes/role/role.admin.route'
import permissionAdminRoutes from '@/routes/permission/permission.admin.route'

const routes = Router()

// health & root (must be before sub-routers to avoid conflicts)
routes.get('/health', (_req, res) => res.json({ ok: true }))
routes.get('/', (_req, res) => res.send('🚀 Travel Agency API running'))

routes.use('/auth', customerAuthRoutes)
routes.use('/auth/admin', adminAuthRoutes)
routes.use('/customers', customerPublicRoutes)
routes.use('/admin/customer', customerAdminRoutes)
routes.use('/pages', pagePublicRoutes)
routes.use('/admin/page', pageAdminRoutes)
routes.use('/admin/role', roleAdminRoutes)
routes.use('/admin/permission', permissionAdminRoutes)

export default routes
