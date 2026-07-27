import type { Response } from 'express'
import { buildPagination } from './paginator'

export const success = (res: Response, data: any, message = 'Success') => {
 return res.status(200).json({
  success: true,
  message,
  data,
 })
}

export const paginated = (
 res: Response,
 items: any[],
 pagination: { page: number; limit: number; total: number },
 message = 'Data fetched successfully.',
) => {
 return res.status(200).json({
  success: true,
  message,
  data: { items },
  pagination: buildPagination(pagination.page, pagination.limit, pagination.total, items.length),
 })
}

export const error = (
 res: Response,
 message = 'Error',
 status: number = 400,
) => {
 return res.status(status).json({
  success: false,
  message,
 })
}
