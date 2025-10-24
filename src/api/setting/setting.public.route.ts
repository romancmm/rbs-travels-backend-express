import * as SettingController from '@/controllers/setting/Setting.controller'
import { validate } from '@/middlewares/validation.middleware'
import { settingQuerySchema } from '@/validators/setting.validator'
import { Router } from 'express'

const router = Router()

// Public settings - accessible without auth
router.get('/public', validate(settingQuerySchema, 'query'), SettingController.getPublic)

export default router
