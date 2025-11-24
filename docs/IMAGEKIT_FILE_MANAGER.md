# ImageKit-like File Manager Implementation

## Overview

This document describes the comprehensive media management system implemented to provide
ImageKit-like file manager functionality. The system includes advanced features for file/folder
operations, bulk actions, search, and filtering.

## Features Implemented

### 🗂️ Folder Management

- ✅ Create folders with nested paths
- ✅ Rename folders with validation
- ✅ Move folders between locations
- ✅ Copy folders with all contents
- ✅ Delete folders (empty or force delete with contents)
- ✅ Browse folder structure

### 📁 File Operations

- ✅ Upload files to specific folders
- ✅ Move files between folders
- ✅ Copy files to different locations
- ✅ Update file metadata (name, tags)
- ✅ Delete individual files
- ✅ Get detailed file information

### 🔍 Search & Filtering

- ✅ Search files by name
- ✅ Filter by tags
- ✅ Filter by file type (image, video, audio, raw)
- ✅ Filter by folder path
- ✅ Filter by date range (created date)
- ✅ Pagination support

### 📦 Bulk Operations

- ✅ Bulk delete multiple files
- ✅ Bulk move files to a folder
- ✅ Bulk copy files to a folder
- ✅ Bulk add tags to files
- ✅ Bulk remove tags from files

## API Endpoints

### Media Listing & Structure

#### GET `/admin/media`

List files and folders with pagination and filtering

```bash
GET /admin/media?path=/images&page=1&perPage=50&fileType=image
```

#### GET `/admin/media/structure`

Get complete media library overview

```bash
GET /admin/media/structure
```

#### GET `/admin/media/search`

Advanced search with multiple filters

```bash
GET /admin/media/search?searchQuery=vacation&tags=nature,landscape&fileType=image&dateFrom=2024-01-01
```

### Folder Operations

#### POST `/admin/media/folder`

Create a new folder

```json
{
  "folderName": "vacation-2024",
  "parentPath": "/albums"
}
```

#### PUT `/admin/media/folder/rename`

Rename a folder

```json
{
  "oldPath": "/albums/vacation",
  "newFolderName": "summer-vacation"
}
```

#### PUT `/admin/media/folder/move`

Move a folder to different location

```json
{
  "sourcePath": "/albums/vacation",
  "destinationPath": "/archived"
}
```

#### PUT `/admin/media/folder/copy`

Copy a folder

```json
{
  "sourcePath": "/albums/vacation",
  "destinationPath": "/backup"
}
```

#### DELETE `/admin/media/folder`

Delete a folder

```bash
DELETE /admin/media/folder?path=/old-files&force=true
```

### File Operations

#### GET `/admin/media/file/:fileId`

Get detailed file information

```bash
GET /admin/media/file/abc123def456
```

#### PUT `/admin/media/file/:fileId`

Update file metadata

```json
{
  "name": "beach-sunset",
  "tags": ["vacation", "beach", "nature"]
}
```

#### PUT `/admin/media/file/:fileId/move`

Move file to different folder

```json
{
  "destinationPath": "/images/nature"
}
```

#### PUT `/admin/media/file/:fileId/copy`

Copy file to different folder

```json
{
  "destinationPath": "/backup/images"
}
```

#### DELETE `/admin/media/file/:fileId`

Delete a file

```bash
DELETE /admin/media/file/abc123def456
```

### Bulk Operations

#### POST `/admin/media/bulk/delete`

Delete multiple files at once

```json
{
  "fileIds": ["file1", "file2", "file3"]
}
```

#### POST `/admin/media/bulk/move`

Move multiple files to a folder

```json
{
  "fileIds": ["file1", "file2", "file3"],
  "destinationPath": "/archived"
}
```

#### POST `/admin/media/bulk/copy`

Copy multiple files to a folder

```json
{
  "fileIds": ["file1", "file2", "file3"],
  "destinationPath": "/backup"
}
```

#### POST `/admin/media/bulk/tags/add`

Add tags to multiple files

```json
{
  "fileIds": ["file1", "file2", "file3"],
  "tags": ["nature", "landscape", "photography"]
}
```

#### POST `/admin/media/bulk/tags/remove`

Remove tags from multiple files

```json
{
  "fileIds": ["file1", "file2", "file3"],
  "tags": ["draft", "temporary"]
}
```

## Response Formats

### File Object

```json
{
  "type": "file",
  "fileId": "abc123",
  "name": "image.jpg",
  "url": "https://ik.imagekit.io/...",
  "thumbnail": "https://ik.imagekit.io/.../tr:w-200,h-200",
  "filePath": "/images/image.jpg",
  "fileType": "image",
  "size": 1024000,
  "width": 1920,
  "height": 1080,
  "mime": "image/jpeg",
  "createdAt": "2024-01-01T00:00:00.000Z",
  "tags": ["nature", "landscape"]
}
```

