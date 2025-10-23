import { Router } from 'express'
import customerAuthRoutes from '@/api/auth/customerAuth.route'
import adminAuthRoutes from '@/api/auth/adminAuth.route'

const routes = Router()

routes.use('/', customerAuthRoutes)
routes.use('/admin', adminAuthRoutes)

export default routes
