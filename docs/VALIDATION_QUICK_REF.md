# 🚀 Validation Quick Reference

## Import Validators

```typescript
// Middleware
import { validate, validateMultiple } from '@/middlewares/validation.middleware'

// Common validators
import {
  idParamSchema,
  slugParamSchema,
  paginationQuerySchema,
} from '@/validators/common.validator'

// Domain-specific validators
import { createPostSchema, updatePostSchema } from '@/validators/article.validator'
import { createServiceSchema } from '@/validators/service.validator'
// ... etc
```

## Usage Patterns

### 1. Validate Request Body (POST, PUT)

```typescript
router.post('/posts', validate(createPostSchema), controller.create)
router.put('/posts/:id', validate(updatePostSchema), controller.update)
```

### 2. Validate Query Parameters (GET)

```typescript
router.get('/posts', validate(postQuerySchema, 'query'), controller.list)
```

### 3. Validate URL Parameters (/:id, /:slug)

```typescript
router.get('/posts/:id', validate(idParamSchema, 'params'), controller.get)
router.get('/posts/slug/:slug', validate(slugParamSchema, 'params'), controller.getBySlug)
```

### 4. Validate Multiple Sources

```typescript
router.put(
  '/posts/:id',
  validateMultiple({
    params: idParamSchema,
    body: updatePostSchema,
  }),
  controller.update
)
```

## TypeScript Types

### In Controllers

```typescript
import type { CreatePostInput } from '@/validators/article.validator'

export const create: RequestHandler = async (req, res) => {
  const data = req.body as CreatePostInput // Already validated
  const result = await createPostService(data)
  return success(res, result)
}
```

### In Services

```typescript
import type { CreatePostInput, UpdatePostInput } from '@/validators/article.validator'

export const createPost = async (data: CreatePostInput) => {
  // data is guaranteed valid - no need to check
  return await prisma.post.create({ data })
}

export const updatePost = async (id: string, data: UpdatePostInput) => {
  return await prisma.post.update({ where: { id }, data })
}
```

## Available Validators

| Module     | Create Schema                              | Update Schema                              | Query Schema                             |
| ---------- | ------------------------------------------ | ------------------------------------------ | ---------------------------------------- |
| Auth       | `registerSchema`, `loginSchema`            | -                                          | -                                        |
| Blog       | `createPostSchema`, `createCategorySchema` | `updatePostSchema`, `updateCategorySchema` | `postQuerySchema`, `categoryQuerySchema` |
| User       | `createUserSchema`                         | `updateUserSchema`                         | `userQuerySchema`                        |
| Customer   | `createCustomerSchema`                     | `updateCustomerSchema`                     | `customerQuerySchema`                    |
| Role       | `createRoleSchema`                         | `updateRoleSchema`                         | `roleQuerySchema`                        |
| Permission | `createPermissionSchema`                   | `updatePermissionSchema`                   | `permissionQuerySchema`                  |
| Service    | `createServiceSchema`                      | `updateServiceSchema`                      | `serviceQuerySchema`                     |
| Project    | `createProjectSchema`                      | `updateProjectSchema`                      | `projectQuerySchema`                     |
| Page       | `createPageSchema`                         | `updatePageSchema`                         | `pageQuerySchema`                        |
| Setting    | `createSettingSchema`                      | `updateSettingSchema`                      | `settingQuerySchema`                     |

## Common Validators

- `idParamSchema` - UUID validation for `:id` params
- `slugParamSchema` - Slug validation for `:slug` params
- `paginationQuerySchema` - Page, perPage, q (search)
- `emailSchema` - Email validation
- `passwordSchema` - Strong password validation
- `uuidSchema` - UUID validation
- `booleanQuerySchema` - Boolean query params
- `imageUrlSchema` - Image URL validation
- `jsonSchema` - JSON data validation

## Error Response Format

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "path": ["email"],
      "message": "Invalid email address"
    },
    {
      "path": ["password"],
      "message": "Password must be at least 8 characters"
    }
  ]
}
```

**Status Code:** `422 Unprocessable Entity`

## Testing Validation

```bash
# Test invalid email
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "invalid-email",
    "password": "short"
  }'

# Expected: 422 error with validation details
```

## Creating Custom Validators

```typescript
import { z } from 'zod'

// Custom schema
export const myCustomSchema = z.object({
  field1: z.string().min(1),
  field2: z.number().positive(),
  field3: z.boolean().optional(),
})

// TypeScript type
export type MyCustomInput = z.infer<typeof myCustomSchema>

// Use in route
router.post('/custom', validate(myCustomSchema), controller.create)
```

## Tips

1. **Always validate user input** - Never trust client data
2. **Use TypeScript types** - Leverage auto-generated types from schemas
3. **Don't re-validate** - If validation passed, data is guaranteed valid
4. **Reuse common schemas** - Use `idParamSchema`, `paginationQuerySchema`, etc.
5. **Test with invalid data** - Ensure error handling works correctly

---

**Need Help?** See `VALIDATION_GUIDE.md` for detailed examples or `VALIDATION_APPLIED.md` for
complete implementation details.
