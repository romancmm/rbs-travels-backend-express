# Validation Implementation Guide

This guide shows how to integrate the new Zod validation system into your existing Dynamic CMS
backend.

## ✅ What's Been Created

### 1. Validation Infrastructure

- ✅ **Zod package** installed (v4.1.12)
- ✅ **Validation middleware** (`src/middlewares/validation.middleware.ts`)
- ✅ **12 Validator files** with schemas and TypeScript types

### 2. Validators Created

| Validator File          | Purpose                 | Key Schemas                                      |
| ----------------------- | ----------------------- | ------------------------------------------------ |
| `common.validator.ts`   | Shared utilities        | UUID, Email, Password, Slug, Pagination          |
| `auth.validator.ts`     | Authentication          | Login, Register, Reset Password, Change Password |
| `blog.validator.ts`     | Blog Posts & Categories | Create/Update Post, Create/Update Category       |
| `user.validator.ts`     | User/Admin Management   | Create/Update User, Update Profile               |
| `customer.validator.ts` | Customer Management     | Create/Update Customer, Update Profile           |
| `rbac.validator.ts`     | Roles & Permissions     | Create/Update Role, Create/Update Permission     |
| `service.validator.ts`  | Services                | Create/Update Service                            |
| `project.validator.ts`  | Projects                | Create/Update Project                            |
| `page.validator.ts`     | Pages                   | Create/Update Page                               |
| `setting.validator.ts`  | Settings                | Create/Update Setting                            |

## 🚀 Quick Start: How to Use

### Step 1: Import Validators in Your Routes

```typescript
import { validate } from '@/validators'
import { loginSchema, registerSchema } from '@/validators/auth.validator'
```

### Step 2: Add Validation Middleware to Routes

```typescript
// Before (no validation)
router.post('/login', AuthController.login)

// After (with validation)
router.post('/login', validate(loginSchema), AuthController.login)
```

### Step 3: Use TypeScript Types in Services

```typescript
import type { LoginInput } from '@/validators/auth.validator'

export const loginService = async (data: LoginInput) => {
  // data is now fully typed!
  const { email, password } = data
  // ...
}
```

## 📋 Migration Checklist

### Auth Routes (`src/api/auth/`)

- [ ] `POST /auth/register` → Add `validate(registerSchema)`
- [ ] `POST /auth/login` → Add `validate(loginSchema)`
- [ ] `POST /auth/refresh` → Add `validate(refreshTokenSchema)`
- [ ] `POST /auth/reset-password` → Add `validate(resetPasswordRequestSchema)`
- [ ] `POST /auth/change-password` → Add `validate(changePasswordSchema)`
- [ ] `POST /auth/admin/login` → Add `validate(adminLoginSchema)`

### Blog Routes (`src/api/blog/`)

**Admin Routes:**

- [ ] `GET /admin/blog` → Add `validate(postQuerySchema, 'query')`
- [ ] `POST /admin/blog` → Add `validate(createPostSchema)`
- [ ] `PUT /admin/blog/:id` → Add
      `validateMultiple({ params: idParamSchema, body: updatePostSchema })`
- [ ] `DELETE /admin/blog/:id` → Add `validate(idParamSchema, 'params')`

**Public Routes:**

- [ ] `GET /blog` → Add `validate(postQuerySchema, 'query')`
- [ ] `GET /blog/:slug` → Add `validate(slugParamSchema, 'params')`

**Category Routes:**

- [ ] `POST /admin/category` → Add `validate(createCategorySchema)`
- [ ] `PUT /admin/category/:id` → Add
      `validateMultiple({ params: idParamSchema, body: updateCategorySchema })`

### User/Admin Routes (`src/api/admin/`)

- [ ] `GET /admin/user` → Add `validate(userQuerySchema, 'query')`
- [ ] `POST /admin/user` → Add `validate(createUserSchema)`
- [ ] `PUT /admin/user/:id` → Add
      `validateMultiple({ params: idParamSchema, body: updateUserSchema })`
- [ ] `PUT /profile` → Add `validate(updateProfileSchema)`

### Customer Routes (`src/api/customer/`)

