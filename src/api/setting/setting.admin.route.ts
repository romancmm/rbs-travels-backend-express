import * as SettingController from '@/controllers/setting/Setting.controller'
import { requirePermission } from '@/middlewares/rbac.middleware'
import { validate, validateMultiple } from '@/middlewares/validation.middleware'
import { idParamSchema } from '@/validators/common.validator'
import {
  createSettingSchema,
  settingQuerySchema,
  updateSettingSchema,
} from '@/validators/setting.validator'
import { Router } from 'express'
import { z } from 'zod'

const router = Router()

// Key param schema
const keyParamSchema = z.object({ key: z.string().min(1) })
const groupParamSchema = z.object({ group: z.string().min(1) })
const keysBodySchema = z.object({ keys: z.array(z.string()) })

// Settings - admin CRUD
router.get(
  '/settings',
  requirePermission('setting.read'),
  validate(settingQuerySchema, 'query'),
  SettingController.list
)
router.get(
  '/settings/id/:id',
  requirePermission('setting.read'),
  validate(idParamSchema, 'params'),
  SettingController.getById
)
router.get(
  '/settings/key/:key',
  requirePermission('setting.read'),
  validate(keyParamSchema, 'params'),
  SettingController.getByKey
)
router.get(
  '/settings/group/:group',
  requirePermission('setting.read'),
  validate(groupParamSchema, 'params'),
  SettingController.getByGroup
)
router.post(
  '/settings/keys',
  requirePermission('setting.read'),
  validate(keysBodySchema),
  SettingController.getByKeys
)
router.post(
  '/settings',
  requirePermission('setting.create'),
  validate(createSettingSchema),
  SettingController.create
)
router.put(
  '/settings/id/:id',
  requirePermission('setting.update'),
  validateMultiple({ params: idParamSchema, body: updateSettingSchema }),
  SettingController.update
)
router.put(
  '/settings/key/:key',
  requirePermission('setting.update'),
  validateMultiple({ params: keyParamSchema, body: updateSettingSchema }),
  SettingController.updateByKey
)
router.delete(
  '/settings/:id',
  requirePermission('setting.delete'),
  validate(idParamSchema, 'params'),
  SettingController.remove
)
router.post('/settings/bulk', requirePermission('setting.update'), SettingController.bulkUpdate)

export default router
