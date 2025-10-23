import { Router } from 'express'
import * as SettingController from '@/controllers/setting/Setting.controller'

const router = Router()

// Public settings - accessible without auth
router.get('/public', SettingController.getPublic)
router.get('/public', SettingController.getPublic)

export default router
