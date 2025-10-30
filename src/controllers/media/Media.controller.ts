import {
  createFolderService,
  deleteFileService,
  deleteFolderService,
  deleteFolderWithContentsService,
  getMediaLibraryStructureService,
  listMediaService,
  renameFolderService,
  updateFileService,
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

export const getLibraryStructure = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await getMediaLibraryStructureService()
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const createFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { folderName, parentPath } = req.body as { folderName: string; parentPath?: string }
    const data = await createFolderService(folderName, parentPath)
    res.status(201).json(data)
  } catch (e) {
    next(e)
  }
}

export const renameFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { oldPath, newFolderName } = req.body as { oldPath: string; newFolderName: string }
    const data = await renameFolderService(oldPath, newFolderName)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const updateFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params as { fileId: string }
    const updateData = req.body as { name?: string; tags?: string[] }
    const data = await updateFileService(fileId, updateData)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const deleteFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params as { fileId: string }
    const data = await deleteFileService(fileId)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const deleteFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { path, force } = (req as any).query as { path: string; force?: string }
    const forceDelete = force === 'true'

    const data = forceDelete
      ? await deleteFolderWithContentsService(path, true)
      : await deleteFolderService(path)

    res.json(data)
  } catch (e) {
    next(e)
  }
}
