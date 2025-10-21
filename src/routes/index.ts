import { Router } from 'express'
import customerAuthRoutes from '@/routes/auth/customerAuth.route'
import adminAuthRoutes from '@/routes/auth/adminAuth.route'

const routes = Router()

// health & root (must be before sub-routers to avoid conflicts)
routes.get('/health', (_req, res) => res.json({ ok: true }))
routes.get('/', (_req, res) => res.send('🚀 Travel Agency API running'))

routes.use('/auth', customerAuthRoutes)
routes.use('/auth/admin', adminAuthRoutes)
// routes.use('/users', userRouter)

export default routes
