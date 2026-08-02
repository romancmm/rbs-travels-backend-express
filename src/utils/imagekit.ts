import {
  IMAGEKIT_PRIVATE_KEY,
  IMAGEKIT_PUBLIC_KEY,
  IMAGEKIT_ROOT_FOLDER,
  IMAGEKIT_URL_ENDPOINT,
} from '@/config/env'
import ImageKit from 'imagekit'

let imagekit: ImageKit | null = null

// Resolve and validate the per-deployment "bucket" root folder (see IMAGEKIT_ROOT_FOLDER).
// A bad value here would silently make one deployment's files land in another's folder,
// so an invalid slug disables ImageKit the same way missing credentials do, instead of
// silently sanitizing it.
function resolveProjectRootSlug(): string {
  const raw = IMAGEKIT_ROOT_FOLDER.trim()
  if (!raw) return ''

  const stripped = raw.replace(/^\/+/, '').replace(/\/+$/, '')
  if (!/^[A-Za-z0-9_-]+$/.test(stripped)) {
    console.error(
      `[ImageKit] Invalid IMAGEKIT_ROOT_FOLDER "${IMAGEKIT_ROOT_FOLDER}" - must be a single folder name/slug (letters, numbers, "-", "_" only, no "/")`,
    )
    return ''
  }
  return stripped
}

const PROJECT_ROOT_SLUG = resolveProjectRootSlug()
const projectRootInvalid = IMAGEKIT_ROOT_FOLDER.trim() !== '' && PROJECT_ROOT_SLUG === ''

/** This deployment's project-root path (e.g. "/client-acme"), or '' when unscoped. */
export const PROJECT_ROOT_PATH = PROJECT_ROOT_SLUG ? `/${PROJECT_ROOT_SLUG}` : ''

/**
 * Inbound: prefix a caller-supplied, root-relative path/folder with this deployment's
 * project-root folder before it's sent to the ImageKit SDK. No-op when unscoped.
 * Overloaded so a definite `string` in (e.g. a required `parentFolderPath`) yields a
 * definite `string` out, while an optional `folder?: string` stays optional.
 */
export function scopeToProjectRoot(input: string): string
export function scopeToProjectRoot(input?: string): string | undefined
export function scopeToProjectRoot(input?: string): string | undefined {
  if (!PROJECT_ROOT_PATH) return input

  const segments = (input ?? '/').trim().split('/').filter(Boolean)
  if (segments.includes('..')) {
    throw new Error(`Invalid path "${input}": ".." is not allowed`)
  }
  return segments.length ? `${PROJECT_ROOT_PATH}/${segments.join('/')}` : PROJECT_ROOT_PATH
}

/**
 * Outbound: strip this deployment's project-root prefix off an ImageKit-absolute
 * path/folderPath/filePath before returning it to API consumers, so responses stay
 * root-relative regardless of scoping. No-op when unscoped.
 */
export function unscopeFromProjectRoot<T extends string | null | undefined>(rawPath: T): T {
  if (!PROJECT_ROOT_PATH || rawPath == null) return rawPath
  if (rawPath === PROJECT_ROOT_PATH) return '/' as T
  if (rawPath.startsWith(`${PROJECT_ROOT_PATH}/`)) {
    return rawPath.slice(PROJECT_ROOT_PATH.length) as T
  }
  // Shouldn't happen if every inbound call goes through scopeToProjectRoot first -
  // don't silently misreport location if it ever does.
  console.warn(`[ImageKit] path outside project root "${PROJECT_ROOT_PATH}": ${rawPath}`)
  return rawPath
}

if (!IMAGEKIT_PUBLIC_KEY || !IMAGEKIT_PRIVATE_KEY) {
  // ImageKit is optional - only initialize if credentials are provided
  console.warn('[ImageKit] Missing IMAGEKIT_PUBLIC_KEY or IMAGEKIT_PRIVATE_KEY in environment')
  console.warn('[ImageKit] Media upload features will be disabled')
} else if (projectRootInvalid) {
  console.warn('[ImageKit] Media upload features will be disabled until IMAGEKIT_ROOT_FOLDER is fixed')
} else {
  try {
    imagekit = new ImageKit({
      publicKey: IMAGEKIT_PUBLIC_KEY,
      privateKey: IMAGEKIT_PRIVATE_KEY,
      urlEndpoint: IMAGEKIT_URL_ENDPOINT,
    })
    console.log(
      `[ImageKit] Initialized successfully (root: ${PROJECT_ROOT_PATH || '/ — true account root'})`,
    )
  } catch (error) {
    console.error('[ImageKit] Failed to initialize:', error)
  }
}

export default imagekit as ImageKit
