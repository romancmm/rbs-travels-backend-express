import { Router } from 'express'
import customerAdminRoutes from '@/api/customer/route'
import roleAdminRoutes from '@/api/role/role.admin.route'
import permissionAdminRoutes from '@/api/permission/permission.admin.route'
import blogAdminRoutes from '@/api/blog/blog.admin.route'
import serviceAdminRoutes from '@/api/service/service.admin.route'
import projectAdminRoutes from '@/api/project/project.admin.route'
import settingAdminRoutes from '@/api/setting/setting.admin.route'
import pageAdminRoutes from '@/api/page/page.admin.route'
import userAdminRoutes from '@/api/admin'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'

const routes = Router()

// All admin setting routes require authentication
routes.use(adminAuthMiddleware)

routes.use('/page', pageAdminRoutes)
routes.use('/customer', customerAdminRoutes)
routes.use('/role', roleAdminRoutes)
routes.use('/permission', permissionAdminRoutes)
routes.use('/blog', blogAdminRoutes)
routes.use('/service', serviceAdminRoutes)
routes.use('/project', projectAdminRoutes)
routes.use('/setting', settingAdminRoutes)
routes.use('/user', userAdminRoutes)

export default routes
