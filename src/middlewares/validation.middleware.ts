import { error } from '@/utils/response'
import type { NextFunction, Request, Response } from 'express'
import { type ZodSchema, ZodError } from 'zod'

/**
 * Middleware to validate request data using Zod schemas
 * @param schema - Zod schema to validate against
 * @param source - Which part of the request to validate ('body', 'query', 'params')
 */
export const validate = (schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const dataToValidate = req[source]
      const validated = await schema.parseAsync(dataToValidate)
      ;(req as any)[source] = validated
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        const errorMessage = err.issues
          .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
          .join(', ')
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: err.issues,
        })
      }
      return error(res, 'Validation error', 400)
    }
  }
}

/**
 * Validate multiple sources in one middleware
 */
export const validateMultiple = (schemas: {
  body?: ZodSchema
  query?: ZodSchema
  params?: ZodSchema
}) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schemas.body) {
        req.body = await schemas.body.parseAsync(req.body)
      }
      if (schemas.query) {
        ;(req as any).query = await schemas.query.parseAsync(req.query)
      }
      if (schemas.params) {
        ;(req as any).params = await schemas.params.parseAsync(req.params)
      }
      next()
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(422).json({
          success: false,
          message: 'Validation failed',
          errors: err.issues,
        })
      }
      return error(res, 'Validation error', 400)
    }
  }
}
