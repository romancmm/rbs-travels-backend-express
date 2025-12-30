# Media Management API Documentation

## Overview

The Media Management API provides comprehensive CRUD operations for managing files and folders in
your ImageKit media library. It includes unique folder name validation, batch operations, and
detailed error handling.

## Base URL

```
/api/v1/admin/media
```

## Authentication

All admin media endpoints require JWT authentication with appropriate permissions:

- `media.read` - View media files and folders
- `media.create` - Create folders and upload files
- `media.update` - Update file details and rename folders
- `media.delete` - Delete files and folders

```http
Authorization: Bearer <your_jwt_token>
```

## Endpoints

### 1. List Media Files and Folders

Get a paginated list of files and folders with filtering options.

```http
GET /admin/media?path=/&page=1&perPage=50&fileType=all
```

**Query Parameters:**

- `path` (string, optional): Directory path to browse (default: "/")
- `page` (integer, optional): Page number (default: 1)
- `perPage` (integer, optional): Items per page, max 100 (default: 50)
- `fileType` (string, optional): Filter by type - "all", "image", "video", "audio", "raw" (default:
  "all")

**Response:**

```json
{
  "items": [
    {
      "type": "folder",
      "folderId": "folder_123",
      "name": "documents",
      "folderPath": "/documents",
      "createdAt": "2025-10-30T10:00:00.000Z"
    },
    {
      "type": "file",
      "fileId": "file_456",
      "name": "image.jpg",
      "url": "https://ik.imagekit.io/po5udmmiz/image.jpg",
      "filePath": "/image.jpg",
      "size": 1024000,
      "fileType": "image",
      "tags": ["nature", "landscape"],
      "createdAt": "2025-10-30T10:00:00.000Z"
    }
  ],
  "folders": [...],
  "files": [...],
  "page": 1,
  "perPage": 50,
  "hasMore": false,
  "totalEstimate": 15,
  "currentPath": "/"
}
```

### 2. Get Library Structure

Get a complete overview of your media library.

```http
GET /admin/media/structure
```

**Response:**

```json
{
  "totalFiles": 150,
  "totalFolders": 25,
  "files": [...],
  "folders": [...],
  "structure": [...]
}
```

### 3. Create Folder

Create a new folder with unique name validation.

```http
POST /admin/media/folder
Content-Type: application/json

{
  "folderName": "vacation-photos",
  "parentPath": "/albums"
}
```

**Request Body:**

- `folderName` (string, required): Name of the folder (1-50 characters)
- `parentPath` (string, optional): Parent directory path (default: "/")

**Response:**

```json
{
  "success": true,
  "folder": {
    "folderId": "folder_789",
    "name": "vacation-photos",
    "folderPath": "/albums/vacation-photos",
    "type": "folder",
    "createdAt": "2025-10-30T10:00:00.000Z"
  },
  "path": "/albums/vacation-photos",
  "message": "Folder 'vacation-photos' created successfully"
}
```

**Error Response (409 Conflict):**

```json
{
  "success": false,
  "message": "Folder 'vacation-photos' already exists in '/albums'"
}
```

### 4. Rename Folder

Rename a folder with unique name validation.

```http
PUT /admin/media/folder/rename
Content-Type: application/json

{
  "oldPath": "/albums/vacation-photos",
  "newFolderName": "summer-vacation"
}
```

**Request Body:**

- `oldPath` (string, required): Current full path of the folder
- `newFolderName` (string, required): New name for the folder (1-50 characters)

**Response:**

```json
{
  "success": true,
  "oldPath": "/albums/vacation-photos",
  "newPath": "/albums/summer-vacation",
  "message": "Folder renamed from '/albums/vacation-photos' to '/albums/summer-vacation'"
}
```

### 5. Update File Details

Update file metadata like name and tags.

```http
PUT /admin/media/file/abc123def456
Content-Type: application/json

{
  "name": "mountain-landscape",
  "tags": ["nature", "mountain", "landscape"]
}
```

