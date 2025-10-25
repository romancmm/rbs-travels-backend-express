import imagekit from '@/utils/imagekit'
import type { MediaListQuery } from '@/validators/media.validator'

export const listMediaService = async (query: MediaListQuery) => {
  const { page = 1, perPage = 10, path = '/', fileType = 'all' } = query
  const skip = (page - 1) * perPage
  const options: any = { path, skip, limit: perPage }
  if (fileType && fileType !== 'all') options.fileType = fileType

  const items = await imagekit.listFiles(options)
  // ImageKit listFiles does not return total count; we approximate pagination
  // by returning next page availability if items length equals limit
  const hasMore = items.length === perPage
  return { items, page, perPage, hasMore }
}

export const createFolderService = async (path: string) => {
  // Ensure leading slash
  const folderPath = path.startsWith('/') ? path : `/${path}`
  const result = await imagekit.createFolder({
    folderName: folderPath.split('/').pop()!,
    parentFolderPath: folderPath.substring(0, folderPath.lastIndexOf('/')) || '/',
  })
  return result
}

export const deleteFileService = async (fileId: string) => {
  const result = await imagekit.deleteFile(fileId)
  return result
}

export const deleteFolderService = async (path: string) => {
  const folderPath = path.startsWith('/') ? path : `/${path}`
  const result = await imagekit.deleteFolder(folderPath)
  return result
}
