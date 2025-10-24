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
