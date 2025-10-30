# Unified Upload Endpoint Usage Guide

## Overview

The upload API now uses a **single unified endpoint** `/admin/upload` that intelligently handles
both single and multiple file uploads. No need for separate routes anymore!

## Endpoint

**POST** `/admin/upload`

## Features

✅ **Single file upload** using `file` field  
✅ **Multiple file upload** using `files[]` field  
✅ **Existing URL preservation** via `existing` parameter  
✅ **Batch file deletion** via `deletes` parameter  
✅ **Automatic detection** of single vs multiple uploads

## Usage Examples

### 1. Upload a Single File

```typescript
const formData = new FormData()
formData.append('file', singleFile)
formData.append('folder', 'banners')

const response = await fetch('/admin/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})

const result = await response.json()
// {
//   success: true,
//   urls: ['https://ik.imagekit.io/po5udmmiz/banners/hero.jpg'],
//   uploaded: 1,
//   deleted: 0
// }
```

### 2. Upload Multiple Files

```typescript
const formData = new FormData()
selectedFiles.forEach((file) => {
  formData.append('files[]', file)
})
formData.append('folder', 'products')

const response = await fetch('/admin/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})

const result = await response.json()
// {
//   success: true,
//   urls: [
//     'https://ik.imagekit.io/po5udmmiz/products/image1.jpg',
//     'https://ik.imagekit.io/po5udmmiz/products/image2.jpg',
//     'https://ik.imagekit.io/po5udmmiz/products/image3.jpg'
//   ],
//   uploaded: 3,
//   deleted: 0
// }
```

### 3. Update Gallery (Keep Existing + Add New)

```typescript
const formData = new FormData()

// Add new files
newFiles.forEach((file) => formData.append('files[]', file))

// Preserve existing URLs
formData.append(
  'existing',
  JSON.stringify([
    'https://ik.imagekit.io/po5udmmiz/gallery/existing1.jpg',
    'https://ik.imagekit.io/po5udmmiz/gallery/existing2.jpg',
  ])
)

formData.append('folder', 'gallery')

const response = await fetch('/admin/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})

const result = await response.json()
// {
//   success: true,
//   urls: [
//     'https://ik.imagekit.io/po5udmmiz/gallery/existing1.jpg',
//     'https://ik.imagekit.io/po5udmmiz/gallery/existing2.jpg',
//     'https://ik.imagekit.io/po5udmmiz/gallery/new1.jpg'
//   ],
//   uploaded: 1,
//   deleted: 0
// }
```

### 4. Replace Files (Delete Old + Upload New)

```typescript
const formData = new FormData()

// Upload new file
formData.append('file', newFile)

// Delete old file
formData.append(
  'deletes',
  JSON.stringify(['https://ik.imagekit.io/po5udmmiz/banners/old-hero.jpg'])
)

formData.append('folder', 'banners')

const response = await fetch('/admin/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})

const result = await response.json()
// {
//   success: true,
//   urls: ['https://ik.imagekit.io/po5udmmiz/banners/new-hero.jpg'],
//   uploaded: 1,
//   deleted: 1
// }
```

### 5. Complex Gallery Update (Existing + New + Delete)

```typescript
const formData = new FormData()

// Add new files
newFiles.forEach((file) => formData.append('files[]', file))

// Keep these existing images
formData.append(
  'existing',
  JSON.stringify([
    'https://ik.imagekit.io/po5udmmiz/products/keep1.jpg',
    'https://ik.imagekit.io/po5udmmiz/products/keep2.jpg',
  ])
)

// Remove these old images
formData.append(
  'deletes',
  JSON.stringify([
    'https://ik.imagekit.io/po5udmmiz/products/remove1.jpg',
    'https://ik.imagekit.io/po5udmmiz/products/remove2.jpg',
  ])
)

formData.append('folder', 'products')

const response = await fetch('/admin/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})

const result = await response.json()
// {
//   success: true,
//   urls: [
//     'https://ik.imagekit.io/po5udmmiz/products/keep1.jpg',
//     'https://ik.imagekit.io/po5udmmiz/products/keep2.jpg',
//     'https://ik.imagekit.io/po5udmmiz/products/new1.jpg',
//     'https://ik.imagekit.io/po5udmmiz/products/new2.jpg'
//   ],
//   uploaded: 2,
//   deleted: 2
// }
```

