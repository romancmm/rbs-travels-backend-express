# Slug Management System

## Overview

A comprehensive, centralized slug management system that handles slug generation, purification,
validation, and uniqueness across all models in the application.

## Features

✅ **Auto-generation** - Automatically generate slugs from titles if not provided  
✅ **Purification** - Clean and normalize client-provided slugs  
✅ **Uniqueness** - Ensure all slugs are unique with automatic suffixing  
✅ **Validation** - Optional validators for strict format enforcement  
✅ **Performance** - Efficient database queries for slug checking  
✅ **Consistency** - Single source of truth for slug handling

## Architecture

### Core Utility: `src/utils/slug.util.ts`

Central slug utility providing all slug-related functionality:

```typescript
import { handleSlug } from '@/utils/slug.util';

// Auto-generate or purify slug
const slug = await handleSlug('post', title, providedSlug?, excludeId?);
```

### Key Functions

#### `handleSlug(model, title, providedSlug?, excludeId?)`

Main function - handles all slug operations automatically.

**Parameters:**

- `model` - Prisma model name (e.g., 'post', 'category', 'service')
- `title` - Source text to generate slug from
- `providedSlug` - Optional client-provided slug
- `excludeId` - ID to exclude when checking uniqueness (for updates)

**Returns:** Unique, purified slug

**Examples:**

```typescript
// Create: Auto-generate from title
const slug = await handleSlug('post', 'My Blog Post')
// Result: 'my-blog-post'

// Create: Purify client slug
const slug = await handleSlug('post', 'My Blog Post', 'My Invalid Slug!!!')
// Result: 'my-invalid-slug'

// Create: Handle duplicates
const slug = await handleSlug('post', 'Existing Post', 'existing-post')
// Result: 'existing-post-2'

// Update: Exclude current record
const slug = await handleSlug('post', 'Updated Title', 'new-slug', currentPostId)
// Result: 'new-slug' (won't conflict with itself)
```

#### `generateSlug(text)`

Converts text to slug format.

```typescript
generateSlug('Hello World! 123')
// Result: 'hello-world-123'

generateSlug('Café São Paulo')
// Result: 'cafe-sao-paulo'
```

**Features:**

- Converts to lowercase
- Removes accents/diacritics
- Replaces spaces with hyphens
- Removes special characters
- Consolidates multiple hyphens
- Trims leading/trailing hyphens

#### `purifySlug(slug)`

Alias for `generateSlug` - used for client-provided slugs.

#### `isSlugUnique(model, slug, excludeId?)`

Checks if slug is unique for a model.

#### `ensureUniqueSlug(model, baseSlug, excludeId?)`

Generates unique slug by adding numeric suffix if needed.

```typescript
// If 'my-post' exists
await ensureUniqueSlug('post', 'my-post')
// Result: 'my-post-2'

// If 'my-post-2' also exists
// Result: 'my-post-3'
```

#### `isValidSlugFormat(slug)`

Validates slug format (for strict validation).

```typescript
isValidSlugFormat('valid-slug-123') // true
isValidSlugFormat('Invalid Slug') // false
isValidSlugFormat('invalid_slug') // false
isValidSlugFormat('-invalid-') // false
```

#### `regenerateSlug(model, title, currentId?)`

Regenerates slug from title (useful for bulk operations).

#### `batchGenerateSlugs(model, items[])`

Batch slug generation for seeding or migrations.

## Implementation

### In Services

All services with slug fields have been updated to use `handleSlug`:

**Create Operations:**

```typescript
import { handleSlug } from '@/utils/slug.util'

export const createPostService = async (data: CreatePostInput, authorId: string) => {
  // Auto-generate or purify slug
  const slug = await handleSlug('post', data.title, data.slug)

  const post = await prisma.post.create({
    data: {
      ...data,
      slug,
      authorId,
    },
  })
  return post
}
```

**Update Operations:**

```typescript
export const updatePostService = async (id: string, data: UpdatePostInput) => {
  let slug = data.slug

  // Only handle slug if title or slug is being updated
  if (data.title || data.slug) {
    const post = await prisma.post.findUnique({ where: { id } })
    if (!post) throw new Error('Not found')

    const title = data.title || post.title
    slug = await handleSlug('post', title, data.slug, id)
  }

  const post = await prisma.post.update({
    where: { id },
    data: {
      ...data,
      ...(slug && { slug }),
    },
  })
  return post
}
```

### Integrated Models

The following models have slug handling integrated:

- ✅ `Post` - Blog posts
- ✅ `Category` - Blog categories
- ✅ `Service` - Services
- ✅ `Project` - Portfolio projects
- ✅ `Page` - Static pages
- ✅ `Menu` - Navigation menus
- ✅ `MenuItem` - Menu items
- ✅ `PageBuilder` - Page builder pages

## Validation

### Optional Slug Validation

Slugs are **optional** in validators - backend handles generation/purification:

