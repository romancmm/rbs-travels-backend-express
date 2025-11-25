# Blog to Article Refactoring - Complete

## Summary

Successfully refactored the entire codebase from "blog" terminology to "article" terminology to
better reflect the content management system's purpose.

## Changes Made

### 1. Directory Structure

- `src/api/blog/` → `src/api/article/`
- `src/controllers/blog/` → `src/controllers/article/`
- `src/services/blog/` → `src/services/article/`

### 2. Files Renamed

- `src/api/blog/blog.admin.route.ts` → `src/api/article/article.admin.route.ts`
- `src/api/blog/blog.public.route.ts` → `src/api/article/article.public.route.ts`
- `src/validators/blog.validator.ts` → `src/validators/article.validator.ts`
- `docs/openapi/blog.admin.yaml` → `docs/openapi/article.admin.yaml`
- `docs/openapi/blog.public.yaml` → `docs/openapi/article.public.yaml`

### 3. Import Path Updates

Updated all import statements across:

- `src/routes/admin.ts`
- `src/routes/public.ts`
- `src/validators/index.ts`
- All controller files
- All service files

### 4. Type Definitions

- `BlogSeo` → `ArticleSeo`
- `blogSeoSchema` → `articleSeoSchema`
- `CreatePostInput` (now uses articleSeoSchema)
- `UpdatePostInput` (now uses articleSeoSchema)

### 5. Menu System

- `MenuItemType`: `category-blog` → `category-articles`
- Type guard: `isCategoryBlogMenuItem()` → `isCategoryArticlesMenuItem()`
- URL resolution: `/blog/*` → `/articles/*`
- All validation logic updated in `menu.validator.ts`

### 6. Route Paths

- Admin: `/admin/blog/*` → `/admin/articles/*`
- Public: `/blog/*` → `/articles/*`

### 7. OpenAPI Documentation

- Updated all paths in `article.admin.yaml`
- Updated all paths in `article.public.yaml`
- Tags: `Blog - Admin` → `Articles - Admin`
- Tags: `Blog - Public` → `Articles - Public`

### 8. Service Layer

- Updated comments in `menu.service.ts`
- All business logic now references "articles"

### 9. Prisma Schema

- Uncommented `Service` and `Project` models
- Updated MenuItem.type comment to include `category-articles`

### 10. Documentation

- Updated import paths in all `.md` files
- Updated service references
- Updated terminology (Blog Validator → Article Validator, etc.)

## Verification

✅ TypeScript compilation: No errors ✅ Prisma Client generation: Successful ✅ No remaining "blog"
references in core code (routes, controllers, services, validators) ✅ All import paths resolved
correctly ✅ Menu system uses correct terminology

## API Endpoints

### Admin Routes

- `GET /admin/articles/posts` - List posts
- `POST /admin/articles/posts` - Create post
- `GET /admin/articles/posts/:id` - Get post
- `PUT /admin/articles/posts/:id` - Update post
- `DELETE /admin/articles/posts/:id` - Delete post
- `GET /admin/articles/categories` - List categories
- `POST /admin/articles/categories` - Create category
- (Similar CRUD for categories)

### Public Routes

- `GET /articles/posts` - List published posts
- `GET /articles/posts/:slug` - Get post by slug
- `GET /articles/categories` - List categories
- `GET /articles/categories/:slug` - Get category by slug
- `GET /articles/categories/:slug/posts` - List posts in category

## Menu Item Types

The menu system now uses:

1. `category-articles` - Links to article category listing (reference: array of category slugs)
2. `single-article` - Links to single article (reference: article slug)
3. `page` - Links to page (reference: page slug)
4. `service` - Links to service (reference: service slug)
5. `project` - Links to project (reference: project slug)
6. `custom-link` - Custom internal link (url field)
7. `external-link` - External link (url field)

## Migration Notes

If you have existing data in your database with `type: 'category-blog'`, you'll need to run a
migration:

```sql
UPDATE "MenuItem" SET type = 'category-articles' WHERE type = 'category-blog';
```

## Next Steps

- [ ] Update seed data if needed (`prisma/seed.ts`)
- [ ] Test all article endpoints
- [ ] Verify menu item URL resolution
- [ ] Update any frontend code that references `/blog` paths
- [ ] Update any external documentation or API clients

## Date Completed

January 2025
