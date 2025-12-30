# Unified Media API Documentation

## Overview

The Media API has been unified to provide consistent endpoints for managing both files and folders.
Instead of separate endpoints for files and folders, unified endpoints automatically detect the item
type and handle operations accordingly.

## Core Concepts

### Auto-Detection

The API automatically detects whether you're working with a file or folder:

- **Folder**: ID starts with `/` (e.g., `/gallery`, `/documents/2024`)
- **File**: ID is alphanumeric (ImageKit fileId, e.g., `abc123def456`)

You can also explicitly specify the type using the `type` field.

## Unified Endpoints

### 1. Rename (Files & Folders)

**Endpoint:** `PUT /admin/media/rename`

**Description:** Rename any file or folder with a single endpoint.

**Request Body:**

```json
{
  "id": "string", // File ID or folder path
  "newName": "string", // New name (max 100 chars)
  "type": "file|folder" // Optional - auto-detected
}
```

**Examples:**

```typescript
// Rename file (auto-detect)
PUT /admin/media/rename
{
  "id": "abc123def456",
  "newName": "beach-sunset"
}

// Rename folder (auto-detect)
PUT /admin/media/rename
{
  "id": "/vacation/photos",
  "newName": "summer-2024"
}

// Explicit type
PUT /admin/media/rename
{
  "id": "xyz789",
  "newName": "company-logo",
  "type": "file"
}
```

**Response:**

```json
{
  "success": true,
  "message": "File renamed to \"beach-sunset\" successfully"
}
```

---

### 2. Move (Files & Folders)

**Endpoint:** `PUT /admin/media/move`

**Description:** Move any file or folder to a different location.

**Request Body:**

```json
{
  "id": "string", // File ID or folder path
  "destinationPath": "string", // Target folder path
  "type": "file|folder" // Optional - auto-detected
}
```

**Examples:**

```typescript
// Move file
PUT /admin/media/move
{
  "id": "abc123",
  "destinationPath": "/archive/2024"
}

// Move folder
PUT /admin/media/move
{
  "id": "/projects/old",
  "destinationPath": "/archive"
}
```

**Response:**

```json
{
  "success": true,
  "oldPath": "/projects/old",
  "newPath": "/archive/old",
  "message": "Folder moved from \"/projects/old\" to \"/archive/old\""
}
```

---

### 3. Copy (Files & Folders)

**Endpoint:** `PUT /admin/media/copy`

**Description:** Copy any file or folder to a different location.

**Request Body:**

```json
{
  "id": "string", // File ID or folder path
  "destinationPath": "string", // Target folder path
  "type": "file|folder" // Optional - auto-detected
}
```

**Examples:**

```typescript
// Copy file
PUT /admin/media/copy
{
  "id": "abc123",
  "destinationPath": "/backup"
}

// Copy folder
PUT /admin/media/copy
{
  "id": "/gallery",
  "destinationPath": "/backup/galleries"
}
```

**Response:**

```json
{
  "success": true,
  "originalPath": "/gallery",
  "copyPath": "/backup/galleries/gallery",
  "message": "Folder copied successfully"
}
```

---

### 4. Delete (Files & Folders)

**Endpoint:** `DELETE /admin/media/:id`

**Description:** Delete any file or folder with a single endpoint.

**Folder Deletion Safety:**

- ✅ **Empty folders**: Deleted immediately
- 🚫 **Non-empty folders**: Deletion blocked by default
- ⚠️ **Force delete**: Use `?force=true` to delete folder with all contents

**Parameters:**

- `id` (path): File ID or folder ID
- `force` (query, optional): Force delete folder with contents (`?force=true`)

**Examples:**

```typescript
// Delete file
DELETE /admin/media/abc123def456

// Delete empty folder (succeeds)
DELETE /admin/media/folder_xyz789

// Try to delete non-empty folder (blocked)
DELETE /admin/media/folder_xyz789
// Response: 400 Bad Request
// Error: Cannot delete folder "/gallery": folder is not empty.
//        It contains 15 files and 3 folders. Use force=true to delete with all contents.

// Force delete folder with contents
DELETE /admin/media/folder_xyz789?force=true
```

