import adminRouter from '@/routes/admin'
import authRouter from '@/routes/auth'
import publicRouter from '@/routes/public'
import { Router } from 'express'

const routes = Router()

routes.use('/auth', authRouter)
routes.use('/admin', adminRouter)
routes.use('/', publicRouter)

export default routes
