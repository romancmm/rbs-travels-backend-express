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
 * Move/Copy Operations Schemas
 */
export const moveFileSchema = z.object({
  destinationPath: z.string().min(1, 'Destination path is required'),
})

export const copyFileSchema = z.object({
  destinationPath: z.string().min(1, 'Destination path is required'),
})

export const moveFolderSchema = z.object({
  sourcePath: z.string().min(1, 'Source path is required'),
  destinationPath: z.string().min(1, 'Destination path is required'),
})

export const copyFolderSchema = z.object({
  sourcePath: z.string().min(1, 'Source path is required'),
  destinationPath: z.string().min(1, 'Destination path is required'),
})

/**
 * Bulk Operations Schemas
 */
export const bulkDeleteFilesSchema = z.object({
  fileIds: z.array(z.string().min(1)).min(1, 'At least one file ID is required'),
})

export const bulkMoveFilesSchema = z.object({
  fileIds: z.array(z.string().min(1)).min(1, 'At least one file ID is required'),
  destinationPath: z.string().min(1, 'Destination path is required'),
})

export const bulkCopyFilesSchema = z.object({
  fileIds: z.array(z.string().min(1)).min(1, 'At least one file ID is required'),
  destinationPath: z.string().min(1, 'Destination path is required'),
})

export const bulkAddTagsSchema = z.object({
  fileIds: z.array(z.string().min(1)).min(1, 'At least one file ID is required'),
  tags: z.array(z.string().min(1)).min(1, 'At least one tag is required'),
})

export const bulkRemoveTagsSchema = z.object({
  fileIds: z.array(z.string().min(1)).min(1, 'At least one file ID is required'),
  tags: z.array(z.string().min(1)).min(1, 'At least one tag is required'),
})

/**
 * Search Schema
 */
export const searchMediaSchema = z.object({
  searchQuery: z.string().optional(),
  tags: z
    .string()
    .optional()
    .transform((val) => (val ? val.split(',') : undefined)),
  fileType: z.enum(['all', 'image', 'video', 'audio', 'raw']).optional(),
  path: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  page: z.coerce.number().int().positive().optional().default(1),
  perPage: z.coerce.number().int().positive().max(100).optional().default(50),
})

/**
 * File Details Params Schema
 */
export const fileDetailsParamsSchema = z.object({
  fileId: z.string().min(1, 'fileId is required'),
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
export type MoveFileInput = z.infer<typeof moveFileSchema>
export type CopyFileInput = z.infer<typeof copyFileSchema>
export type MoveFolderInput = z.infer<typeof moveFolderSchema>
export type CopyFolderInput = z.infer<typeof copyFolderSchema>
export type BulkDeleteFilesInput = z.infer<typeof bulkDeleteFilesSchema>
export type BulkMoveFilesInput = z.infer<typeof bulkMoveFilesSchema>
export type BulkCopyFilesInput = z.infer<typeof bulkCopyFilesSchema>
export type BulkAddTagsInput = z.infer<typeof bulkAddTagsSchema>
export type BulkRemoveTagsInput = z.infer<typeof bulkRemoveTagsSchema>
export type SearchMediaQuery = z.infer<typeof searchMediaSchema>
export type FileDetailsParams = z.infer<typeof fileDetailsParamsSchema>