**Request Body:**

- `name` (string, optional): New name for the file
- `tags` (array of strings, optional): Tags to associate with the file

**Response:**

```json
{
  "success": true,
  "file": {
    "fileId": "abc123def456",
    "name": "mountain-landscape",
    "tags": ["nature", "mountain", "landscape"],
    ...
  },
  "message": "File updated successfully"
}
```

### 6. Delete File or Folder (Unified)

Delete a file or folder using a single endpoint that automatically detects the type.

```http
DELETE /admin/media/:id
```

**Path Parameters:**

- `id` (string, required): File ID or folder path to delete

**Query Parameters (for folders only):**

- `force` (boolean, optional): Set to true to force delete folder with contents (default: false)

**Response (File Deletion):**

```json
{
  "success": true,
  "type": "file",
  "fileId": "abc123def456",
  "fileName": "image.jpg",
  "message": "File 'image.jpg' deleted successfully"
}
```

**Response (Empty Folder):**

```json
{
  "success": true,
  "type": "folder",
  "folderPath": "/old-albums",
  "message": "Folder '/old-albums' deleted successfully"
}
```

**Response (Force Delete Folder with Contents):**

```json
{
  "success": true,
  "type": "folder",
  "folderPath": "/old-albums",
  "deletedFiles": 15,
  "deletedFolders": 3,
  "message": "Folder '/old-albums' and all its contents deleted successfully"
}
```

**Error Response (Non-empty Folder without force):**

```json
{
  "success": false,
  "message": "Cannot delete folder '/old-albums': folder is not empty. It contains 18 items."
}
```

## Usage Examples

### Creating a Nested Folder Structure

```bash
# Create main album folder
curl -X POST "/api/v1/admin/media/folder" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"folderName": "albums"}'

# Create vacation subfolder
curl -X POST "/api/v1/admin/media/folder" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"folderName": "vacation-2025", "parentPath": "/albums"}'
```

### Organizing Files with Tags

```bash
# Update file with descriptive tags
curl -X PUT "/api/v1/admin/media/file/abc123" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "beach-sunset",
    "tags": ["vacation", "beach", "sunset", "photography"]
  }'
```

### Delete Files and Folders

```bash
# Delete a file by ID
curl -X DELETE "/api/v1/admin/media/abc123def456" \
  -H "Authorization: Bearer <token>"

# Delete an empty folder
curl -X DELETE "/api/v1/admin/media/%2Ftemp-files" \
  -H "Authorization: Bearer <token>"

# Force delete folder with all contents
curl -X DELETE "/api/v1/admin/media/%2Ftemp-files?force=true" \
  -H "Authorization: Bearer <token>"
```

## Error Handling

The API returns consistent error responses with appropriate HTTP status codes:

- `400 Bad Request`: Invalid parameters or validation errors
- `401 Unauthorized`: Missing or invalid authentication
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `409 Conflict`: Resource already exists (duplicate folder names)
- `500 Internal Server Error`: Server errors

**Error Response Format:**

```json
{
  "success": false,
  "message": "Detailed error description",
  "code": "ERROR_CODE" // Optional error code
}
```

## Best Practices

1. **Unique Folder Names**: Always check folder existence before creation to avoid conflicts
2. **Path Normalization**: The API automatically handles path formatting, but consistent usage is
   recommended
3. **Batch Operations**: Use force delete sparingly and ensure you want to delete all contents
4. **File Tagging**: Use consistent tag naming conventions for better organization
5. **Error Handling**: Always check response status and handle errors appropriately
6. **Pagination**: Use appropriate page sizes for optimal performance

## Rate Limiting

The media API is subject to the application's global rate limiting (200 requests per 15 minutes by
default). For batch operations, consider implementing delays between requests if needed.

## Support

For additional help or feature requests, please refer to the project documentation or contact the
development team.
