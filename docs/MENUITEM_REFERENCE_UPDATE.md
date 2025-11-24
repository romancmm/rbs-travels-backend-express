# MenuItem Reference Field Update - Quick Reference

## 🔄 Important Change: UUID → Slug

As of the latest update, MenuItem now uses **slug-based references** instead of UUID-based
references.

## Updated Field

| Old Field     | New Field   | Type             | Example      |
| ------------- | ----------- | ---------------- | ------------ |
| `referenceId` | `reference` | `string \| null` | `"about-us"` |

## Why This Change?

1. **Better UX**: Slugs are human-readable
2. **SEO**: Slugs are already URL-friendly
3. **Consistency**: All entities use slugs
4. **Easier Development**: No need to lookup UUIDs

## API Request Examples

### Before (UUID-based)

```json
{
  "title": "About Us",
  "type": "page",
  "referenceId": "5ae0cfd9-748d-478b-80be-35e82096fcf7"
}
```

### After (Slug-based) ✅

```json
{
  "title": "About Us",
  "type": "page",
  "reference": "about-us"
}
```

## Response Examples

### Before

```json
{
  "id": "...",
  "title": "About Us",
  "type": "page",
  "referenceId": "5ae0cfd9-748d-478b-80be-35e82096fcf7",
  "url": "/about-us"
}
```

### After ✅

```json
{
  "id": "...",
  "title": "About Us",
  "type": "page",
  "reference": "about-us",
  "url": "/about-us"
}
```

## Frontend Changes Required

### Form Inputs

**Old**:

```jsx
<Select name="referenceId" options={pages.map((p) => ({ value: p.id, label: p.title }))} />
```

**New** ✅:

```jsx
<Select name="reference" options={pages.map((p) => ({ value: p.slug, label: p.title }))} />
```

### API Calls

**Old**:

```typescript
fetch('/api/admin/menus/menu-id/items', {
  body: JSON.stringify({
    type: 'page',
    referenceId: selectedPage.id, // UUID
  }),
})
```

**New** ✅:

```typescript
fetch('/api/admin/menus/menu-id/items', {
  body: JSON.stringify({
    type: 'page',
    reference: selectedPage.slug, // Slug
  }),
})
```

## Validation Rules

| Type       | `reference` Required? | `url` Required? |
| ---------- | --------------------- | --------------- |
| `page`     | ✅ Yes (slug)         | No              |
| `post`     | ✅ Yes (slug)         | No              |
| `category` | ✅ Yes (slug)         | No              |
| `service`  | ✅ Yes (slug)         | No              |
| `project`  | ✅ Yes (slug)         | No              |
| `custom`   | No                    | ✅ Yes          |
| `external` | No                    | ✅ Yes          |

## Database Migration Status

✅ **Migration Complete**

- Column renamed: `referenceId` → `reference`
- Index updated: `MenuItem_referenceId_idx` → `MenuItem_reference_idx`
- Existing data converted from UUIDs to slugs
- Build passing (631 modules)

## Documentation

For complete details, see:

- **Migration Details**: `docs/SLUG_BASED_REFERENCE_MIGRATION.md`
- **Frontend Guide**: `docs/FRONTEND_INTEGRATION_GUIDE.md`
- **API Reference**: `docs/openapi/menu.admin.yaml`

---

**Note**: Historical documentation files (created before this change) may still reference
`referenceId`. Always use `reference` (slug-based) for new development.
