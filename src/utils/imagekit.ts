import { IMAGEKIT_PRIVATE_KEY, IMAGEKIT_PUBLIC_KEY, IMAGEKIT_URL_ENDPOINT } from '@/config/env'
import ImageKit from 'imagekit'

if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY) {
  // We don't throw here to avoid crashing the app; services should handle missing keys.
  // eslint-disable-next-line no-console
  console.warn('[ImageKit] Missing IMAGEKIT_PUBLIC_KEY or IMAGEKIT_PRIVATE_KEY in environment')
}

const imagekit = new ImageKit({
  publicKey: IMAGEKIT_PUBLIC_KEY || '',
  privateKey: IMAGEKIT_PRIVATE_KEY || '',
  urlEndpoint: IMAGEKIT_URL_ENDPOINT,
})

export default imagekit
