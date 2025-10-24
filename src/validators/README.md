# Validation System

This directory contains all Zod validation schemas and TypeScript types for the Travel Agency
backend API.

## Overview

The validation system uses **Zod** for runtime validation and TypeScript type inference. Each
validator file contains:

- Zod schemas for request validation
- Inferred TypeScript types for type safety
- Create, Update, and Query schemas where applicable

## File Structure

```
validators/
├── index.ts                  # Central export point
├── common.validator.ts       # Shared schemas (UUID, Email, Pagination, etc.)
├── auth.validator.ts         # Authentication schemas (Login, Register, etc.)
├── blog.validator.ts         # Post and Category schemas
├── user.validator.ts         # User/Admin schemas
├── customer.validator.ts     # Customer schemas
├── rbac.validator.ts         # Role and Permission schemas
├── service.validator.ts      # Service schemas
├── project.validator.ts      # Project schemas
├── page.validator.ts         # Page schemas
└── setting.validator.ts      # Setting schemas
```

## Usage

### 1. Import Validators

```typescript
// Import specific validators
import { loginSchema, registerSchema } from '@/validators/auth.validator'
import { createPostSchema, updatePostSchema } from '@/validators/blog.validator'

// Or import from index
import { loginSchema, registerSchema, createPostSchema } from '@/validators'
```

### 2. Use in Routes with Middleware

```typescript
import { Router } from 'express'
import { validate } from '@/middlewares/validation.middleware'
import { loginSchema, registerSchema } from '@/validators/auth.validator'
import * as AuthController from '@/controllers/auth/Auth.controller'

const router = Router()

// Apply validation middleware before controller
router.post('/login', validate(loginSchema), AuthController.login)
router.post('/register', validate(registerSchema), AuthController.register)

export default router
```

### 3. Validate Different Request Parts

```typescript
import { validate } from '@/validators'
import { idParamSchema, createPostSchema, postQuerySchema } from '@/validators'

// Validate body (default)
router.post('/posts', validate(createPostSchema), controller.create)

// Validate query params
router.get('/posts', validate(postQuerySchema, 'query'), controller.list)

// Validate URL params
router.get('/posts/:id', validate(idParamSchema, 'params'), controller.getById)
```

### 4. Validate Multiple Sources

```typescript
import { validateMultiple } from '@/validators'
import { idParamSchema, updatePostSchema } from '@/validators'

router.put(
  '/posts/:id',
  validateMultiple({
    params: idParamSchema,
    body: updatePostSchema,
  }),
  controller.update
)
```

### 5. Use TypeScript Types in Controllers and Services

```typescript
import type { LoginInput, RegisterInput } from '@/validators/auth.validator'
import type { CreatePostInput, UpdatePostInput } from '@/validators/blog.validator'

// In service
export const createPost = async (data: CreatePostInput, authorId: string) => {
  // data is fully typed
  const post = await prisma.post.create({
    data: {
      ...data,
      authorId,
    },
  })
  return post
}

// In controller
export const login: RequestHandler = async (req, res) => {
  const loginData = req.body as LoginInput // Already validated by middleware
  const result = await loginService(loginData)
  return success(res, result)
}
```

## Available Validators

### Common Validators (`common.validator.ts`)

- `uuidSchema` - UUID validation
- `emailSchema` - Email validation
- `passwordSchema` - Strong password validation
- `slugSchema` - URL-safe slug validation
- `paginationQuerySchema` - Pagination parameters (page, perPage, q)
- `idParamSchema` - ID parameter validation
- `slugParamSchema` - Slug parameter validation
- `booleanQuerySchema` - Boolean query params
- `dateStringSchema` - ISO date string validation
- `stringArraySchema` - Array of strings
- `imageUrlSchema` - Image URL validation
- `jsonSchema` - Flexible JSON validation

### Auth Validators (`auth.validator.ts`)

- `loginSchema` - Login credentials
- `registerSchema` - User registration
- `refreshTokenSchema` - Token refresh
- `resetPasswordRequestSchema` - Password reset request
- `resetPasswordSchema` - Password reset with token
- `changePasswordSchema` - Change password (authenticated)
- `adminLoginSchema` - Admin login

### Blog Validators (`blog.validator.ts`)

**Post Schemas:**

- `createPostSchema` - Create new post
- `updatePostSchema` - Update existing post
- `postQuerySchema` - Post list query params

**Category Schemas:**

- `createCategorySchema` - Create new category
- `updateCategorySchema` - Update existing category
- `categoryQuerySchema` - Category list query params

### User Validators (`user.validator.ts`)

- `createUserSchema` - Create new user/admin
- `updateUserSchema` - Update user/admin
- `updateProfileSchema` - Update own profile
- `userQuerySchema` - User list query params