```typescript
// src/validators/common.validator.ts
export const slugSchema = z
  .string()
  .max(200, 'Slug must be at most 200 characters')
  .optional()
  .transform((val) => val?.trim() || undefined)
```

### Strict Slug Validation (Optional)

For admin interfaces requiring strict format:

```typescript
import { validateStrictSlug } from '@/validators/slug.validator'

// In route
router.post('/posts', validateStrictSlug, createPost)
```

## Client Integration

### API Requests

**Create with Auto-generation:**

```javascript
POST /api/posts
{
  "title": "My Amazing Blog Post",
  // slug will be auto-generated: 'my-amazing-blog-post'
  "content": "..."
}
```

**Create with Custom Slug:**

```javascript
POST /api/posts
{
  "title": "My Amazing Blog Post",
  "slug": "Custom Slug!!!",  // Will be purified to: 'custom-slug'
  "content": "..."
}
```

**Handle Duplicates:**

```javascript
// First post
POST /api/posts
{
  "title": "Duplicate Post",
  "slug": "duplicate-post"
}
// Result: slug = 'duplicate-post'

// Second post with same slug
POST /api/posts
{
  "title": "Another Post",
  "slug": "duplicate-post"
}
// Result: slug = 'duplicate-post-2'
```

**Update Slug:**

```javascript
PATCH /api/posts/:id
{
  "title": "Updated Title",
  "slug": "new-slug"  // Will ensure uniqueness
}
```

## Examples

### React/Next.js Component

```typescript
const CreatePostForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    slug: '', // Optional
    content: '',
  })

  const handleSubmit = async (e) => {
    e.preventDefault()

    // Slug is optional - backend will handle it
    const response = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: formData.title,
        // Only send slug if user provided one
        ...(formData.slug && { slug: formData.slug }),
        content: formData.content,
      }),
    })

    const post = await response.json()
    console.log('Created with slug:', post.slug)
  }

  return (
    <form onSubmit={handleSubmit}>
      <input
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        placeholder="Title (required)"
      />
      <input
        value={formData.slug}
        onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
        placeholder="Slug (optional - will auto-generate)"
      />
      <textarea
        value={formData.content}
        onChange={(e) => setFormData({ ...formData, content: e.target.value })}
      />
      <button type="submit">Create Post</button>
    </form>
  )
}
```

## Testing

```typescript
import { generateSlug, handleSlug, isValidSlugFormat } from '@/utils/slug.util'

describe('Slug Utility', () => {
  it('should generate slug from title', () => {
    expect(generateSlug('Hello World')).toBe('hello-world')
    expect(generateSlug('Café São Paulo')).toBe('cafe-sao-paulo')
  })

  it('should validate slug format', () => {
    expect(isValidSlugFormat('valid-slug')).toBe(true)
    expect(isValidSlugFormat('Invalid Slug')).toBe(false)
  })

  it('should ensure unique slugs', async () => {
    const slug1 = await handleSlug('post', 'Test Post')
    const slug2 = await handleSlug('post', 'Test Post')
    expect(slug2).toBe('test-post-2')
  })
})
```

## Migration Guide

### Existing Projects

If you have existing data without slugs:

```typescript
import { batchGenerateSlugs } from '@/utils/slug.util'

// Get all records without slugs
const posts = await prisma.post.findMany({
  where: { slug: null },
})

// Generate slugs
const updates = await batchGenerateSlugs(
  'post',
  posts.map((p) => ({
    id: p.id,
    title: p.title,
  }))
)

// Update database
for (const update of updates) {
  await prisma.post.update({
    where: { id: update.id },
    data: { slug: update.slug },
  })
}
```

## Best Practices

1. **Always use `handleSlug` in services** - Never manually generate slugs
2. **Make slug optional in validators** - Let backend handle generation
3. **Use `excludeId` parameter for updates** - Prevent self-conflict
4. **Test edge cases** - Empty strings, special characters, duplicates
5. **Index slug columns** - Add database indexes for performance
6. **Document API behavior** - Inform clients about auto-generation

## Performance Considerations

- **Database queries**: Optimized unique checks with single queries
- **Indexing**: Ensure `slug` columns have unique indexes
- **Caching**: Consider caching frequently used slugs
- **Batch operations**: Use `batchGenerateSlugs` for bulk updates

## Troubleshooting

### Issue: Slug conflicts during bulk import

**Solution:** Use `batchGenerateSlugs` which handles duplicates

### Issue: Special characters not handled

**Solution:** The utility removes accents and special chars automatically

### Issue: Update fails with "duplicate slug"

**Solution:** Ensure `excludeId` is passed to `handleSlug`

### Issue: Empty slug generated

**Solution:** Fallback creates random slug if title is empty

## Future Enhancements

- [ ] Redis caching for slug uniqueness checks
- [ ] Slug history/redirects for SEO
- [ ] Custom slug patterns per model
- [ ] Slug transliteration for multiple languages
- [ ] Analytics for slug usage
