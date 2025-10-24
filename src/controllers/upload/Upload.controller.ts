import { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY } from '@/config/env'
import {
  getUploadAuthParamsService,
  uploadFileToImageKitService,
} from '@/services/upload/Upload.service'
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

export const upload = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = (req as any).file as Express.Multer.File | undefined
    if (!file) {
      return res.status(400).json({ message: 'File is required', code: 'FILE_REQUIRED' })
    }
    const folder = (req.body?.folder as string | undefined) || undefined
    const result = await uploadFileToImageKitService({
      file: file.buffer,
      fileName: file.originalname,
      folder,
    })
    return res.status(201).json(result)
  } catch (err) {
    next(err)
  }
}
