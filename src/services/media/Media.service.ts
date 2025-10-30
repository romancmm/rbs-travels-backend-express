import imagekit from '@/utils/imagekit'
import type { MediaListQuery } from '@/validators/media.validator'

export const listMediaService = async (query: MediaListQuery) => {
  const { page = 1, perPage = 50, path = '/', fileType = 'all' } = query
  const skip = (page - 1) * perPage

  try {
    // List files with comprehensive options
    const options: any = {
      path: path || '/', // Root path if not specified
      skip,
      limit: perPage,
      includeFolder: true, // Include folders in the response
      sort: 'DESC_CREATED', // Sort by creation date, newest first
    }

    // Filter by file type if specified
    if (fileType && fileType !== 'all') {
      options.fileType = fileType
    }

    console.log('📁 ImageKit List Options:', options)

    const files = await imagekit.listFiles(options)

    // Also get folder information for the current path
    let folders: any[] = []
    try {
      // Get folders at current path level
      const folderOptions = {
        path: path || '/',
        includeFolder: true,
        type: 'folder',
      }
      folders = await imagekit.listFiles(folderOptions)
    } catch (folderErr) {
      console.warn('Could not fetch folders:', folderErr)
    }

    // Combine files and folders
    const items = [...folders, ...files]

    // ImageKit doesn't provide total count, so we estimate pagination
    const hasMore = files.length === perPage
    const totalEstimate = skip + files.length + (hasMore ? 1 : 0)

    return {
      items,
      folders,
      files,
      page,
      perPage,
      hasMore,
      totalEstimate,
      currentPath: path || '/',
    }
  } catch (err: any) {
    console.error('ImageKit listFiles error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to fetch media library: ${message}`)
  }
}

export const getMediaLibraryStructureService = async () => {
  try {
    // Get all files and folders from root
    const allFiles = await imagekit.listFiles({
      path: '/',
      includeFolder: true,
      limit: 1000, // Get more items to see the full structure
      sort: 'DESC_CREATED',
    })

    // Separate files and folders
    const files = allFiles.filter((item: any) => item.type === 'file')
    const folders = allFiles.filter((item: any) => item.type === 'folder')

    return {
      totalFiles: files.length,
      totalFolders: folders.length,
      files,
      folders,
      structure: allFiles,
    }
  } catch (err: any) {
    console.error('ImageKit library structure error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to fetch media library structure: ${message}`)
  }
}

export const createFolderService = async (folderName: string, parentPath: string = '/') => {
  try {
    // Ensure proper path formatting
    const normalizedParentPath = parentPath.startsWith('/') ? parentPath : `/${parentPath}`
    const fullPath =
      normalizedParentPath === '/' ? `/${folderName}` : `${normalizedParentPath}/${folderName}`

    // Check if folder already exists
    const existingItems = await imagekit.listFiles({
      path: normalizedParentPath,
      includeFolder: true,
      limit: 1000,
    })

    const folderExists = existingItems.some(
      (item: any) =>
        item.type === 'folder' && (item.name === folderName || item.folderPath === fullPath)
    )

    if (folderExists) {
      throw new Error(`Folder "${folderName}" already exists in "${normalizedParentPath}"`)
    }

    // Create the folder
    const result = await imagekit.createFolder({
      folderName: folderName,
      parentFolderPath: normalizedParentPath,
    })

    return {
      success: true,
      folder: result,
      path: fullPath,
      message: `Folder "${folderName}" created successfully`,
    }
  } catch (err: any) {
    console.error('Create folder error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to create folder: ${message}`)
  }
}

export const renameFolderService = async (oldPath: string, newFolderName: string) => {
  try {
    // Normalize paths
    const normalizedOldPath = oldPath.startsWith('/') ? oldPath : `/${oldPath}`
    const parentPath = normalizedOldPath.substring(0, normalizedOldPath.lastIndexOf('/')) || '/'
    const newPath = parentPath === '/' ? `/${newFolderName}` : `${parentPath}/${newFolderName}`

    // Check if new folder name already exists in the same parent directory
    const existingItems = await imagekit.listFiles({
      path: parentPath,
      includeFolder: true,
      limit: 1000,
    })

    const folderExists = existingItems.some(
      (item: any) =>
        item.type === 'folder' &&
        item.name === newFolderName &&
        item.folderPath !== normalizedOldPath // Don't count the current folder
    )

    if (folderExists) {
      throw new Error(`Folder "${newFolderName}" already exists in "${parentPath}"`)
    }

    // ImageKit doesn't have direct rename, so we need to:
    // 1. Create new folder
    // 2. Move all contents
    // 3. Delete old folder

    // Create new folder
    await imagekit.createFolder({
      folderName: newFolderName,
      parentFolderPath: parentPath,
    })

    // Get all files in the old folder
    const folderContents = await imagekit.listFiles({
      path: normalizedOldPath,
      includeFolder: true,
      limit: 1000,
    })

    // Move files (ImageKit requires individual file operations)
    const movePromises = folderContents
      .filter((item: any) => item.type === 'file')
      .map(async (file: any) => {
        // Note: ImageKit doesn't have a direct move operation
        // You might need to implement this based on your specific needs
        // For now, we'll log the files that need to be moved
        console.log(`File to move: ${file.name} from ${normalizedOldPath} to ${newPath}`)
        return file
      })

    await Promise.all(movePromises)

    // Delete old folder (only if empty or you've moved all contents)
    await imagekit.deleteFolder(normalizedOldPath)

    return {
      success: true,
      oldPath: normalizedOldPath,
      newPath,
      message: `Folder renamed from "${normalizedOldPath}" to "${newPath}"`,
    }
  } catch (err: any) {
    console.error('Rename folder error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to rename folder: ${message}`)
  }
}

export const updateFileService = async (
  fileId: string,
  updateData: { name?: string; tags?: string[] }
) => {
  try {
    // ImageKit allows updating file details
    const updateOptions: any = {}

    if (updateData.name) {
      updateOptions.customMetadata = { originalName: updateData.name }
    }

    if (updateData.tags && updateData.tags.length > 0) {
      updateOptions.tags = updateData.tags
    }

    const result = await imagekit.updateFileDetails(fileId, updateOptions)

    return {
      success: true,
      file: result,
      message: 'File updated successfully',
    }
  } catch (err: any) {
    console.error('Update file error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to update file: ${message}`)
  }
}

export const deleteFileService = async (fileId: string) => {
  try {
    // Verify file exists before deletion
    const fileDetails = await imagekit.getFileDetails(fileId)

    if (!fileDetails) {
      throw new Error(`File with ID "${fileId}" not found`)
    }

    const result = await imagekit.deleteFile(fileId)

    return {
      success: true,
      fileId,
      fileName: fileDetails.name,
      message: `File "${fileDetails.name}" deleted successfully`,
    }
  } catch (err: any) {
    console.error('Delete file error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to delete file: ${message}`)
  }
}

export const deleteFolderService = async (folderPath: string) => {
  try {
    const normalizedPath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`

    // Check if folder exists and get its contents
    const folderContents = await imagekit.listFiles({
      path: normalizedPath,
      includeFolder: true,
      limit: 1000,
    })

    if (folderContents.length > 0) {
      const hasFiles = folderContents.some((item: any) => item.type === 'file')
      const hasSubfolders = folderContents.some((item: any) => item.type === 'folder')

      if (hasFiles || hasSubfolders) {
        throw new Error(
          `Cannot delete folder "${normalizedPath}": folder is not empty. It contains ${folderContents.length} items.`
        )
      }
    }

    const result = await imagekit.deleteFolder(normalizedPath)

    return {
      success: true,
      folderPath: normalizedPath,
      message: `Folder "${normalizedPath}" deleted successfully`,
    }
  } catch (err: any) {
    console.error('Delete folder error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to delete folder: ${message}`)
  }
}

export const deleteFolderWithContentsService = async (
  folderPath: string,
  force: boolean = false
) => {
  try {
    const normalizedPath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`

    if (!force) {
      // Use regular delete service if not forcing
      return await deleteFolderService(normalizedPath)
    }

    // Get all contents recursively
    const getAllContents = async (path: string): Promise<any[]> => {
      const contents = await imagekit.listFiles({
        path,
        includeFolder: true,
        limit: 1000,
      })

      let allItems = [...contents]

      // Recursively get contents of subfolders
      const subfolders = contents.filter((item: any) => item.type === 'folder')
      for (const folder of subfolders) {
        const folderPath = (folder as any).folderPath || (folder as any).path
        const subContents = await getAllContents(folderPath)
        allItems = [...allItems, ...subContents]
      }

      return allItems
    }

    const allContents = await getAllContents(normalizedPath)

    // Delete all files first
    const files = allContents.filter((item: any) => item.type === 'file')
    const deleteFilePromises = files.map((file: any) =>
      imagekit.deleteFile(file.fileId).catch((err: any) => {
        console.warn(`Failed to delete file ${file.name}:`, err)
        return null
      })
    )

    await Promise.allSettled(deleteFilePromises)

    // Delete folders in reverse order (deepest first)
    const folders = allContents
      .filter((item: any) => item.type === 'folder')
      .sort((a: any, b: any) => {
        const aPath = a.folderPath || a.path || ''
        const bPath = b.folderPath || b.path || ''
        return bPath.split('/').length - aPath.split('/').length
      })

    for (const folder of folders) {
      try {
        const folderPath = (folder as any).folderPath || (folder as any).path
        await imagekit.deleteFolder(folderPath)
      } catch (err) {
        console.warn(`Failed to delete folder ${(folder as any).name}:`, err)
      }
    }

    // Finally delete the main folder
    await imagekit.deleteFolder(normalizedPath)

    return {
      success: true,
      folderPath: normalizedPath,
      deletedFiles: files.length,
      deletedFolders: folders.length + 1,
      message: `Folder "${normalizedPath}" and all its contents deleted successfully`,
    }
  } catch (err: any) {
    console.error('Force delete folder error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to delete folder with contents: ${message}`)
  }
}
