import { Router } from 'express'
import adminRouter from '@/routes/admin'
import publicRouter from '@/routes/public'
import authRouter from '@/routes/auth'
 
const routes = Router()

routes.use('/auth', authRouter)
routes.use('/admin', adminRouter)
routes.use('/', publicRouter)

export default routes
