import imagekit from '@/utils/imagekit'

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
    folder,
  })
  return res
}

/**
 * Upload multiple files to ImageKit
 * Returns array of URLs
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
      folder,
    })
  )

  const results = await Promise.all(uploadPromises)
  return results.map((res) => res.url)
}

/**
 * Delete files from ImageKit by fileIds
 */
export const deleteFilesFromImageKitService = async (fileIds: string[]) => {
  const deletePromises = fileIds.map((fileId) => imagekit.deleteFile(fileId))
  await Promise.all(deletePromises)
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
