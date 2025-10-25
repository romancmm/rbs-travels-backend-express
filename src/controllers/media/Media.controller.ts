import {
  createFolderService,
  deleteFileService,
  deleteFolderService,
  listMediaService,
} from '@/services/media/Media.service'
import type { NextFunction, Request, Response } from 'express'

export const list = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await listMediaService((req as any).query)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { path } = req.body as { path: string }
    const data = await createFolderService(path)
    res.status(201).json(data)
  } catch (e) {
    next(e)
  }
}

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params as { fileId: string }
    await deleteFileService(fileId)
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}

export const deleteFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { path } = (req as any).query as { path: string }
    await deleteFolderService(path)
    res.json({ success: true })
  } catch (e) {
    next(e)
  }
}