- [ ] `GET /admin/customer` → Add `validate(customerQuerySchema, 'query')`
- [ ] `POST /admin/customer` → Add `validate(createCustomerSchema)`
- [ ] `PUT /admin/customer/:id` → Add
      `validateMultiple({ params: idParamSchema, body: updateCustomerSchema })`
- [ ] `PUT /customers/profile` → Add `validate(updateCustomerProfileSchema)`

### Role & Permission Routes (`src/api/role/`, `src/api/permission/`)

- [ ] `POST /admin/role` → Add `validate(createRoleSchema)`
- [ ] `PUT /admin/role/:id` → Add
      `validateMultiple({ params: idParamSchema, body: updateRoleSchema })`
- [ ] `POST /admin/permission` → Add `validate(createPermissionSchema)`
- [ ] `PUT /admin/permission/:id` → Add
      `validateMultiple({ params: idParamSchema, body: updatePermissionSchema })`

### Service Routes (`src/api/service/`)

- [ ] `GET /services` → Add `validate(serviceQuerySchema, 'query')`
- [ ] `POST /admin/service` → Add `validate(createServiceSchema)`
- [ ] `PUT /admin/service/:id` → Add
      `validateMultiple({ params: idParamSchema, body: updateServiceSchema })`

### Project Routes (`src/api/project/`)

- [ ] `GET /projects` → Add `validate(projectQuerySchema, 'query')`
- [ ] `POST /admin/project` → Add `validate(createProjectSchema)`
- [ ] `PUT /admin/project/:id` → Add
      `validateMultiple({ params: idParamSchema, body: updateProjectSchema })`

### Page Routes (`src/api/page/`)

- [ ] `GET /pages` → Add `validate(pageQuerySchema, 'query')`
- [ ] `POST /admin/page` → Add `validate(createPageSchema)`
- [ ] `PUT /admin/page/:id` → Add
      `validateMultiple({ params: idParamSchema, body: updatePageSchema })`

### Setting Routes (`src/api/setting/`)

- [ ] `GET /admin/setting` → Add `validate(settingQuerySchema, 'query')`
- [ ] `POST /admin/setting` → Add `validate(createSettingSchema)`
- [ ] `PUT /admin/setting/:id` → Add
      `validateMultiple({ params: idParamSchema, body: updateSettingSchema })`

## 💡 Example Implementation

### Example 1: Auth Routes

**Before:**

```typescript
// src/api/auth/customerAuth.route.ts
import { Router } from 'express'
import * as AuthController from '@/controllers/auth/Auth.controller'

const router = Router()

router.post('/register', AuthController.register)
router.post('/login', AuthController.login)

export default router
```

**After:**

```typescript
// src/api/auth/customerAuth.route.ts
import { Router } from 'express'
import { validate } from '@/validators'
import { registerSchema, loginSchema } from '@/validators/auth.validator'
import * as AuthController from '@/controllers/auth/Auth.controller'

const router = Router()

router.post('/register', validate(registerSchema), AuthController.register)
router.post('/login', validate(loginSchema), AuthController.login)

export default router
```

### Example 2: Blog Admin Routes

**Before:**

```typescript
// src/api/blog/blog.admin.route.ts
import { Router } from 'express'
import * as PostController from '@/controllers/blog/Post.controller'

const router = Router()

router.get('/', PostController.list)
router.post('/', PostController.create)
router.put('/:id', PostController.update)
router.delete('/:id', PostController.remove)

export default router
```

**After:**

```typescript
// src/api/blog/blog.admin.route.ts
import { Router } from 'express'
import { validate, validateMultiple } from '@/validators'
import { postQuerySchema, createPostSchema, updatePostSchema } from '@/validators/article.validator'
import { idParamSchema } from '@/validators/common.validator'
import * as PostController from '@/controllers/blog/Post.controller'

const router = Router()

router.get('/', validate(postQuerySchema, 'query'), PostController.list)
router.post('/', validate(createPostSchema), PostController.create)
router.put(
  '/:id',
  validateMultiple({
    params: idParamSchema,
    body: updatePostSchema,
  }),
  PostController.update
)
router.delete('/:id', validate(idParamSchema, 'params'), PostController.remove)

export default router
```

### Example 3: Update Controller to Use Types

**Before:**

