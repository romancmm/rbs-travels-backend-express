import { Router } from 'express'
import * as SettingController from '@/controllers/setting/Setting.controller'
import { adminAuthMiddleware } from '@/middlewares/auth.middleware'
import { requirePermission } from '@/middlewares/rbac.middleware'

const router = Router()

// All admin setting routes require authentication
router.use(adminAuthMiddleware)

// Settings - admin CRUD
router.get('/settings', requirePermission('setting.read'), SettingController.list)
router.get('/settings/id/:id', requirePermission('setting.read'), SettingController.getById)
router.get('/settings/key/:key', requirePermission('setting.read'), SettingController.getByKey)
router.get('/settings/group/:group', requirePermission('setting.read'), SettingController.getByGroup)
router.post('/settings/keys', requirePermission('setting.read'), SettingController.getByKeys)
router.post('/settings', requirePermission('setting.create'), SettingController.create)
router.put('/settings/id/:id', requirePermission('setting.update'), SettingController.update)
router.put('/settings/key/:key', requirePermission('setting.update'), SettingController.updateByKey)
router.delete('/settings/:id', requirePermission('setting.delete'), SettingController.remove)
router.post('/settings/bulk', requirePermission('setting.update'), SettingController.bulkUpdate)

export default router