**Success Response:**

```json
{
  "success": true,
  "type": "file",
  "fileId": "abc123def456",
  "fileName": "image.jpg",
  "message": "File \"image.jpg\" deleted successfully"
}
```

**Error Response (Non-empty folder):**

```json
{
  "error": "Cannot delete folder \"/gallery\": folder is not empty. It contains 15 files and 3 folders. Use force=true to delete with all contents."
}
```

---

## Legacy Endpoints (Backward Compatibility)

The following endpoints are kept for backward compatibility but using unified endpoints is
recommended:

### File Operations

- `PUT /admin/media/file/:fileId` - Update file metadata
- `PUT /admin/media/file/:fileId/move` - Move file
- `PUT /admin/media/file/:fileId/copy` - Copy file
- `DELETE /admin/media/file/:fileId` - Delete file

---

## Additional Endpoints

### Create Folder

**Endpoint:** `POST /admin/media/folder`

```json
{
  "folderName": "vacation-2024",
  "parentPath": "/albums"
}
```

### List Media

**Endpoint:** `GET /admin/media?path=/&page=1&perPage=50`

### Search Media

**Endpoint:** `GET /admin/media/search?searchQuery=sunset&tags=nature,landscape`

### Get Library Structure

**Endpoint:** `GET /admin/media/structure`

### Get File Details

**Endpoint:** `GET /admin/media/file/:fileId`

---

## Bulk Operations

### Bulk Delete

**Endpoint:** `POST /admin/media/bulk/delete`

```json
{
  "fileIds": ["id1", "id2", "id3"]
}
```

### Bulk Move

**Endpoint:** `POST /admin/media/bulk/move`

```json
{
  "fileIds": ["id1", "id2"],
  "destinationPath": "/archive"
}
```

### Bulk Copy

**Endpoint:** `POST /admin/media/bulk/copy`

```json
{
  "fileIds": ["id1", "id2"],
  "destinationPath": "/backup"
}
```

### Bulk Add Tags

**Endpoint:** `POST /admin/media/bulk/tags/add`

```json
{
  "fileIds": ["id1", "id2"],
  "tags": ["nature", "landscape"]
}
```

### Bulk Remove Tags

**Endpoint:** `POST /admin/media/bulk/tags/remove`

```json
{
  "fileIds": ["id1", "id2"],
  "tags": ["draft", "temp"]
}
```

---

## Permissions

All media endpoints require appropriate permissions:

- `media.read` - List, search, view file details
- `media.create` - Upload, create folders, copy operations
- `media.update` - Rename, move, update metadata
- `media.delete` - Delete files and folders

Users with `superadmin@gmail.com` bypass all permission checks.

---

## Migration Guide

### Old Way (Deprecated)

```typescript
// Rename folder
PUT /admin/media/folder/rename
{
  "oldPath": "/albums/vacation",
  "newFolderName": "summer-2024"
}

// Move folder
PUT /admin/media/folder/move
{
  "sourcePath": "/albums/vacation",
  "destinationPath": "/archive"
}
```

### New Way (Recommended)

```typescript
// Rename folder
PUT /admin/media/rename
{
  "id": "/albums/vacation",
  "newName": "summer-2024"
}

// Move folder
PUT /admin/media/move
{
  "id": "/albums/vacation",
  "destinationPath": "/archive"
}
```

---

## Benefits

✅ **Consistency** - Same endpoint pattern for files and folders  
✅ **Simplicity** - Less endpoints to remember  
✅ **Auto-Detection** - No need to specify type in most cases  
✅ **Backward Compatible** - Legacy endpoints still work  
✅ **Type Safety** - Full TypeScript support with Zod validation