### Customer Validators (`customer.validator.ts`)

- `createCustomerSchema` - Create customer (admin)
- `updateCustomerSchema` - Update customer (admin)
- `updateCustomerProfileSchema` - Update own profile (customer)
- `customerQuerySchema` - Customer list query params

### RBAC Validators (`rbac.validator.ts`)

**Role Schemas:**

- `createRoleSchema` - Create new role
- `updateRoleSchema` - Update role
- `roleQuerySchema` - Role list query params

**Permission Schemas:**

- `createPermissionSchema` - Create permission
- `updatePermissionSchema` - Update permission
- `permissionQuerySchema` - Permission list query params
- `assignPermissionsSchema` - Assign permissions to role

### Service Validators (`service.validator.ts`)

- `createServiceSchema` - Create service
- `updateServiceSchema` - Update service
- `serviceQuerySchema` - Service list query params

### Project Validators (`project.validator.ts`)

- `createProjectSchema` - Create project
- `updateProjectSchema` - Update project
- `projectQuerySchema` - Project list query params

### Page Validators (`page.validator.ts`)

- `createPageSchema` - Create page with JSON content
- `updatePageSchema` - Update page
- `pageQuerySchema` - Page list query params

### Setting Validators (`setting.validator.ts`)

- `createSettingSchema` - Create setting
- `updateSettingSchema` - Update setting value
- `settingQuerySchema` - Setting list query params

## Validation Middleware

### `validate(schema, source?)`

Validates a single request part (body, query, or params).

**Parameters:**

- `schema` - Zod schema to validate against
- `source` - 'body' | 'query' | 'params' (default: 'body')

**Example:**

```typescript
router.post('/login', validate(loginSchema), controller.login)
router.get('/posts', validate(postQuerySchema, 'query'), controller.list)
```

### `validateMultiple(schemas)`

Validates multiple request parts simultaneously.

**Parameters:**

- `schemas` - Object with optional `body`, `query`, and `params` schemas

**Example:**

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

## Error Response Format

When validation fails, the middleware returns a 422 status with:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    {
      "code": "invalid_type",
      "expected": "string",
      "received": "undefined",
      "path": ["email"],
      "message": "Required"
    }
  ]
}
```

## Best Practices

1. **Always use validators in routes** - Don't rely on manual validation
2. **Use inferred types** - Let TypeScript infer types from schemas
3. **Keep validators DRY** - Reuse common schemas from `common.validator.ts`
4. **Document custom schemas** - Add JSDoc comments for complex validations
5. **Test edge cases** - Ensure schemas handle all input scenarios
6. **Use transforms wisely** - Transform string arrays, dates, etc. in schemas

## Example: Complete Route Implementation

```typescript
// routes/auth.ts
import { Router } from 'express'
import { validate } from '@/validators'
import { loginSchema, registerSchema, changePasswordSchema } from '@/validators'
import * as AuthController from '@/controllers/auth/Auth.controller'
import { authenticate } from '@/middlewares/auth.middleware'

const router = Router()

router.post('/login', validate(loginSchema), AuthController.login)
router.post('/register', validate(registerSchema), AuthController.register)
router.post(
  '/change-password',
  authenticate,
  validate(changePasswordSchema),
  AuthController.changePassword
)

export default router
```

```typescript
// controllers/auth/Auth.controller.ts
import type { RequestHandler } from 'express'
import type { LoginInput, RegisterInput } from '@/validators'
import * as AuthService from '@/services/auth/Auth.service'
import { success, error } from '@/utils/response'

export const login: RequestHandler = async (req, res) => {
  try {
    const loginData = req.body as LoginInput // Already validated
    const result = await AuthService.loginService(loginData)
    return success(res, result, 'Login successful')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}
```

```typescript
// services/auth/Auth.service.ts
import type { LoginInput } from '@/validators'
import prisma from '@/utils/prisma'
import { comparePassword } from '@/utils/password'
import { generateTokens } from '@/utils/jwt'

export const loginService = async (data: LoginInput) => {
  const { email, password } = data

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) throw new Error('Invalid credentials')

  const isValid = await comparePassword(password, user.password)
  if (!isValid) throw new Error('Invalid credentials')

  const tokens = generateTokens({ id: user.id, email: user.email })
  return { user, tokens }
}
```

## Adding New Validators

When adding new models/features:

1. Create a new validator file: `src/validators/[feature].validator.ts`
2. Define Zod schemas for CRUD operations
3. Export TypeScript types using `z.infer<typeof schema>`
4. Export from `index.ts`
5. Use in routes with validation middleware
6. Update this README with the new validator documentation

---

For more information about Zod, visit: https://zod.dev