```typescript
// src/controllers/blog/Post.controller.ts
export const create: RequestHandler = async (req, res) => {
  try {
    const data = await createPostService(req.body, req.user?.id as string)
    return success(res, data, 'Post created')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}
```

**After:**

```typescript
// src/controllers/blog/Post.controller.ts
import type { CreatePostInput } from '@/validators/article.validator'

export const create: RequestHandler = async (req, res) => {
  try {
    // req.body is now validated and typed
    const postData = req.body as CreatePostInput
    const data = await createPostService(postData, req.user?.id as string)
    return success(res, data, 'Post created')
  } catch (err: any) {
    return error(res, err.message, err.status || 400)
  }
}
```

### Example 4: Update Service to Use Types

**Before:**

```typescript
// src/services/article/Post.service.ts
export const createPostService = async (data: any, authorId: string) => {
  const { title, slug, excerpt, content, thumbnail, categoryId, tags, isPublished, publishedAt } =
    data || {}
  if (!title || !slug || !content) throw new Error('Required fields missing')
  // ...
}
```

**After:**

```typescript
// src/services/article/Post.service.ts
import type { CreatePostInput, UpdatePostInput } from '@/validators/article.validator'

export const createPostService = async (data: CreatePostInput, authorId: string) => {
  // No need for manual validation - data is already validated and typed!
  const payload = {
    ...data,
    authorId,
    tags: data.tags || [],
  }

  const post = await prisma.post.create({ data: payload })
  return post
}

export const updatePostService = async (id: string, data: UpdatePostInput) => {
  const post = await prisma.post.update({
    where: { id },
    data,
  })
  return post
}
```

## 🎯 Benefits

### 1. **Type Safety**

- Automatic TypeScript type inference from Zod schemas
- No manual type definitions needed
- Catch type errors at compile time

### 2. **Runtime Validation**

- All input is validated before reaching controllers
- Consistent error messages
- Prevents invalid data from entering the system

### 3. **Reduced Boilerplate**

- No manual validation in services
- No `if (!field) throw new Error()` checks
- Cleaner, more readable code

### 4. **Better Developer Experience**

- Auto-completion in IDEs
- Clear validation errors
- Self-documenting code

### 5. **Consistent API Responses**

- Standardized error format (422 for validation errors)
- Clear field-level error messages
- Easier debugging

## ⚠️ Common Pitfalls

### 1. Don't forget to import validators

```typescript
// ❌ Wrong
router.post('/login', AuthController.login)

// ✅ Correct
import { validate } from '@/validators'
import { loginSchema } from '@/validators/auth.validator'
router.post('/login', validate(loginSchema), AuthController.login)
```

### 2. Use correct validation source

```typescript
// ❌ Wrong - validating body for query params
router.get('/posts', validate(postQuerySchema), controller.list)

// ✅ Correct
router.get('/posts', validate(postQuerySchema, 'query'), controller.list)
```

### 3. Validate params AND body when needed

```typescript
// ❌ Wrong - only validating body
router.put('/:id', validate(updateSchema), controller.update)

// ✅ Correct - validating both params and body
router.put(
  '/:id',
  validateMultiple({
    params: idParamSchema,
    body: updateSchema,
  }),
  controller.update
)
```

### 4. Don't re-validate in services

```typescript
// ❌ Wrong - redundant validation
export const createPost = async (data: CreatePostInput) => {
  if (!data.title) throw new Error('Title required') // Already validated!
  // ...
}

// ✅ Correct - trust the validation
export const createPost = async (data: CreatePostInput) => {
  // data is guaranteed to be valid
  const post = await prisma.post.create({ data })
  return post
}
```

## 📚 Next Steps

1. **Start with Auth routes** - These are critical and benefit most from validation
2. **Move to CRUD operations** - Blog, Service, Project routes
3. **Update controllers** - Add type annotations for better IDE support
4. **Refactor services** - Remove manual validation, use TypeScript types
5. **Test thoroughly** - Ensure all validation scenarios work correctly
6. **Update API documentation** - Document required fields and validation rules in Swagger

## 🔗 Resources

- [Zod Documentation](https://zod.dev)
- [Validators README](/src/validators/README.md)
- [Express Middleware Guide](https://expressjs.com/en/guide/using-middleware.html)

---

**Need Help?** Check the `src/validators/README.md` for detailed documentation and examples.