### Folder Object

```json
{
  "type": "folder",
  "folderId": "folder123",
  "name": "vacation",
  "folderPath": "/albums/vacation",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### Bulk Operation Response

```json
{
  "success": true,
  "totalFiles": 5,
  "successful": 4,
  "failed": 1,
  "results": [
    {
      "fileId": "file1",
      "success": true
    },
    {
      "fileId": "file2",
      "success": false,
      "error": "File not found"
    }
  ],
  "message": "Bulk operation completed: 4 successful, 1 failed"
}
```

## Usage Examples

### Example 1: Organize Files by Tags

```javascript
// 1. Search for files
const response = await fetch('/admin/media/search?searchQuery=vacation')
const { items } = await response.json()

// 2. Extract file IDs
const fileIds = items.map((file) => file.fileId)

// 3. Add tags to all files
await fetch('/admin/media/bulk/tags/add', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileIds,
    tags: ['vacation-2024', 'summer', 'family'],
  }),
})
```

### Example 2: Archive Old Files

```javascript
// 1. Search for old files
const response = await fetch('/admin/media/search?dateTo=2023-12-31')
const { items } = await response.json()

// 2. Create archive folder
await fetch('/admin/media/folder', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    folderName: 'archive-2023',
    parentPath: '/archives',
  }),
})

// 3. Move files to archive
const fileIds = items.map((file) => file.fileId)
await fetch('/admin/media/bulk/move', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileIds,
    destinationPath: '/archives/archive-2023',
  }),
})
```

### Example 3: Create Folder Structure

```javascript
// Create main category folders
const categories = ['products', 'blog', 'team', 'events']

for (const category of categories) {
  await fetch('/admin/media/folder', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      folderName: category,
      parentPath: '/',
    }),
  })
}

// Create subcategories
await fetch('/admin/media/folder', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    folderName: '2024',
    parentPath: '/events',
  }),
})
```

### Example 4: Backup Important Files

```javascript
// 1. Get files with specific tag
const response = await fetch('/admin/media/search?tags=important')
const { items } = await response.json()

// 2. Create backup folder
await fetch('/admin/media/folder', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    folderName: `backup-${new Date().toISOString().split('T')[0]}`,
    parentPath: '/backups',
  }),
})

// 3. Copy files to backup
const fileIds = items.map((file) => file.fileId)
await fetch('/admin/media/bulk/copy', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    fileIds,
    destinationPath: `/backups/backup-${new Date().toISOString().split('T')[0]}`,
  }),
})
```

## Error Handling

All endpoints return consistent error responses:

```json
{
  "success": false,
  "message": "Detailed error description",
  "code": "ERROR_CODE"
}
```

Common error codes:

- `400` - Invalid request parameters
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Resource not found
- `409` - Conflict (duplicate folder name)
- `500` - Internal server error

## Permissions Required

All admin media endpoints require appropriate permissions:

- `media.read` - View files and folders
- `media.create` - Upload files, create/copy folders
- `media.update` - Update files, move/rename folders
- `media.delete` - Delete files and folders

## Performance Considerations

1. **Pagination**: Always use pagination for listing files (max 100 per page)
2. **Bulk Operations**: Process in batches to avoid timeout
3. **Search**: Use specific filters to narrow down results
4. **Caching**: File structure is cached for better performance

## Best Practices

1. **Folder Organization**: Use clear, hierarchical folder structure
2. **Tagging**: Apply consistent tags for easy searching
3. **Naming**: Use descriptive, lowercase names with hyphens
4. **Bulk Actions**: Review selections before bulk delete operations
5. **Backups**: Regular backups before major reorganizations

## Limitations

1. ImageKit API rate limits apply (check your plan)
2. Maximum file size depends on your ImageKit account
3. Folder move/rename requires copying files (ImageKit limitation)
4. Search is case-insensitive
5. Bulk operations process files sequentially

## Future Enhancements

- [ ] Drag-and-drop file organization
- [ ] Advanced metadata editing
- [ ] File versioning and history
- [ ] Shared folders and permissions
- [ ] Custom transformations presets
- [ ] Automated file optimization
- [ ] AI-powered tagging
- [ ] Duplicate file detection

## Support

For issues or questions:

1. Check the API documentation
2. Review error messages and logs
3. Verify permissions and authentication
4. Contact development team

---

**Version**: 1.0.0  
**Last Updated**: November 2025  
**Maintained By**: Development Team
