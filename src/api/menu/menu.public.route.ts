import * as MenuController from '@/controllers/menu/menu.public.controller'
import { validate } from '@/middlewares/validation.middleware'
import { getMenuParamsSchema, listMenusQuerySchema } from '@/validators/menu.validator'
import { Router } from 'express'

const router = Router()

// Public menu routes - only show published menus
router.get('/', validate(listMenusQuerySchema, 'query'), MenuController.listMenus)

router.get('/:identifier', validate(getMenuParamsSchema, 'params'), MenuController.getMenu)

export default router
