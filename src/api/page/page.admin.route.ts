import { Router } from 'express'
import * as Page from '@/controllers/page/Page.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'

const router = Router()

// Admin-protected page management routes
router.get('/', adminAuthMiddleware, Page.list)
router.get('/:id', adminAuthMiddleware, Page.get)
router.post('/', adminAuthMiddleware, Page.create)
router.patch('/:id', adminAuthMiddleware, Page.update)
router.delete('/:id', adminAuthMiddleware, Page.remove)

export default router
