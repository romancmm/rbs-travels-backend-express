import { Router } from 'express'
import customerAuthRoutes from '@/routes/auth/customerAuth.route'
import adminAuthRoutes from '@/routes/auth/adminAuth.route'
import customerPublicRoutes from '@/routes/customer/customer.public.route'
import customerAdminRoutes from '@/routes/customer/customer.admin.route'
import pagePublicRoutes from '@/routes/page/page.public.route'
import pageAdminRoutes from '@/routes/page/page.admin.route'
import roleAdminRoutes from '@/routes/role/role.admin.route'
import permissionAdminRoutes from '@/routes/permission/permission.admin.route'
import blogPublicRoutes from '@/routes/blog/blog.public.route'
import blogAdminRoutes from '@/routes/blog/blog.admin.route'
import servicePublicRoutes from '@/routes/service/service.public.route'
import serviceAdminRoutes from '@/routes/service/service.admin.route'
import projectPublicRoutes from '@/routes/project/project.public.route'
import projectAdminRoutes from '@/routes/project/project.admin.route'
import settingPublicRoutes from '@/routes/setting/setting.public.route'
import settingAdminRoutes from '@/routes/setting/setting.admin.route'

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
routes.use('/blog', blogPublicRoutes)
routes.use('/admin/blog', blogAdminRoutes)
routes.use('/services', servicePublicRoutes)
routes.use('/admin/service', serviceAdminRoutes)
routes.use('/projects', projectPublicRoutes)
routes.use('/admin/project', projectAdminRoutes)
routes.use('/settings', settingPublicRoutes)
routes.use('/admin/setting', settingAdminRoutes)

export default routes
