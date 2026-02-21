import { z } from 'zod'

export const cacheListQuerySchema = z.object({
  pattern: z.string().optional().default('*'),
  cursor: z.string().optional().default('0'),
  count: z.coerce.number().int().min(1).max(500).optional().default(100),
})

export const cacheDeleteOneQuerySchema = z.object({
  key: z.string().min(1),
})
