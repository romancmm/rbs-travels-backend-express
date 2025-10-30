import { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY } from '@/config/env'
import {
  deleteFilesFromImageKitService,
  extractFileIdFromUrl,
  getUploadAuthParamsService,
  uploadFileToImageKitService,
  uploadMultipleFilesToImageKitService,
} from '@/services/upload/Upload.service'
import type { UploadMediaInput } from '@/validators/media.validator'
import type { NextFunction, Request, Response } from 'express'

export const getAuth = (_req: Request, res: Response) => {
  if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY) {
    return res.status(503).json({
      success: false,
      message:
        'ImageKit is not configured. Please set IMAGEKIT_PUBLIC_KEY and IMAGEKIT_PRIVATE_KEY',
    })
  }
  try {
    const auth = getUploadAuthParamsService()
    return res.json(auth)
  } catch (e: any) {
    return res
      .status(500)
      .json({ success: false, message: e?.message || 'Failed to generate auth' })
  }
}

/**
 * Unified upload handler for single or multiple files
 * Automatically detects single file (req.file) or multiple files (req.files)
 * Supports existing URLs and deletes for managing file galleries
 */
export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const singleFile = (req as any).file as Express.Multer.File | undefined
    const multipleFiles = (req as any).files as Express.Multer.File[] | undefined
    const body = req.body as UploadMediaInput

    // Parse existing and deletes (sent as JSON strings or arrays from FormData)
    let existing: string[] = []
    let deletes: string[] = []

    if (body.existing) {
      existing = Array.isArray(body.existing)
        ? body.existing
        : typeof body.existing === 'string'
        ? JSON.parse(body.existing)
        : []
    }

    if (body.deletes) {
      deletes = Array.isArray(body.deletes)
        ? body.deletes
        : typeof body.deletes === 'string'
        ? JSON.parse(body.deletes)
        : []
    }

    const folder = body.folder

    // Process deletes first
    if (deletes.length > 0) {
      const fileIdsToDelete = deletes
        .map((url) => extractFileIdFromUrl(url))
        .filter((id): id is string => id !== null)

      if (fileIdsToDelete.length > 0) {
        await deleteFilesFromImageKitService(fileIdsToDelete)
      }
    }

    // Determine if single or multiple file upload
    let newUrls: string[] = []

    if (singleFile) {
      // Single file upload
      const result = await uploadFileToImageKitService({
        file: singleFile.buffer,
        fileName: singleFile.originalname,
        folder,
      })
      newUrls = [result.url]
    } else if (multipleFiles && multipleFiles.length > 0) {
      // Multiple files upload
      newUrls = await uploadMultipleFilesToImageKitService({
        files: multipleFiles.map((f) => ({
          buffer: f.buffer,
          filename: f.originalname,
        })),
        folder,
      })
    } else if (!existing.length && !deletes.length) {
      // No files provided and no existing/deletes
      return res.status(400).json({
        success: false,
        message: 'At least one file is required',
        code: 'FILE_REQUIRED',
      })
    }

    // Combine existing (not deleted) with newly uploaded URLs
    const finalUrls = [...existing, ...newUrls]

    return res.status(201).json({
      success: true,
      urls: finalUrls,
      uploaded: newUrls.length,
      deleted: deletes.length,
    })
  } catch (err) {
    next(err)
  }
}
