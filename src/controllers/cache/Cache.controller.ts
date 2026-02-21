import CacheService from '@/services/cache.service'
import { success } from '@/utils/response'

export const list = async (req: any, res: any, next: any) => {
  try {
    const {
      pattern = '*',
      cursor = '0',
      count = 100,
    } = req.query as {
      pattern?: string
      cursor?: string
      count?: number
    }

    const data = await CacheService.listKeys(pattern, cursor, Number(count))
    return success(res, data, 'Cache keys fetched')
  } catch (err) {
    next(err)
  }
}

export const removeOne = async (req: any, res: any, next: any) => {
  try {
    const { key } = req.query as { key: string }
    const deleted = await CacheService.deleteWithResult(key)

    return success(
      res,
      {
        key,
        deleted,
      },
      deleted > 0 ? 'Cache key deleted' : 'Cache key not found'
    )
  } catch (err) {
    next(err)
  }
}

export const clearAll = async (_req: any, res: any, next: any) => {
  try {
    const deleted = await CacheService.clearWithCount()
    return success(res, { deleted }, 'All cache cleared')
  } catch (err) {
    next(err)
  }
}
