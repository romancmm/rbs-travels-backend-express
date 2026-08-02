import CacheService from '@/services/cache.service'
import { formatMediaItem } from '@/services/media/Media.service'
import imagekit, { scopeToProjectRoot } from '@/utils/imagekit'

// Public media list/structure responses are cached (see routes/public.ts) — bust them on any mutation
const invalidateMediaCache = () => CacheService.invalidatePattern('public:/media*')

export const getUploadAuthParamsService = () => {
  // ImageKit SDK generates authentication parameters for client-side upload
  const auth = imagekit.getAuthenticationParameters()
  return auth
}

export const uploadFileToImageKitService = async (options: {
  file: Buffer
  fileName: string
  folder?: string
}) => {
  const { file, fileName, folder } = options
  const res = await imagekit.upload({
    file,
    fileName,
    folder: scopeToProjectRoot(folder),
  })
  await invalidateMediaCache()
  // upload() already returns the full, confirmed file record (it's synchronous) - shape it
  // the same as every list/search response so the frontend can merge it in without a refetch.
  // Note: UploadResponse names the thumbnail field differently (thumbnailUrl vs thumbnail)
  // and doesn't include createdAt at all - normalize both before formatting.
  return formatMediaItem({
    ...res,
    type: 'file',
    thumbnail: res.thumbnailUrl,
    createdAt: new Date().toISOString(),
  })
}

/**
 * Upload multiple files to ImageKit
 * Returns an array of formatted media items (same shape as list/search results)
 */
export const uploadMultipleFilesToImageKitService = async (options: {
  files: Array<{ buffer: Buffer; filename: string }>
  folder?: string
}) => {
  const { files, folder } = options

  const uploadPromises = files.map((file) =>
    imagekit.upload({
      file: file.buffer,
      fileName: file.filename,
      folder: scopeToProjectRoot(folder),
    })
  )

  const results = await Promise.all(uploadPromises)
  await invalidateMediaCache()
  return results.map((res) =>
    formatMediaItem({
      ...res,
      type: 'file',
      thumbnail: res.thumbnailUrl,
      createdAt: new Date().toISOString(),
    })
  )
}

/**
 * Delete files from ImageKit by fileIds
 */
export const deleteFilesFromImageKitService = async (fileIds: string[]) => {
  const deletePromises = fileIds.map((fileId) => imagekit.deleteFile(fileId))
  await Promise.all(deletePromises)
  await invalidateMediaCache()
  return { deleted: fileIds.length }
}

/**
 * Extract fileId from ImageKit URL
 */
export const extractFileIdFromUrl = (url: string): string | null => {
  // ImageKit URL format: https://ik.imagekit.io/{id}/path/to/file_fileId.ext
  // The fileId is typically the last part before the extension
  const match = url.match(/\/([^/]+)_([^_/]+)\.[^.]+$/)
  if (match && match[2]) return match[2]

  // Alternative: try to extract from the path
  const parts = url.split('/')
  const filename = parts[parts.length - 1]
  if (!filename) return null

  const fileId = filename.split('_').pop()?.split('.')[0]
  return fileId || null
}
