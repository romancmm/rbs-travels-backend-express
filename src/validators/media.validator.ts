import { z } from 'zod'
import { paginationQuerySchema } from './common.validator'

export const mediaListQuerySchema = paginationQuerySchema.extend({
  path: z.string().default('/').optional(),
  fileType: z.enum(['all', 'image', 'video', 'audio', 'raw']).optional().default('all'),
})

export const createFolderSchema = z.object({
  path: z.string().min(1, 'Path is required'),
})

export const deleteFolderQuerySchema = z.object({
  path: z.string().min(1, 'Path is required'),
})

export const deleteFileParamsSchema = z.object({
  fileId: z.string().min(1, 'fileId is required'),
})

export type MediaListQuery = z.infer<typeof mediaListQuerySchema>
export type CreateFolderInput = z.infer<typeof createFolderSchema>
export type DeleteFolderQuery = z.infer<typeof deleteFolderQuerySchema>
export type DeleteFileParams = z.infer<typeof deleteFileParamsSchema>
