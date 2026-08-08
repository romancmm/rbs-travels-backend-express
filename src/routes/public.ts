import articlePublicRoutes from '@/api/article/article.public.route'
import mediaPublicRoutes from '@/api/media/media.public.route'
import menuPublicRoutes from '@/api/menu/menu.public.route'
import pageBuilderPublicRoutes from '@/api/page-builder/page-builder.public.route'
import projectPublicRoutes from '@/api/project/project.public.route'
import servicePublicRoutes from '@/api/service/service.public.route'
import settingPublicRoutes from '@/api/setting/setting.public.route'
import uploadPublicRoutes from '@/api/upload/upload.public.route'
import cacheMiddleware from '@/middlewares/cache.middleware'
import { Router } from 'express'

const routes = Router()

// /upload/auth issues a fresh, single-use token+signature pair with a short expiry on every
// call (see imagekit's signature lib) - it must be mounted before the cache middleware so a
// cached response never hands out a stale/expired signature to later uploads.
routes.use('/upload', uploadPublicRoutes)

// Apply cache middleware to the remaining public routes (30 minutes TTL)
routes.use(cacheMiddleware(1800))

// health & root (must be before sub-routers to avoid conflicts)
routes.get('/health', (_req, res) => res.json({ ok: true }))
routes.get('/', (_req, res) => res.send('🚀 Dynamic CMS API running'))

routes.use('/pages', pageBuilderPublicRoutes)
routes.use('/menus', menuPublicRoutes)
routes.use('/articles', articlePublicRoutes)
routes.use('/services', servicePublicRoutes)
routes.use('/projects', projectPublicRoutes)
routes.use('/settings', settingPublicRoutes)
routes.use('/media', mediaPublicRoutes)

export default routes
