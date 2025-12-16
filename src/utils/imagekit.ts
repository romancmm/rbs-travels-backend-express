import { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT } from '@/config/env'
import ImageKit from 'imagekit'

let imagekit: ImageKit | null = null

if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY) {
  // ImageKit is optional - only initialize if credentials are provided
  console.warn('[ImageKit] Missing IMAGEKIT_PUBLIC_KEY or IMAGEKIT_PRIVATE_KEY in environment')
  console.warn('[ImageKit] Media upload features will be disabled')
} else {
  try {
    imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    })
    console.log('[ImageKit] Initialized successfully')
  } catch (error) {
    console.error('[ImageKit] Failed to initialize:', error)
  }
}

export default imagekit as ImageKit
