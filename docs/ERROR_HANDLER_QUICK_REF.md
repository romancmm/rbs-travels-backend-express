# Error Handler Quick Reference

## Import Statement

```typescript
import { handleServiceError, createError, ErrorMessages } from '@/utils/error-handler'
```

## Common Patterns

### 1. Basic CRUD with Error Handling

```typescript
export const getEntityService = async (id: string) => {
  try {
    const entity = await prisma.entity.findUnique({ where: { id } })
    if (!entity) {
      throw createError(ErrorMessages.NOT_FOUND('Entity'), 404, 'NOT_FOUND')
    }
    return entity
  } catch (error) {
    handleServiceError(error, 'Entity')
  }
}
```

### 2. Create with Duplicate Check

```typescript
export const createEntityService = async (data: CreateInput) => {
  try {
    // Check for duplicates
    const existing = await prisma.entity.findUnique({
      where: { email: data.email },
    })
    if (existing) {
      throw createError(ErrorMessages.ALREADY_EXISTS('Entity', 'email'), 409, 'DUPLICATE_ENTRY')
    }

    const entity = await prisma.entity.create({ data })
    return entity
  } catch (error) {
    handleServiceError(error, 'Entity')
  }
}
```

### 3. Update with Validation

```typescript
export const updateEntityService = async (id: string, data: UpdateInput) => {
  try {
    // Validate entity exists
    const entity = await prisma.entity.findUnique({ where: { id } })
    if (!entity) {
      throw createError(ErrorMessages.NOT_FOUND('Entity'), 404, 'NOT_FOUND')
    }

    // Update
    const updated = await prisma.entity.update({ where: { id }, data })
    return updated
  } catch (error) {
    handleServiceError(error, 'Entity')
  }
}
```

### 4. Delete with Check

```typescript
export const deleteEntityService = async (id: string) => {
  try {
    await prisma.entity.delete({ where: { id } })
    return { id, deleted: true }
  } catch (error) {
    handleServiceError(error, 'Entity')
  }
}
```

## Available Error Messages

```typescript
ErrorMessages.NOT_FOUND('User') // "User not found"
ErrorMessages.ALREADY_EXISTS('Role', 'name') // "Role with this name already exists"
ErrorMessages.DUPLICATE_ENTRY('Permission') // "Permission already exists"
ErrorMessages.INVALID_REFERENCE('Role') // "Referenced Role does not exist"
ErrorMessages.INVALID_CREDENTIALS // "Invalid email or password"
ErrorMessages.UNAUTHORIZED // "You are not authorized..."
ErrorMessages.FORBIDDEN // "Access forbidden"
ErrorMessages.VALIDATION_FAILED // "Validation failed"
ErrorMessages.INVALID_INPUT // "Invalid input data"
ErrorMessages.INTERNAL_ERROR // "An internal error occurred"
ErrorMessages.OPERATION_FAILED('create', 'Menu') // "Failed to create Menu"
```

## HTTP Status Codes

| Code | Use Case                       | Example                             |
| ---- | ------------------------------ | ----------------------------------- |
| 400  | Bad Request / Validation Error | Invalid input data                  |
| 401  | Unauthorized                   | Invalid credentials, missing token  |
| 403  | Forbidden                      | Insufficient permissions            |
| 404  | Not Found                      | Entity doesn't exist                |
| 409  | Conflict                       | Duplicate entry (unique constraint) |
| 422  | Unprocessable Entity           | Validation error                    |
| 500  | Internal Server Error          | Unexpected errors                   |

## Custom Error

```typescript
throw createError('Custom message', 400, 'CUSTOM_CODE')
```

## Prisma Auto-Translation

These Prisma errors are automatically converted:

| Prisma Code | Converts To                                              |
| ----------- | -------------------------------------------------------- |
| P2002       | "Entity with this field already exists" (409)            |
| P2025       | "Entity not found" (404)                                 |
| P2003       | "Invalid reference: Related entity does not exist" (400) |
| P2011       | "Missing required field for Entity" (400)                |

## Response Format

All errors return:

```json
{
  "success": false,
  "message": "User-friendly error message"
}
```

## Tips

1. ✅ **Always specify entity name** in `handleServiceError(error, 'EntityName')`
2. ✅ **Use pre-defined messages** from `ErrorMessages` when possible
3. ✅ **Include proper status codes** (404, 409, 400, etc.)
4. ✅ **Wrap all database operations** in try-catch
5. ✅ **Keep error messages user-friendly** and actionable
