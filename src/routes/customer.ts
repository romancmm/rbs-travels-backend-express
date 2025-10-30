import customerProfileRoutes from '@/api/customer/customerProfile.route'
import { Router } from 'express'

const routes = Router()

routes.use('/', customerProfileRoutes)

export default routes
