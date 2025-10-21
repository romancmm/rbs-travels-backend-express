import type { Response } from 'express'

export const success = (res: Response, data: any, message = 'Success') => {
 return res.status(200).json({
  success: true,
  message,
  data,
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
