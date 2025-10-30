# Media Upload API Documentation

## Overview

The media upload API has been restructured to support sophisticated file management patterns
matching your Next.js upload utility. It now supports:

- **Multiple file uploads** in a single request
- **Existing URL preservation** (don't re-upload already uploaded files)
- **Batch file deletion** (delete old files when updating)

## Endpoints

### 1. Multiple File Upload (Recommended)

**POST** `/admin/upload`

Handles multiple files with existing URLs and deletes in a single request.

#### Request Format

```typescript
// FormData structure
const formData = new FormData()

// Add new files to upload
files.forEach((file) => {
  formData.append('files[]', file)
})

// Preserve existing URLs (don't re-upload)
formData.append(
  'existing',
  JSON.stringify([
    'https://ik.imagekit.io/po5udmmiz/uploads/existing1.jpg',
    'https://ik.imagekit.io/po5udmmiz/uploads/existing2.jpg',
  ])
)

// Delete old files
formData.append('deletes', JSON.stringify(['https://ik.imagekit.io/po5udmmiz/uploads/old1.jpg']))

// Optional folder path
formData.append('folder', 'uploads/products')
```

#### Response Format

```json
{
  "success": true,
  "urls": [
    "https://ik.imagekit.io/po5udmmiz/uploads/existing1.jpg",
    "https://ik.imagekit.io/po5udmmiz/uploads/existing2.jpg",
    "https://ik.imagekit.io/po5udmmiz/uploads/new1.jpg",
    "https://ik.imagekit.io/po5udmmiz/uploads/new2.jpg"
  ],
  "uploaded": 2,
  "deleted": 1
}
```

#### Key Features

- **Existing URLs**: Passed in the `existing` array, preserved in the final response
- **Deletes**: Files specified in `deletes` array are removed from ImageKit before new uploads
- **Multiple Files**: Support up to 20 files per request (configurable via maxCount)
- **Folder Organization**: Optional `folder` parameter for organizing uploads

### 2. Single File Upload (Legacy)

**POST** `/admin/upload/single`

Simple single-file upload endpoint.

#### Request Format

```typescript
const formData = new FormData()
formData.append('file', file)
formData.append('folder', 'uploads') // optional
```

#### Response Format

```json
{
  "fileId": "6719a9cb4f...",
  "name": "banner.jpg",
  "url": "https://ik.imagekit.io/po5udmmiz/uploads/banner.jpg",
  "thumbnailUrl": "https://ik.imagekit.io/po5udmmiz/tr:n-ik_ml_thumbnail/uploads/banner.jpg"
}
```

### 3. Client-Side Upload Auth

**GET** `/upload/auth` (Public)

Get authentication parameters for client-side uploads using ImageKit's JavaScript SDK.

#### Response Format

```json
{
  "signature": "...",
  "expire": 1234567890,
  "token": "..."
}
```

## Implementation Details

### Service Layer

**File**: `src/services/upload/Upload.service.ts`

Key functions:

- `uploadMultipleFilesToImageKitService()`: Uploads array of files, returns URLs
- `deleteFilesFromImageKitService()`: Deletes files by fileId
- `extractFileIdFromUrl()`: Extracts ImageKit fileId from URL for deletion

### Controller Layer

**File**: `src/controllers/upload/Upload.controller.ts`

- `uploadMultiple()`: Orchestrates parsing FormData, uploading new files, deleting old files
- Handles JSON parsing of `existing` and `deletes` arrays from FormData strings

### Validation

**File**: `src/validators/media.validator.ts`

```typescript
export const uploadMediaSchema = z.object({
  folder: z.string().optional(),
  existing: z.array(z.string()).optional(),
  deletes: z.array(z.string()).optional(),
})

export type UploadMediaInput = z.infer<typeof uploadMediaSchema>
```

## Usage Examples

### Example 1: Upload New Images for Blog Post

```typescript
const formData = new FormData()
selectedFiles.forEach((file) => formData.append('files[]', file))
formData.append('folder', 'blog/posts')

const response = await fetch('/admin/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})

const { urls } = await response.json()
// Store urls in your post data
```

### Example 2: Update Product Gallery

```typescript
// User selects new images, keeps some existing ones, removes others
const formData = new FormData()

// New files to upload
newFiles.forEach((file) => formData.append('files[]', file))

// Keep these existing URLs
formData.append(
  'existing',
  JSON.stringify([
    'https://ik.imagekit.io/po5udmmiz/products/image1.jpg',
    'https://ik.imagekit.io/po5udmmiz/products/image2.jpg',
  ])
)

// Delete these old images
formData.append(
  'deletes',
  JSON.stringify(['https://ik.imagekit.io/po5udmmiz/products/old-image.jpg'])
)

formData.append('folder', 'products')

const response = await fetch('/admin/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})

const { urls } = await response.json()
// Update product with new gallery URLs
```

### Example 3: Replace Single Image

```typescript
// Replace hero image completely
const formData = new FormData()
formData.append('files[]', newHeroImage)
formData.append('deletes', JSON.stringify([currentHeroUrl]))
formData.append('folder', 'banners')

const response = await fetch('/admin/upload', {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}` },
  body: formData,
})

const { urls } = await response.json()
const newHeroUrl = urls[0]
```

## Integration with Next.js Upload Utility

Your existing Next.js `uploadImagesToServer()` utility function is now fully compatible:

```typescript
// Your utility function
export const uploadImagesToServer = async (
  files: File[],
  folder?: string,
  existing?: string[],
  deletes?: string[]
) => {
  const formData = new FormData()

  files.forEach((file) => formData.append('files[]', file))
  if (existing) formData.append('existing', JSON.stringify(existing))
  if (deletes) formData.append('deletes', JSON.stringify(deletes))
  if (folder) formData.append('folder', folder)

  const res = await fetch(`${API_URL}/admin/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${getToken()}` },
    body: formData,
  })

  const data = await res.json()
  return data.urls // Returns array of URLs
}
```

## Permissions

All admin upload endpoints require the `media.create` permission. Users with `superadmin@gmail.com`
email bypass permission checks.

## Configuration

Configure ImageKit credentials in `.env`:

```env
IMAGEKIT_PUBLIC_KEY=your_public_key
IMAGEKIT_PRIVATE_KEY=your_private_key
IMAGEKIT_ID=po5udmmiz
IMAGEKIT_URL_ENDPOINT=https://ik.imagekit.io/po5udmmiz
```

## File Limits

- **Maximum file size**: 10MB per file
- **Maximum files per request**: 20 files (configurable in `upload.admin.route.ts`)
- **Supported storage**: Memory storage (files held in RAM during upload)

## Error Handling

The API returns appropriate HTTP status codes:

- **201**: Upload successful
- **400**: Invalid request (missing files, invalid data)
- **401**: Unauthorized (missing or invalid token)
- **403**: Forbidden (insufficient permissions)
- **500**: Server error (ImageKit API failure, etc.)

## Swagger Documentation

API documentation is available at:

- **Admin endpoints**: http://localhost:3000/docs/admin
- **Public endpoints**: http://localhost:3000/docs/public

Look for the "Upload - Admin" tag in the Swagger UI.

## Related Documentation

For comprehensive media library management including folder operations, file organization, and CRUD
operations, see:

📁 **[Media Management API Documentation](./MEDIA_MANAGEMENT_API.md)** - Complete guide for managing
files and folders

The Media Management API provides additional functionality beyond uploads:

- Create, rename, and delete folders with unique name validation
- Update file metadata and tags
- Browse media library with pagination and filtering
- Get complete library structure overview
- Force delete folders with contents
