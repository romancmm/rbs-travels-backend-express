import { z } from 'zod'
import { paginationQuerySchema } from './common.validator'

/**
 * Media List Query Schema
 */
export const mediaListQuerySchema = paginationQuerySchema.extend({
  path: z.string().default('/').optional(),
  fileType: z.enum(['all', 'image', 'video', 'audio', 'raw']).optional().default('all'),
})

/**
 * Upload Schema - supports multiple files with folder path
 */
export const uploadMediaSchema = z.object({
  folder: z.string().optional(),
  existing: z.array(z.string()).optional(), // Existing URLs to keep
  deletes: z.array(z.string()).optional(), // URLs/fileIds to delete
})

/**
 * Folder Management Schemas
 */
export const createFolderSchema = z.object({
  folderName: z.string().min(1, 'Folder name is required').max(50, 'Folder name too long'),
  parentPath: z.string().optional().default('/'),
})

export const renameFolderSchema = z.object({
  oldPath: z.string().min(1, 'Old path is required'),
  newFolderName: z.string().min(1, 'New folder name is required').max(50, 'Folder name too long'),
})

export const deleteFolderQuerySchema = z.object({
  path: z.string().min(1, 'Path is required'),
  force: z.string().optional(), // 'true' to force delete with contents
})

/**
 * File Management Schemas
 */
export const updateFileSchema = z.object({
  name: z.string().optional(),
  tags: z.array(z.string()).optional(),
})

export const deleteFileParamsSchema = z.object({
  fileId: z.string().min(1, 'fileId is required'),
})

export const deleteMultipleFilesSchema = z.object({
  fileIds: z.array(z.string().min(1)).min(1, 'At least one file ID is required'),
})

/**
 * TypeScript Types
 */
export type MediaListQuery = z.infer<typeof mediaListQuerySchema>
export type UploadMediaInput = z.infer<typeof uploadMediaSchema>
export type CreateFolderInput = z.infer<typeof createFolderSchema>
export type RenameFolderInput = z.infer<typeof renameFolderSchema>
export type DeleteFolderQuery = z.infer<typeof deleteFolderQuerySchema>
export type UpdateFileInput = z.infer<typeof updateFileSchema>
export type DeleteFileParams = z.infer<typeof deleteFileParamsSchema>
export type DeleteMultipleFilesInput = z.infer<typeof deleteMultipleFilesSchema>
