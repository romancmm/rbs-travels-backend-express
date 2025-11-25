# Error Handling Guide

## Overview

This project uses a centralized error handling utility to provide consistent, user-friendly error
messages across all services.

## Location

`src/utils/error-handler.ts`

## Key Features

### 1. Automatic Prisma Error Translation

Converts technical Prisma errors into user-friendly messages:

| Prisma Error Code         | User Message Example                                   |
| ------------------------- | ------------------------------------------------------ |
| P2002 (Unique constraint) | "Permission with this name already exists"             |
| P2025 (Not found)         | "Role not found"                                       |
| P2003 (Foreign key)       | "Invalid reference: Related permission does not exist" |
| P2011 (Null constraint)   | "Missing required field for User"                      |

### 2. Standardized Error Objects

All errors include:

- `message`: User-friendly error description
- `status`: HTTP status code
- `code`: Machine-readable error code

## Usage Pattern

### Basic Service Implementation

```typescript
import { handleServiceError, createError, ErrorMessages } from '@/utils/error-handler'

export const createPermissionService = async (data: CreatePermissionInput) => {
  try {
    const permission = await prisma.permission.create({ data })
    return permission
  } catch (error) {
    handleServiceError(error, 'Permission') // Entity name for context
  }
}

export const getPermissionByIdService = async (id: string) => {
  try {
    const permission = await prisma.permission.findUnique({ where: { id } })
    if (!permission) {
      throw createError(ErrorMessages.NOT_FOUND('Permission'), 404, 'NOT_FOUND')
    }
    return permission
  } catch (error) {
    handleServiceError(error, 'Permission')
  }
}
```

### Example Error Transformations

**Before:**

```
Invalid `prisma.permission.create()` invocation
Unique constraint failed on the fields: (`name`)
```

**After:**

```json
{
  "success": false,
  "message": "Permission with this name already exists"
}
```

## Available Error Messages

### Pre-defined Messages (ErrorMessages)

```typescript
ErrorMessages.NOT_FOUND('User') // "User not found"
ErrorMessages.ALREADY_EXISTS('Role', 'name') // "Role with this name already exists"
ErrorMessages.DUPLICATE_ENTRY('Permission') // "Permission already exists"
ErrorMessages.INVALID_REFERENCE('Role') // "Referenced Role does not exist"
ErrorMessages.OPERATION_FAILED('create', 'Menu') // "Failed to create Menu"
```

### Custom Errors

```typescript
throw createError('Custom error message', 400, 'CUSTOM_CODE')
```

## Implementation Checklist

For each service file:

1. ✅ Import error utilities at the top:

```typescript
import { handleServiceError, createError, ErrorMessages } from '@/utils/error-handler'
```

2. ✅ Wrap database operations in try-catch:

```typescript
try {
  // Database operation
} catch (error) {
  handleServiceError(error, 'EntityName')
}
```

3. ✅ Use ErrorMessages for common scenarios:

```typescript
if (!found) {
  throw createError(ErrorMessages.NOT_FOUND('Entity'), 404, 'NOT_FOUND')
}
```

## Services Already Updated

- ✅ Permission Service
- ✅ Role Service
- ✅ User/Admin Service
- ✅ Customer Service
- ✅ Auth Service (Customer)
- ✅ Auth Service (Admin)
- ✅ Article Post Service
- ✅ Article Category Service
- ✅ Menu Service
- ✅ Page Service
- ✅ Project Service
- ✅ Service (Travel Services)
- ✅ Setting Service
- ✅ Profile Service

## Services To Update

**All services have been updated!** ✨

Every service now includes:

- Centralized error handling with user-friendly messages
- Proper HTTP status codes (404, 409, 400, 500, etc.)
- Consistent error format across the application
- Automatic Prisma error translation

## Testing Examples

### Test Duplicate Entry

```bash
# Create permission twice with same name
curl -X POST "http://localhost:4000/api/v1/admin/permission/permissions" \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"user.read"}'

# Second attempt returns:
{
  "success": false,
  "message": "Permission with this name already exists"
}
```

### Test Not Found

```bash
# Get non-existent permission
curl -X GET "http://localhost:4000/api/v1/admin/permission/permissions/invalid-id" \
  -H "Authorization: Bearer TOKEN"

# Returns:
{
  "success": false,
  "message": "Permission not found"
}
```

## Benefits

1. **Consistency**: All errors follow the same format across the entire application
2. **User-Friendly**: Technical Prisma errors are translated to plain English
3. **Maintainable**: Central location for error message updates
4. **Type-Safe**: TypeScript support for error codes and messages
5. **Debuggable**: Error codes help identify specific error types programmatically

## Best Practices

1. Always specify the entity name when calling `handleServiceError()`
2. Use pre-defined `ErrorMessages` when possible
3. Include appropriate HTTP status codes
4. Provide specific error codes for frontend error handling
5. Keep error messages concise and actionable
