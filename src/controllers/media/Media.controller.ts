import {
  bulkAddTagsService,
  bulkCopyFilesService,
  bulkDeleteFilesService,
  bulkMoveFilesService,
  bulkRemoveTagsService,
  copyFileService,
  copyFolderService,
  copyItemService,
  createFolderService,
  deleteFileService,
  deleteFolderService,
  deleteFolderWithContentsService,
  deleteItemService,
  getFileDetailsService,
  getMediaLibraryStructureService,
  listMediaService,
  moveFileService,
  moveFolderService,
  moveItemService,
  renameFolderService,
  renameItemService,
  searchMediaService,
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

export const renameItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, newName, type } = req.body as {
      id: string
      newName: string
      type?: 'file' | 'folder'
    }
    const data = await renameItemService(id, newName, type)
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

export const deleteItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params as { id: string }
    const { force } = (req as any).query as { force?: string }
    const forceDelete = force === 'true'

    const data = await deleteItemService(id, forceDelete)
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

// ============================================================================
// FILE OPERATIONS - Move, Copy, Details
// ============================================================================

export const moveFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params as { fileId: string }
    const { destinationPath } = req.body as { destinationPath: string }
    const data = await moveFileService(fileId, destinationPath)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const copyFile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params as { fileId: string }
    const { destinationPath } = req.body as { destinationPath: string }
    const data = await copyFileService(fileId, destinationPath)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const getFileDetails = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileId } = req.params as { fileId: string }
    const data = await getFileDetailsService(fileId)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const moveFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sourcePath, destinationPath } = req.body as {
      sourcePath: string
      destinationPath: string
    }
    const data = await moveFolderService(sourcePath, destinationPath)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const copyFolder = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sourcePath, destinationPath } = req.body as {
      sourcePath: string
      destinationPath: string
    }
    const data = await copyFolderService(sourcePath, destinationPath)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const moveItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, destinationPath, type } = req.body as {
      id: string
      destinationPath: string
      type?: 'file' | 'folder'
    }
    const data = await moveItemService(id, destinationPath, type)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const copyItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id, destinationPath, type } = req.body as {
      id: string
      destinationPath: string
      type?: 'file' | 'folder'
    }
    const data = await copyItemService(id, destinationPath, type)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const bulkDeleteFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileIds } = req.body as { fileIds: string[] }
    const data = await bulkDeleteFilesService(fileIds)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const bulkMoveFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileIds, destinationPath } = req.body as {
      fileIds: string[]
      destinationPath: string
    }
    const data = await bulkMoveFilesService(fileIds, destinationPath)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const bulkCopyFiles = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileIds, destinationPath } = req.body as {
      fileIds: string[]
      destinationPath: string
    }
    const data = await bulkCopyFilesService(fileIds, destinationPath)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const bulkAddTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileIds, tags } = req.body as { fileIds: string[]; tags: string[] }
    const data = await bulkAddTagsService(fileIds, tags)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

export const bulkRemoveTags = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { fileIds, tags } = req.body as { fileIds: string[]; tags: string[] }
    const data = await bulkRemoveTagsService(fileIds, tags)
    res.json(data)
  } catch (e) {
    next(e)
  }
}

// ============================================================================
// SEARCH AND FILTERING
// ============================================================================

export const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = await searchMediaService((req as any).query)
    res.json(data)
  } catch (e) {
    next(e)
  }
}
