import * as SettingController from '@/controllers/setting/Setting.controller'
import { validate } from '@/middlewares/validation.middleware'
import { settingKeyParamsSchema, settingQuerySchema } from '@/validators/setting.validator'
import { Router } from 'express'

const router = Router()

// Public settings - accessible without auth
router.get('/public', validate(settingQuerySchema, 'query'), SettingController.getPublic)
router.get('/:key', validate(settingKeyParamsSchema, 'params'), SettingController.getByKey)

export default router