### 6. Only Delete Files (No New Uploads)

```typescript
const formData = new FormData()

// Delete files only
formData.append(
  'deletes',
  JSON.stringify([
    'https://ik.imagekit.io/po5udmmiz/temp/file1.jpg',
    'https://ik.imagekit.io/po5udmmiz/temp/file2.jpg',
  ])
)

const response = await fetch('/admin/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})

const result = await response.json()
// {
//   success: true,
//   urls: [],
//   uploaded: 0,
//   deleted: 2
// }
```

## Reusable Upload Utility Function

Here's a universal upload function that works with all scenarios:

```typescript
/**
 * Upload files to ImageKit with support for existing URLs and deletions
 * @param files - New files to upload (single File, File[], or null)
 * @param options - Upload options
 */
export const uploadToImageKit = async (
  files: File | File[] | null,
  options?: {
    folder?: string
    existing?: string[]
    deletes?: string[]
  }
): Promise<string[]> => {
  const formData = new FormData()

  // Handle single or multiple files
  if (files) {
    if (Array.isArray(files)) {
      // Multiple files
      files.forEach((file) => formData.append('files[]', file))
    } else {
      // Single file
      formData.append('file', files)
    }
  }

  // Add optional parameters
  if (options?.folder) {
    formData.append('folder', options.folder)
  }

  if (options?.existing && options.existing.length > 0) {
    formData.append('existing', JSON.stringify(options.existing))
  }

  if (options?.deletes && options.deletes.length > 0) {
    formData.append('deletes', JSON.stringify(options.deletes))
  }

  const response = await fetch(`${API_URL}/admin/upload`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData,
  })

  if (!response.ok) {
    throw new Error('Upload failed')
  }

  const result = await response.json()
  return result.urls
}

// Usage examples:

// Single file
const urls = await uploadToImageKit(file, { folder: 'banners' })

// Multiple files
const urls = await uploadToImageKit([file1, file2, file3], { folder: 'products' })

// Update gallery (keep some, add new, delete old)
const urls = await uploadToImageKit(newFiles, {
  folder: 'gallery',
  existing: currentUrls.filter((url) => !urlsToRemove.includes(url)),
  deletes: urlsToRemove,
})

// Only delete files
const urls = await uploadToImageKit(null, { deletes: filesToDelete })
```

## Field Names Reference

| Field Name | Type                | Description                      |
| ---------- | ------------------- | -------------------------------- |
| `file`     | File                | Single file upload field         |
| `files[]`  | File[]              | Multiple files upload field      |
| `folder`   | string              | Optional folder path in ImageKit |
| `existing` | string (JSON array) | URLs to preserve in the response |
| `deletes`  | string (JSON array) | URLs to delete from ImageKit     |

## Response Format

All requests return the same unified response structure:

```typescript
{
  success: boolean        // Always true on success
  urls: string[]          // Combined array: existing + newly uploaded URLs
  uploaded: number        // Count of files uploaded in this request
  deleted: number         // Count of files deleted in this request
}
```

## Error Handling

```typescript
try {
  const urls = await uploadToImageKit(files, options)
  console.log('Uploaded:', urls)
} catch (error) {
  // Handle errors
  if (error.response?.status === 400) {
    console.error('No files provided')
  } else if (error.response?.status === 403) {
    console.error('Permission denied')
  } else {
    console.error('Upload failed:', error.message)
  }
}
```

## Benefits of Unified Endpoint

✅ **Simpler API** - One endpoint to remember  
✅ **Flexible** - Works with single or multiple files  
✅ **Consistent response** - Same format for all use cases  
✅ **Gallery-friendly** - Built-in support for managing collections  
✅ **Efficient** - Delete old files while uploading new ones in a single request

## Permissions

All uploads require the `media.create` permission. Users with `superadmin@gmail.com` email bypass
permission checks automatically.
