# Media Manager Quick Reference

## 🚀 Quick Start Commands

### List Files

```bash
GET /admin/media?path=/&page=1&perPage=50
```

### Search Files

```bash
GET /admin/media/search?searchQuery=vacation&tags=nature&fileType=image
```

### Create Folder

```bash
POST /admin/media/folder
{
  "folderName": "my-folder",
  "parentPath": "/albums"
}
```

### Move File

```bash
PUT /admin/media/file/:fileId/move
{
  "destinationPath": "/new-location"
}
```

### Bulk Delete

```bash
POST /admin/media/bulk/delete
{
  "fileIds": ["id1", "id2", "id3"]
}
```

### Bulk Tag

```bash
POST /admin/media/bulk/tags/add
{
  "fileIds": ["id1", "id2", "id3"],
  "tags": ["nature", "landscape"]
}
```

## 📋 All Available Endpoints

### Folder Management

- `POST /admin/media/folder` - Create folder
- `PUT /admin/media/folder/rename` - Rename folder
- `PUT /admin/media/folder/move` - Move folder
- `PUT /admin/media/folder/copy` - Copy folder
- `DELETE /admin/media/folder?path=...&force=true` - Delete folder

### File Operations

- `GET /admin/media/file/:fileId` - Get file details
- `PUT /admin/media/file/:fileId` - Update file metadata
- `PUT /admin/media/file/:fileId/move` - Move file
- `PUT /admin/media/file/:fileId/copy` - Copy file
- `DELETE /admin/media/file/:fileId` - Delete file

### Bulk Operations

- `POST /admin/media/bulk/delete` - Bulk delete files
- `POST /admin/media/bulk/move` - Bulk move files
- `POST /admin/media/bulk/copy` - Bulk copy files
- `POST /admin/media/bulk/tags/add` - Add tags to multiple files
- `POST /admin/media/bulk/tags/remove` - Remove tags from files

### Search & Browse

- `GET /admin/media` - List files with pagination
- `GET /admin/media/structure` - Get library structure
- `GET /admin/media/search` - Advanced search

## 🔑 Required Permissions

| Operation          | Permission     |
| ------------------ | -------------- |
| View files         | `media.read`   |
| Upload/Create      | `media.create` |
| Move/Rename/Update | `media.update` |
| Delete             | `media.delete` |

## 📊 Service Functions

### Media.service.ts

```typescript
// Listing & Structure
listMediaService(query)
getMediaLibraryStructureService()
searchMediaService(query)

// Folders
createFolderService(folderName, parentPath)
renameFolderService(oldPath, newFolderName)
moveFolderService(sourcePath, destinationPath)
copyFolderService(sourcePath, destinationPath)
deleteFolderService(folderPath)
deleteFolderWithContentsService(folderPath, force)

// Files
getFileDetailsService(fileId)
updateFileService(fileId, updateData)
moveFileService(fileId, destinationPath)
copyFileService(fileId, destinationPath)
deleteFileService(fileId)

// Bulk Operations
bulkDeleteFilesService(fileIds)
bulkMoveFilesService(fileIds, destinationPath)
bulkCopyFilesService(fileIds, destinationPath)
bulkAddTagsService(fileIds, tags)
bulkRemoveTagsService(fileIds, tags)
```

## 🎯 Common Use Cases

### Organize by Date

```javascript
// Search old files
const old = await search({ dateTo: '2023-12-31' })
// Move to archive
await bulkMove(fileIds, '/archive/2023')
```

### Tag Management

```javascript
// Find untagged
const files = await search({ tags: [] })
// Add tags
await bulkAddTags(fileIds, ['needs-review'])
```

### Folder Cleanup

```javascript
// Create new structure
await createFolder('organized', '/')
// Move files
await bulkMove(fileIds, '/organized')
// Delete old folder
await deleteFolder('/old', true)
```

## ⚡ Performance Tips

1. Use pagination (max 100/page)
2. Filter searches with specific criteria
3. Process bulk ops in batches
4. Cache frequently accessed paths
5. Use file IDs instead of paths when possible

## 🐛 Troubleshooting

| Error            | Solution                   |
| ---------------- | -------------------------- |
| 401 Unauthorized | Check JWT token            |
| 403 Forbidden    | Verify permissions         |
| 404 Not Found    | Check file/folder exists   |
| 409 Conflict     | Folder name already exists |
| 500 Server Error | Check ImageKit API status  |

## 📝 Notes

- All paths must start with `/`
- Tags are case-sensitive
- Folder moves involve copying (ImageKit limitation)
- Bulk operations return partial results if some fail
- Force delete permanently removes all contents

---

See full documentation: `IMAGEKIT_FILE_MANAGER.md`
