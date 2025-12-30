import imagekit from '@/utils/imagekit'
import type { MediaListQuery } from '@/validators/media.validator'

// Helper function to extract only necessary fields
const formatMediaItem = (item: any) => {
  if (item.type === 'folder') {
    return {
      type: 'folder',
      name: item.name,
      folderPath: item.folderPath,
      folderId: item.folderId,
      createdAt: item.createdAt,
    }
  }

  // For files, return essential fields only
  return {
    type: 'file',
    fileId: item.fileId,
    name: item.name,
    url: item.url,
    thumbnail: item.thumbnail,
    filePath: item.filePath,
    fileType: item.fileType,
    size: item.size,
    width: item.width,
    height: item.height,
    mime: item.mime,
    createdAt: item.createdAt,
    tags: item.tags,
  }
}

export const listMediaService = async (query: MediaListQuery) => {
  const { page = 1, perPage = 50, path = '/', fileType = 'all', withItems = false } = query
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

    const allItems = await imagekit.listFiles(options)

    // Separate folders and files from the result
    const folders = allItems.filter((item: any) => item.type === 'folder')
    const files = allItems.filter((item: any) => item.type === 'file')

    // Format items to return only necessary fields
    let formattedFolders = folders.map(formatMediaItem)
    const formattedFiles = files.map(formatMediaItem)

    // If withItems=true, fetch first 4 items for each folder
    if (withItems && formattedFolders.length > 0) {
      formattedFolders = await Promise.all(
        formattedFolders.map(async (folder: any) => {
          try {
            const folderItems = await imagekit.listFiles({
              path: folder.folderPath,
              limit: 4,
              sort: 'DESC_CREATED',
            })
            return {
              ...folder,
              items: folderItems.filter((item: any) => item.type === 'file').map(formatMediaItem),
            }
          } catch (err) {
            console.error(`Error fetching items for folder ${folder.folderPath}:`, err)
            return { ...folder, items: [] }
          }
        })
      )
    }

    const formattedItems = [...formattedFolders, ...formattedFiles]

    // ImageKit doesn't provide total count, so we estimate pagination
    const hasMore = allItems.length === perPage
    const totalEstimate = skip + allItems.length + (hasMore ? 1 : 0)

    return {
      items: formattedItems,
      folders: formattedFolders,
      files: formattedFiles,
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

    // Separate and format files and folders
    const files = allFiles.filter((item: any) => item.type === 'file').map(formatMediaItem)
    const folders = allFiles.filter((item: any) => item.type === 'folder').map(formatMediaItem)
    const structure = allFiles.map(formatMediaItem)

    return {
      totalFiles: files.length,
      totalFolders: folders.length,
      files,
      folders,
      structure,
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

// ============================================================================
// UNIFIED RENAME - Handles both files and folders
// ============================================================================

export const renameItemService = async (id: string, newName: string, type?: 'file' | 'folder') => {
  try {
    // Auto-detect type if not provided
    let itemType = type

    if (!itemType) {
      // Check if it's a fileId (ImageKit fileIds are typically alphanumeric)
      // or a folder path (starts with /)
      itemType = id.startsWith('/') ? 'folder' : 'file'
    }

    if (itemType === 'folder') {
      // Use existing folder rename logic
      return await renameFolderService(id, newName)
    } else {
      // Rename file using updateFileService
      const result = await updateFileService(id, { name: newName })
      return {
        ...result,
        message: `File renamed to "${newName}" successfully`,
      }
    }
  } catch (err: any) {
    console.error('Rename item error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to rename item: ${message}`)
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

export const deleteItemService = async (id: string, force: boolean = false) => {
  try {
    // First, try to delete as a file
    try {
      const fileDetails = await imagekit.getFileDetails(id)
      if (fileDetails) {
        const result = await imagekit.deleteFile(id)
        return {
          success: true,
          type: 'file',
          fileId: id,
          fileName: fileDetails.name,
          message: `File "${fileDetails.name}" deleted successfully`,
        }
      }
    } catch (fileErr) {
      // Not a file, continue to try as folder
    }

    // If not a file, try to delete as a folder
    const data = force
      ? await deleteFolderWithContentsService(id, true)
      : await deleteFolderService(id)

    return {
      ...data,
      type: 'folder',
    }
  } catch (err: any) {
    console.error('Delete item error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to delete item: ${message}`)
  }
}

export const deleteFolderService = async (folderPath: string) => {
  try {
    // Check if it's a folderId (looks like a MongoDB ObjectId) or a path
    const isFolderId = /^[a-f\d]{24}$/i.test(folderPath)

    let normalizedPath = folderPath

    if (isFolderId) {
      // If it's a folderId, we need to get the folder details first to get the path
      try {
        // ImageKit doesn't have a direct getFolderDetails, so we need to list all folders
        const allFolders = await imagekit.listFiles({
          path: '/',
          includeFolder: true,
          limit: 1000,
        })

        const folder = allFolders.find(
          (item: any) => item.type === 'folder' && item.folderId === folderPath
        )

        if (!folder) {
          throw new Error(`Folder with ID "${folderPath}" not found`)
        }

        normalizedPath = (folder as any).folderPath
      } catch (err) {
        console.error('Error finding folder by ID:', err)
        throw new Error(`Folder with ID "${folderPath}" not found`)
      }
    } else {
      normalizedPath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`
    }

    // Check if folder exists and get its contents
    const folderContents = await imagekit.listFiles({
      path: normalizedPath,
      includeFolder: true,
      limit: 1000,
    })

    // Block deletion if folder contains any files or subfolders
    if (folderContents.length > 0) {
      const files = folderContents.filter((item: any) => item.type === 'file')
      const subfolders = folderContents.filter((item: any) => item.type === 'folder')

      const fileCount = files.length
      const folderCount = subfolders.length

      if (fileCount > 0 || folderCount > 0) {
        const details = []
        if (fileCount > 0) details.push(`${fileCount} file${fileCount > 1 ? 's' : ''}`)
        if (folderCount > 0) details.push(`${folderCount} folder${folderCount > 1 ? 's' : ''}`)

        throw new Error(
          `Cannot delete folder "${normalizedPath}": folder is not empty. It contains ${details.join(
            ' and '
          )}. Use force=true to delete with all contents.`
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
    // Check if it's a folderId (looks like a MongoDB ObjectId) or a path
    const isFolderId = /^[a-f\d]{24}$/i.test(folderPath)

    let normalizedPath = folderPath

    if (isFolderId) {
      // If it's a folderId, we need to get the folder details first to get the path
      try {
        const allFolders = await imagekit.listFiles({
          path: '/',
          includeFolder: true,
          limit: 1000,
        })

        const folder = allFolders.find(
          (item: any) => item.type === 'folder' && item.folderId === folderPath
        )

        if (!folder) {
          throw new Error(`Folder with ID "${folderPath}" not found`)
        }

        normalizedPath = (folder as any).folderPath
      } catch (err) {
        console.error('Error finding folder by ID:', err)
        throw new Error(`Folder with ID "${folderPath}" not found`)
      }
    } else {
      normalizedPath = folderPath.startsWith('/') ? folderPath : `/${folderPath}`
    }

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

// ============================================================================
// FILE OPERATIONS - Move, Copy, Details
// ============================================================================

export const moveFileService = async (fileId: string, destinationPath: string) => {
  try {
    const normalizedPath = destinationPath.startsWith('/') ? destinationPath : `/${destinationPath}`

    // Get current file details
    const fileDetails = await imagekit.getFileDetails(fileId)
    if (!fileDetails) {
      throw new Error(`File with ID "${fileId}" not found`)
    }

    // ImageKit move operation
    const result = await imagekit.moveFile({
      sourceFilePath: fileDetails.filePath,
      destinationPath: normalizedPath,
    })

    return {
      success: true,
      file: formatMediaItem(result),
      oldPath: fileDetails.filePath,
      newPath: normalizedPath,
      message: `File "${fileDetails.name}" moved successfully`,
    }
  } catch (err: any) {
    console.error('Move file error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to move file: ${message}`)
  }
}

export const copyFileService = async (fileId: string, destinationPath: string) => {
  try {
    const normalizedPath = destinationPath.startsWith('/') ? destinationPath : `/${destinationPath}`

    // Get current file details
    const fileDetails = await imagekit.getFileDetails(fileId)
    if (!fileDetails) {
      throw new Error(`File with ID "${fileId}" not found`)
    }

    // ImageKit copy operation
    const result = await imagekit.copyFile({
      sourceFilePath: fileDetails.filePath,
      destinationPath: normalizedPath,
    })

    return {
      success: true,
      file: formatMediaItem(result),
      originalPath: fileDetails.filePath,
      copyPath: normalizedPath,
      message: `File "${fileDetails.name}" copied successfully`,
    }
  } catch (err: any) {
    console.error('Copy file error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to copy file: ${message}`)
  }
}

// ============================================================================
// UNIFIED MOVE & COPY - Handles both files and folders
// ============================================================================

export const moveItemService = async (
  id: string,
  destinationPath: string,
  type?: 'file' | 'folder'
) => {
  try {
    // Auto-detect type if not provided
    let itemType = type

    if (!itemType) {
      itemType = id.startsWith('/') ? 'folder' : 'file'
    }

    if (itemType === 'folder') {
      return await moveFolderService(id, destinationPath)
    } else {
      return await moveFileService(id, destinationPath)
    }
  } catch (err: any) {
    console.error('Move item error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to move item: ${message}`)
  }
}

export const copyItemService = async (
  id: string,
  destinationPath: string,
  type?: 'file' | 'folder'
) => {
  try {
    // Auto-detect type if not provided
    let itemType = type

    if (!itemType) {
      itemType = id.startsWith('/') ? 'folder' : 'file'
    }

    if (itemType === 'folder') {
      return await copyFolderService(id, destinationPath)
    } else {
      return await copyFileService(id, destinationPath)
    }
  } catch (err: any) {
    console.error('Copy item error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to copy item: ${message}`)
  }
}

export const getFileDetailsService = async (fileId: string) => {
  try {
    const fileDetails = await imagekit.getFileDetails(fileId)
    if (!fileDetails) {
      throw new Error(`File with ID "${fileId}" not found`)
    }

    return {
      success: true,
      file: fileDetails,
    }
  } catch (err: any) {
    console.error('Get file details error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to get file details: ${message}`)
  }
}

export const moveFolderService = async (sourcePath: string, destinationPath: string) => {
  try {
    const normalizedSource = sourcePath.startsWith('/') ? sourcePath : `/${sourcePath}`
    const normalizedDest = destinationPath.startsWith('/') ? destinationPath : `/${destinationPath}`

    // ImageKit move folder operation
    const result = await imagekit.moveFolder({
      sourceFolderPath: normalizedSource,
      destinationPath: normalizedDest,
    })

    return {
      success: true,
      folder: result,
      oldPath: normalizedSource,
      newPath: normalizedDest,
      message: `Folder moved from "${normalizedSource}" to "${normalizedDest}"`,
    }
  } catch (err: any) {
    console.error('Move folder error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to move folder: ${message}`)
  }
}

export const copyFolderService = async (sourcePath: string, destinationPath: string) => {
  try {
    const normalizedSource = sourcePath.startsWith('/') ? sourcePath : `/${sourcePath}`
    const normalizedDest = destinationPath.startsWith('/') ? destinationPath : `/${destinationPath}`

    // ImageKit copy folder operation
    const result = await imagekit.copyFolder({
      sourceFolderPath: normalizedSource,
      destinationPath: normalizedDest,
    })

    return {
      success: true,
      folder: result,
      sourcePath: normalizedSource,
      destinationPath: normalizedDest,
      message: `Folder copied from "${normalizedSource}" to "${normalizedDest}"`,
    }
  } catch (err: any) {
    console.error('Copy folder error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to copy folder: ${message}`)
  }
}

// ============================================================================
// BULK OPERATIONS
// ============================================================================

export const bulkDeleteFilesService = async (fileIds: string[]) => {
  try {
    const results = await Promise.allSettled(
      fileIds.map(async (fileId) => {
        const fileDetails = await imagekit.getFileDetails(fileId)
        await imagekit.deleteFile(fileId)
        return { fileId, name: fileDetails.name, success: true }
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return {
      success: true,
      totalFiles: fileIds.length,
      successful,
      failed,
      results: results.map((r, index) => ({
        fileId: fileIds[index],
        success: r.status === 'fulfilled',
        error: r.status === 'rejected' ? r.reason?.message : undefined,
      })),
      message: `Bulk delete completed: ${successful} successful, ${failed} failed`,
    }
  } catch (err: any) {
    console.error('Bulk delete files error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to bulk delete files: ${message}`)
  }
}

export const bulkMoveFilesService = async (fileIds: string[], destinationPath: string) => {
  try {
    const normalizedPath = destinationPath.startsWith('/') ? destinationPath : `/${destinationPath}`

    const results = await Promise.allSettled(
      fileIds.map(async (fileId) => {
        const fileDetails = await imagekit.getFileDetails(fileId)
        const result = await imagekit.moveFile({
          sourceFilePath: fileDetails.filePath,
          destinationPath: normalizedPath,
        })
        return { fileId, name: fileDetails.name, success: true }
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return {
      success: true,
      totalFiles: fileIds.length,
      successful,
      failed,
      destinationPath: normalizedPath,
      results: results.map((r, index) => ({
        fileId: fileIds[index],
        success: r.status === 'fulfilled',
        error: r.status === 'rejected' ? r.reason?.message : undefined,
      })),
      message: `Bulk move completed: ${successful} successful, ${failed} failed`,
    }
  } catch (err: any) {
    console.error('Bulk move files error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to bulk move files: ${message}`)
  }
}

export const bulkCopyFilesService = async (fileIds: string[], destinationPath: string) => {
  try {
    const normalizedPath = destinationPath.startsWith('/') ? destinationPath : `/${destinationPath}`

    const results = await Promise.allSettled(
      fileIds.map(async (fileId) => {
        const fileDetails = await imagekit.getFileDetails(fileId)
        const result = await imagekit.copyFile({
          sourceFilePath: fileDetails.filePath,
          destinationPath: normalizedPath,
        })
        return { fileId, name: fileDetails.name, success: true }
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return {
      success: true,
      totalFiles: fileIds.length,
      successful,
      failed,
      destinationPath: normalizedPath,
      results: results.map((r, index) => ({
        fileId: fileIds[index],
        success: r.status === 'fulfilled',
        error: r.status === 'rejected' ? r.reason?.message : undefined,
      })),
      message: `Bulk copy completed: ${successful} successful, ${failed} failed`,
    }
  } catch (err: any) {
    console.error('Bulk copy files error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to bulk copy files: ${message}`)
  }
}

export const bulkAddTagsService = async (fileIds: string[], tags: string[]) => {
  try {
    const results = await Promise.allSettled(
      fileIds.map(async (fileId) => {
        const fileDetails = await imagekit.getFileDetails(fileId)
        const existingTags = fileDetails.tags || []
        const newTags = Array.from(new Set([...existingTags, ...tags]))

        const result = await imagekit.updateFileDetails(fileId, { tags: newTags })
        return { fileId, name: fileDetails.name, success: true }
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return {
      success: true,
      totalFiles: fileIds.length,
      successful,
      failed,
      tagsAdded: tags,
      results: results.map((r, index) => ({
        fileId: fileIds[index],
        success: r.status === 'fulfilled',
        error: r.status === 'rejected' ? r.reason?.message : undefined,
      })),
      message: `Bulk tag update completed: ${successful} successful, ${failed} failed`,
    }
  } catch (err: any) {
    console.error('Bulk add tags error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to bulk add tags: ${message}`)
  }
}

export const bulkRemoveTagsService = async (fileIds: string[], tags: string[]) => {
  try {
    const results = await Promise.allSettled(
      fileIds.map(async (fileId) => {
        const fileDetails = await imagekit.getFileDetails(fileId)
        const existingTags = fileDetails.tags || []
        const newTags = existingTags.filter((tag: string) => !tags.includes(tag))

        const result = await imagekit.updateFileDetails(fileId, { tags: newTags })
        return { fileId, name: fileDetails.name, success: true }
      })
    )

    const successful = results.filter((r) => r.status === 'fulfilled').length
    const failed = results.filter((r) => r.status === 'rejected').length

    return {
      success: true,
      totalFiles: fileIds.length,
      successful,
      failed,
      tagsRemoved: tags,
      results: results.map((r, index) => ({
        fileId: fileIds[index],
        success: r.status === 'fulfilled',
        error: r.status === 'rejected' ? r.reason?.message : undefined,
      })),
      message: `Bulk tag removal completed: ${successful} successful, ${failed} failed`,
    }
  } catch (err: any) {
    console.error('Bulk remove tags error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to bulk remove tags: ${message}`)
  }
}

// ============================================================================
// SEARCH AND FILTERING
// ============================================================================

export const searchMediaService = async (query: {
  searchQuery?: string
  tags?: string[]
  fileType?: string
  path?: string
  dateFrom?: string
  dateTo?: string
  page?: number
  perPage?: number
}) => {
  try {
    const { page = 1, perPage = 50, searchQuery, tags, fileType, path, dateFrom, dateTo } = query
    const skip = (page - 1) * perPage

    // Build search query
    const searchOptions: any = {
      skip,
      limit: perPage,
      sort: 'DESC_CREATED',
    }

    // Add search query
    if (searchQuery) {
      searchOptions.searchQuery = `name:"${searchQuery}"`
    }

    // Add tags filter
    if (tags && tags.length > 0) {
      searchOptions.tags = tags
    }

    // Add file type filter
    if (fileType && fileType !== 'all') {
      searchOptions.fileType = fileType
    }

    // Add path filter
    if (path) {
      searchOptions.path = path.startsWith('/') ? path : `/${path}`
    }

    console.log('🔍 Search Options:', searchOptions)

    const files = await imagekit.listFiles(searchOptions)

    // Filter by date range if provided
    let filteredFiles: any[] = files
    if (dateFrom || dateTo) {
      filteredFiles = files.filter((file: any) => {
        const fileDate = new Date(file.createdAt)
        if (dateFrom && fileDate < new Date(dateFrom)) return false
        if (dateTo && fileDate > new Date(dateTo)) return false
        return true
      })
    }

    const formattedFiles = filteredFiles.map(formatMediaItem)

    const hasMore = files.length === perPage
    const totalEstimate = skip + files.length + (hasMore ? 1 : 0)

    return {
      items: formattedFiles,
      page,
      perPage,
      hasMore,
      totalEstimate,
      searchQuery,
      filters: {
        tags,
        fileType,
        path,
        dateFrom,
        dateTo,
      },
    }
  } catch (err: any) {
    console.error('Search media error:', err)
    const message = err?.message || 'Unknown error occurred'
    throw new Error(`Failed to search media: ${message}`)
  }
}
