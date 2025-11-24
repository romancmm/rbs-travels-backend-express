# MenuItem Slug-Based Reference Migration - Complete

## Overview

Successfully migrated MenuItem from UUID-based `referenceId` to slug-based `reference` field for
better client-side usability and SEO.

## Changes Made

### 1. Database Schema (`prisma/schema.prisma`)

- **Changed Field**: `referenceId String?` → `reference String?`
- **Updated Comment**: "Slug of referenced entity (page, post, category, etc.)"
- **Updated Index**: `@@index([referenceId])` → `@@index([reference])`

### 2. Validators (`src/validators/menu.validator.ts`)

Updated all three validation schemas:

- `menuItemSchema` - Base schema for MenuItem
- `createMenuItemBodySchema` - For creating menu items
- `updateMenuItemBodySchema` - For updating menu items

**Changes**:

- Removed UUID validation: `z.string().uuid()` → `z.string()`
- Updated field name: `referenceId` → `reference`
- Updated error messages: "Reference ID is required" → "Reference (slug) is required"

### 3. Service Layer (`src/services/menu/menu.service.ts`)

Updated methods:

- `addMenuItem()` - Now accepts `reference: string?` instead of `referenceId`
- `updateMenuItem()` - Updated to use `reference` field
- `duplicateMenu()` - Clones menu items with `reference` field
- `buildTree()` in `regenerateCache()` - Updated to include `reference` in cached menu structure

### 4. TypeScript Types (`src/types/menu.types.ts`)

Updated interfaces:

- `MenuItem` - Changed `referenceId: string | null` → `reference: string | null`
- `CreateMenuItemInput` - Updated to use `reference` field
- `UpdateMenuItemInput` - Updated to use `reference` field
- `validateMenuItem()` - Updated validation logic
- `getMenuItemUrl()` - Enhanced to build URLs from slugs

### 5. API Documentation (`docs/openapi/menu.admin.yaml`)

- Updated `MenuItem` schema to use `reference` (slug)
- Updated `CreateMenuItem` schema
- Changed example values from UUIDs to slugs (e.g., "about-us")
- Updated descriptions to reflect slug-based references

## Database Migration

### Step 1: Column Rename

**Script**: `prisma/backup-and-rename-reference.ts`

- Backed up existing `referenceId` data (3 items)
- Renamed column: `referenceId` → `reference`
- Renamed index: `MenuItem_referenceId_idx` → `MenuItem_reference_idx`

### Step 2: UUID to Slug Conversion

**Script**: `prisma/convert-uuids-to-slugs.ts`

- Converted UUID references to slugs by looking up referenced entities
- Successfully converted 1 post reference: `e21f67cc-...` → `velit-eum-id-nobis`
- Nullified 2 page references (pages not found in database)

**Results**:

```
- "Nulla exercitationem" (post) → slug: "velit-eum-id-nobis" ✅
- "Totam id doloremque" (page) → null (page not found)
- "About" (page) → null (page not found)
```

### Step 3: Prisma Client Regeneration

Ran `bun prisma generate` to update Prisma Client with new schema.

## Benefits of Slug-Based References

### 1. **Better Developer Experience**

- Slugs are human-readable: `"about-us"` vs `"5ae0cfd9-748d-478b-80be-35e82096fcf7"`
- Easier to debug and test
- More meaningful in logs and error messages

### 2. **SEO Friendly**

- Slugs are already SEO-optimized
- Consistent with URL structure
- Better for public-facing APIs

### 3. **Client-Side Friendly**

- Easier to work with in forms
- No need to look up UUIDs
- Can be typed directly by developers

### 4. **Consistency**

- All entity models (Page, Post, Category, Service, Project) use slugs
- Unified approach across the application

## Validation Rules

Entity types (`page`, `post`, `category`, `service`, `project`):

- **Require**: `reference` (slug)
- **Optional**: `url` (will be generated)

URL types (`custom`, `external`):

- **Require**: `url`
- **Optional**: `reference` (not used)

## API Examples

### Create Menu Item (Page)

```json
{
  "title": "About Us",
  "type": "page",
  "reference": "about-us" // Slug instead of UUID
}
```

### Create Menu Item (Post)

```json
{
  "title": "Latest Blog",
  "type": "post",
  "reference": "my-latest-blog-post" // Slug instead of UUID
}
```

### Create Menu Item (External)

```json
{
  "title": "Google",
  "type": "external",
  "url": "https://google.com"
}
```

## Build Status

✅ **Build Successful**

- Bundled 631 modules
- Output: 2.89 MB
- No TypeScript errors

## Testing Recommendations

1. **Test Menu Item Creation**

   - Create items with entity references using slugs
   - Verify validation works correctly

2. **Test Menu Item Updates**

   - Update references to new slugs
   - Test switching between types

3. **Test Menu Rendering**

   - Verify menu items display correctly
   - Check URL generation works with slugs

4. **Test Invalid Slugs**
   - Try creating items with non-existent slugs
   - Verify error handling

## Frontend Integration

Frontend developers should:

1. Update form fields to accept slugs instead of UUIDs
2. Use autocomplete/search for entity selection
3. Display slug values in UI instead of UUIDs
4. Update validation to match backend requirements

See `docs/FRONTEND_INTEGRATION_GUIDE.md` for detailed examples.

## Migration Scripts

Both migration scripts are preserved in `prisma/` directory:

- `backup-and-rename-reference.ts` - Column rename
- `convert-uuids-to-slugs.ts` - UUID to slug conversion

These can be referenced for future migrations or rollback procedures.

## Rollback Procedure (If Needed)

To rollback to UUID-based references:

1. Create reverse migration script
2. Convert slugs back to UUIDs (lookup by slug)
3. Rename column: `reference` → `referenceId`
4. Update schema, validators, services, types
5. Regenerate Prisma Client
6. Update OpenAPI docs

## Summary

✅ All code updated to use slug-based `reference` field  
✅ Database migrated successfully  
✅ Data converted from UUIDs to slugs  
✅ Prisma Client regenerated  
✅ Build passing (631 modules)  
✅ API documentation updated  
✅ Migration scripts preserved

The MenuItem system is now using slug-based references throughout the application, providing better
developer experience and SEO-friendly URLs.
