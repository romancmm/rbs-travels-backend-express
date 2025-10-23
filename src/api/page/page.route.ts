import { Router } from 'express'
import * as Page from '@/controllers/page/Page.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'

const router = Router()

// Public: list published pages, get by id can be public depending on needs
router.get('/', Page.list)
router.get('/:id', Page.get)

// Admin: create/update/delete
router.post('/', adminAuthMiddleware, Page.create)
router.patch('/:id', adminAuthMiddleware, Page.update)
router.delete('/:id', adminAuthMiddleware, Page.remove)

export default router
