import userAdminRoutes from '@/api/admin'
import adminProfileRoutes from '@/api/admin/adminProfile.route'
import blogAdminRoutes from '@/api/blog/blog.admin.route'
import customerAdminRoutes from '@/api/customer/route'
import mediaAdminRoutes from '@/api/media/media.admin.route'
import menuAdminRoutes from '@/api/menu/menu.admin.route'
import pageBuilderAdminRoutes from '@/api/page-builder/page-builder.admin.route'
import pageAdminRoutes from '@/api/page/page.admin.route'
import permissionAdminRoutes from '@/api/permission/permission.admin.route'
import projectAdminRoutes from '@/api/project/project.admin.route'
import roleAdminRoutes from '@/api/role/role.admin.route'
import serviceAdminRoutes from '@/api/service/service.admin.route'
import settingAdminRoutes from '@/api/setting/setting.admin.route'
import uploadAdminRoutes from '@/api/upload/upload.admin.route'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { Router } from 'express'

const routes = Router()

// All admin setting routes require authentication
routes.use(adminAuthMiddleware)

routes.use('/page', pageAdminRoutes)
routes.use('/menu', menuAdminRoutes)
routes.use('/pages', pageBuilderAdminRoutes)
routes.use('/customer', customerAdminRoutes)
routes.use('/role', roleAdminRoutes)
routes.use('/permission', permissionAdminRoutes)
routes.use('/blog', blogAdminRoutes)
routes.use('/service', serviceAdminRoutes)
routes.use('/project', projectAdminRoutes)
routes.use('/setting', settingAdminRoutes)
routes.use('/user', userAdminRoutes)
routes.use('/upload', uploadAdminRoutes)
routes.use('/media', mediaAdminRoutes)
routes.use('/', adminProfileRoutes)

export default routes
