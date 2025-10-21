import { Router } from 'express'
import * as Page from '@/controllers/page/Page.controller'

const router = Router()

// Public read-only routes (no auth)
router.get('/', Page.list)
router.get('/:id', Page.get)

export default router
