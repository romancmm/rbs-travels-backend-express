# Multiple Category Filtering for Posts

## Overview

Posts now support filtering by multiple categories using either category IDs or category slugs.

## Database Schema

The Post-Category relationship is already configured as **many-to-many** via the `_PostCategories`
junction table in Prisma:

```prisma
model Post {
  categories  Category[] @relation("PostCategories")
}

model Category {
  posts       Post[]   @relation("PostCategories")
}
```

## API Changes

### Query Parameters

#### Admin Endpoints (`/api/v1/admin/articles/posts`)

- ✅ `categoryIds[]` - Array of category UUIDs
- ✅ `categorySlugs[]` - Array of category slugs
- ✅ `tag` - Single tag name
- ✅ `authorId` - Author UUID
- ✅ `isPublished` - Boolean
- ✅ `q` - Search query (title, excerpt, content)
- ✅ `page` - Page number
- ✅ `perPage` - Items per page

#### Public Endpoints (`/api/v1/articles/posts`)

- ✅ `categoryIds[]` - Array of category UUIDs
- ✅ `categorySlugs[]` - Array of category slugs
- ✅ `tag` - Single tag name
- ✅ `authorId` - Author UUID
- ✅ `q` - Search query
- ✅ `page` - Page number
- ✅ `perPage` - Items per page

### Usage Examples

#### Filter by Single Category (ID)

```bash
GET /api/v1/articles/posts?categoryIds=123e4567-e89b-12d3-a456-426614174000
```

#### Filter by Multiple Categories (IDs)

```bash
GET /api/v1/articles/posts?categoryIds=123e4567-e89b-12d3-a456-426614174000&categoryIds=223e4567-e89b-12d3-a456-426614174001
```

#### Filter by Single Category (Slug)

```bash
GET /api/v1/articles/posts?categorySlugs=technology
```

#### Filter by Multiple Categories (Slugs)

```bash
GET /api/v1/articles/posts?categorySlugs=technology&categorySlugs=business&categorySlugs=design
```

#### Combined Filters

```bash
GET /api/v1/articles/posts?categorySlugs=tech&categorySlugs=business&tag=featured&page=1&perPage=10
```

## Implementation Details

### Controller Layer

- Parses array parameters from query string (handles both single and multiple values)
- Converts string parameters to arrays when needed

### Service Layer

- Uses Prisma's `some` and `in` operators for filtering:
  ```typescript
  where.categories = { some: { id: { in: categoryIds } } }
  ```
- Returns posts that match **any** of the specified categories (OR logic)

### Validator Layer

- Updated schema to accept arrays:
  ```typescript
  categoryIds: z.array(uuidSchema).optional()
  categorySlugs: z.array(z.string()).optional()
  ```

### Swagger Documentation

- Admin docs (`article.admin.yaml`): Updated query parameters with array support
- Public docs (`article.public.yaml`): Updated with examples showing multiple category filtering
- BlogPost schema updated to show `categories` as an array

## Response Format

Posts returned include the full `categories` array:

```json
{
  "items": [
    {
      "id": "...",
      "title": "Post Title",
      "slug": "post-slug",
      "categories": [
        {
          "id": "123e4567-e89b-12d3-a456-426614174000",
          "name": "Technology",
          "slug": "technology"
        },
        {
          "id": "223e4567-e89b-12d3-a456-426614174001",
          "name": "Business",
          "slug": "business"
        }
      ],
      ...
    }
  ],
  "page": 1,
  "perPage": 10,
  "total": 50
}
```

## Frontend Integration

### JavaScript/TypeScript

```typescript
// Filter by multiple categories using IDs
const response = await fetch('/api/v1/articles/posts?categoryIds=uuid1&categoryIds=uuid2')

// Filter by multiple categories using slugs
const params = new URLSearchParams()
params.append('categorySlugs', 'technology')
params.append('categorySlugs', 'business')
const response = await fetch(`/api/v1/articles/posts?${params}`)
```

### React Example

```tsx
const fetchPosts = async (categoryIds: string[]) => {
  const params = new URLSearchParams()
  categoryIds.forEach((id) => params.append('categoryIds', id))

  const response = await fetch(`/api/v1/articles/posts?${params}`)
  const data = await response.json()
  return data
}
```

## Notes

- The filter uses OR logic: posts matching **any** of the specified categories will be returned
- You can mix `categoryIds` and `categorySlugs` in the same request, but it's recommended to use one
  or the other
- Both admin and public endpoints support the same filtering capabilities
- The many-to-many relationship was already established in the database schema
