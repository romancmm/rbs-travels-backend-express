# OpenAPI Path Prefix Fix

## Problem

Swagger documentation was generating incorrect URLs with duplicate `/api/` segments:

- ❌ `http://localhost:4000/api/v1/api/pages`
- ❌ `http://localhost:4000/api/v1/api/menus`

Instead of correct URLs:

- ✅ `http://localhost:4000/api/v1/pages`
- ✅ `http://localhost:4000/api/v1/menus`

## Root Cause

OpenAPI YAML files had absolute paths including `/api/v1/` prefix:

```yaml
# ❌ WRONG
paths:
  /api/v1/menus:
    get: ...
  /api/menus/{identifier}: # Mixed - some had /api/, some didn't
    get: ...
```

But the base server URL already includes `/api/v1`:

```yaml
# base.yaml
servers:
  - url: /api/v1
```

This caused paths to be concatenated: `/api/v1` + `/api/menus` = `/api/v1/api/menus` ❌

## Solution

Removed all `/api/v1/` and `/api/` prefixes from paths in OpenAPI YAML files:

```yaml
# ✅ CORRECT
paths:
  /menus:
    get: ...
  /menus/{identifier}:
    get: ...
```

Now paths correctly concatenate: `/api/v1` + `/menus` = `/api/v1/menus` ✅

## Files Fixed

All OpenAPI YAML files in `docs/openapi/`:

- ✅ `menu.public.yaml` - Changed `/api/menus/{identifier}` → `/menus/{identifier}`
- ✅ `page-builder.public.yaml` - Changed `/api/pages/{identifier}` → `/pages/{identifier}`
- ✅ `profile.admin.yaml` - Changed `/api/v1/admin/profile` → `/admin/profile`
- ✅ `profile.customer.yaml` - Changed `/api/v1/customer/profile` → `/customer/profile`
- ✅ All other YAML files checked and corrected

## Command Used

```bash
cd docs/openapi
sed -i '' 's|^  /api/v1/|  /|g' *.yaml
```

This removes `/api/v1/` prefix from all path definitions.

## Verification

### Before Fix

```
GET http://localhost:4000/api/v1/api/menus     ❌ 404 Not Found
GET http://localhost:4000/api/v1/api/pages     ❌ 404 Not Found
```

### After Fix

```
GET http://localhost:4000/api/v1/menus         ✅ 200 OK
GET http://localhost:4000/api/v1/pages         ✅ 200 OK
```

## Best Practice

### OpenAPI Path Definition Rules

1. **Never include the base URL in paths**

   ```yaml
   # ❌ WRONG
   paths:
     /api/v1/menus:

   # ✅ CORRECT
   paths:
     /menus:
   ```

2. **Paths are relative to server URL**

   ```yaml
   servers:
     - url: /api/v1

   paths:
     /menus: # Results in: /api/v1/menus
     /pages: # Results in: /api/v1/pages
   ```

3. **Use consistent path style**
   - Public endpoints: `/menus`, `/pages`, `/blog`
   - Admin endpoints: `/admin/menu`, `/admin/pages`, `/admin/blog`

## Testing Swagger UI

After restarting the server:

1. Visit `http://localhost:4000/docs`
2. Try any public endpoint (e.g., GET /menus)
3. Click "Try it out" → "Execute"
4. Verify the request URL is correct: `/api/v1/menus` (not `/api/v1/api/menus`)

## Notes

- If changes don't appear immediately, restart the development server
- The OpenAPI spec is built at server startup from all YAML files
- Changes to YAML files require server restart to take effect

---

**Fixed**: November 1, 2025  
**Issue**: Duplicate `/api/` prefix in Swagger-generated URLs  
**Status**: ✅ Resolved
