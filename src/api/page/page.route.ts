import * as Page from '@/controllers/page/Page.controller'
import { Router } from 'express'

const router = Router()

// Public: list published pages, get by id can be public depending on needs
router.get('/', Page.list)
router.get('/:id', Page.get)

// Admin: create/update/delete
router.post('/', Page.create)
router.patch('/:id', Page.update)
router.delete('/:id', Page.remove)

export default router
