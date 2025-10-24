import blogPublicRoutes from '@/api/blog/blog.public.route'
import pagePublicRoutes from '@/api/page/page.public.route'
import projectPublicRoutes from '@/api/project/project.public.route'
import servicePublicRoutes from '@/api/service/service.public.route'
import settingPublicRoutes from '@/api/setting/setting.public.route'
import uploadPublicRoutes from '@/api/upload/upload.public.route'
import { Router } from 'express'

const routes = Router()

// health & root (must be before sub-routers to avoid conflicts)
routes.get('/health', (_req, res) => res.json({ ok: true }))
routes.get('/', (_req, res) => res.send('🚀 Travel Agency API running'))

routes.use('/pages', pagePublicRoutes)
routes.use('/blog', blogPublicRoutes)
routes.use('/services', servicePublicRoutes)
routes.use('/projects', projectPublicRoutes)
routes.use('/settings', settingPublicRoutes)
routes.use('/upload', uploadPublicRoutes)

export default routes
