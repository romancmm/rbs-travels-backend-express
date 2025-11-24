# Menu Item API Quick Reference

## 🎯 Menu Item Types

| Type       | Description          | Requires `referenceId` | Requires `url` | Example            |
| ---------- | -------------------- | :--------------------: | :------------: | ------------------ |
| `page`     | Page link            |           ✅           |       ❌       | About Us page      |
| `post`     | Article/Blog post    |           ✅           |       ❌       | Blog article       |
| `category` | Category page        |           ✅           |       ❌       | Travel category    |
| `service`  | Service page         |           ✅           |       ❌       | Web Development    |
| `project`  | Project page         |           ✅           |       ❌       | Portfolio item     |
| `custom`   | Custom internal link |           ❌           |       ✅       | /dashboard         |
| `external` | External link        |           ❌           |       ✅       | https://google.com |

## 📝 Create Menu Item

```bash
POST /admin/menu/{menuId}/items
```

### Page Link Example

```json
{
  "title": "About Us",
  "type": "page",
  "referenceId": "uuid-of-page",
  "order": 1
}
```

### External Link Example

```json
{
  "title": "Google",
  "type": "external",
  "url": "https://google.com",
  "target": "_blank",
  "order": 2
}
```

### Custom Link Example

```json
{
  "title": "Dashboard",
  "type": "custom",
  "url": "/dashboard",
  "order": 3
}
```

### Service Link Example

```json
{
  "title": "Web Development",
  "type": "service",
  "referenceId": "uuid-of-service",
  "icon": "🌐",
  "order": 4
}
```

## 🔄 Update Menu Item

```bash
PUT /admin/menu/{menuId}/items/{itemId}
```

```json
{
  "title": "Updated Title",
  "order": 5,
  "isPublished": false
}
```

## ❌ Delete Menu Item

```bash
DELETE /admin/menu/{menuId}/items/{itemId}
```

## 🔀 Reorder Menu Items

```bash
POST /admin/menu/{menuId}/reorder
```

```json
{
  "items": [
    { "id": "item-1-uuid", "order": 0 },
    { "id": "item-2-uuid", "order": 1 },
    { "id": "item-3-uuid", "order": 2 }
  ]
}
```

## 🌳 Nested Menu Items

### Create Child Item

```json
{
  "title": "Web Development",
  "type": "service",
  "referenceId": "service-uuid",
  "parentId": "parent-item-uuid",
  "order": 0
}
```

### Parent Item Structure

```json
{
  "title": "Services",
  "type": "custom",
  "url": null,
  "children": [
    {
      "title": "Web Development",
      "type": "service",
      "referenceId": "service-uuid"
    },
    {
      "title": "Mobile Apps",
      "type": "service",
      "referenceId": "another-service-uuid"
    }
  ]
}
```

## ⚠️ Validation Errors

### Missing `referenceId` for entity types

```json
{
  "error": "Reference ID is required for page type",
  "path": ["referenceId"]
}
```

### Missing `url` for custom/external types

```json
{
  "error": "URL is required for external type",
  "path": ["url"]
}
```

## 🎨 Optional Fields

| Field         | Type    | Default        | Description             |
| ------------- | ------- | -------------- | ----------------------- |
| `slug`        | string  | auto-generated | URL-friendly identifier |
| `icon`        | string  | null           | Icon class or emoji     |
| `target`      | enum    | `_self`        | `_self` or `_blank`     |
| `cssClass`    | string  | null           | Custom CSS classes      |
| `order`       | integer | 0              | Display order           |
| `isPublished` | boolean | true           | Visibility status       |
| `meta`        | object  | null           | Additional metadata     |

## 🚀 Common Patterns

### Dropdown Menu

```json
{
  "title": "Company",
  "type": "custom",
  "url": null,
  "children": [
    { "title": "About", "type": "page", "referenceId": "..." },
    { "title": "Team", "type": "page", "referenceId": "..." },
    { "title": "Contact", "type": "page", "referenceId": "..." }
  ]
}
```

### Social Links

```json
{
  "title": "Facebook",
  "type": "external",
  "url": "https://facebook.com/company",
  "icon": "fab fa-facebook",
  "target": "_blank"
}
```

### Category Filter

```json
{
  "title": "Travel Blog",
  "type": "category",
  "referenceId": "travel-category-uuid",
  "cssClass": "highlight"
}
```

## 📊 Response Format

```json
{
  "success": true,
  "message": "Menu item created successfully",
  "data": {
    "id": "uuid",
    "menuId": "menu-uuid",
    "title": "About Us",
    "slug": "about-us",
    "type": "page",
    "referenceId": "page-uuid",
    "url": "/about-us",
    "icon": null,
    "target": "_self",
    "cssClass": null,
    "parentId": null,
    "order": 1,
    "isPublished": true,
    "meta": null,
    "createdAt": "2025-11-24T...",
    "updatedAt": "2025-11-24T..."
  }
}
```

## 🔍 Get Menu with Items

```bash
GET /admin/menu/{menuId}
```

Returns full menu with nested items structure.

```bash
GET /menus/{slug}
```

Public API - returns cached menu with published items only.
