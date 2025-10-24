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
      // In Express 5, req.query/req.params are getters; do not reassign the property.
      // Instead, mutate the existing object so downstream reads get validated values.
      if (source === 'query' || source === 'params') {
        const target = (req as any)[source] || {}
        // Clear existing keys to avoid stale values, then assign validated
        for (const k of Object.keys(target)) delete target[k]
        Object.assign(target, validated)
      } else {
        // body is safe to replace
        ;(req as any).body = validated
      }
      next()
    } catch (err) {
      console.log('err :>> ', err)
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
        const bodyValidated = await schemas.body.parseAsync(req.body)
        ;(req as any).body = bodyValidated
      }
      if (schemas.query) {
        const qValidated = await schemas.query.parseAsync(req.query)
        const target = (req as any).query || {}
        for (const k of Object.keys(target)) delete target[k]
        Object.assign(target, qValidated)
      }
      if (schemas.params) {
        const pValidated = await schemas.params.parseAsync(req.params)
        const target = (req as any).params || {}
        for (const k of Object.keys(target)) delete target[k]
        Object.assign(target, pValidated)
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
