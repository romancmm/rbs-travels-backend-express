# Quick Reference: JSON-based Menu & PageBuilder

## Menu JSON Structure

### Creating a Menu

```typescript
const menu = await prisma.menu.create({
  data: {
    name: 'Main Navigation',
    slug: 'main-nav',
    position: 'header',
    isPublished: true,
    items: [
      {
        id: 'home',
        title: 'Home',
        type: 'custom-link',
        link: '/',
        icon: 'home',
        target: '_self',
        order: 0,
        children: [],
      },
      {
        id: 'services',
        title: 'Services',
        type: 'custom-link',
        link: '/services',
        order: 1,
        children: [
          {
            id: 'web-dev',
            title: 'Web Development',
            type: 'custom-link',
            link: '/services/web-development',
            order: 0,
            children: [],
          },
          {
            id: 'mobile-dev',
            title: 'Mobile Development',
            type: 'custom-link',
            link: '/services/mobile-development',
            order: 1,
            children: [],
          },
        ],
      },
    ],
  },
})
```

### Fetching a Menu (Single Query!)

```typescript
// Old way (5+ queries with joins)
const menu = await prisma.menu.findUnique({
  where: { slug: 'main-nav' },
  include: {
    items: {
      include: {
        children: {
          include: {
            children: true, // Nested!
          },
        },
      },
    },
  },
})

// New way (1 query, no joins!)
const menu = await prisma.menu.findUnique({
  where: { slug: 'main-nav' },
})
// menu.items already contains the entire tree!
```

## PageBuilder JSON Structure

### Creating a Page

```typescript
const page = await prisma.pageBuilder.create({
  data: {
    title: 'Homepage',
    slug: 'home',
    description: 'Welcome to our website',
    content: {
      sections: [
        {
          id: 'hero-section',
          name: 'Hero',
          order: 0,
          settings: {
            backgroundColor: '#1a1a1a',
            backgroundImage: '/images/hero-bg.jpg',
            padding: '100px 0',
            minHeight: '600px',
          },
          rows: [
            {
              id: 'hero-row',
              order: 0,
              settings: {
                columnsGap: '40px',
                alignment: 'center',
              },
              columns: [
                {
                  id: 'hero-col-1',
                  width: 6,
                  order: 0,
                  settings: {
                    verticalAlign: 'middle',
                  },
                  components: [
                    {
                      id: 'hero-heading',
                      type: 'heading',
                      order: 0,
                      props: {
                        level: 1,
                        text: 'Welcome to Our Agency',
                        fontSize: '56px',
                        fontWeight: 'bold',
                        color: '#ffffff',
                      },
                    },
                    {
                      id: 'hero-text',
                      type: 'text',
                      order: 1,
                      props: {
                        content: 'We build amazing digital experiences',
                        fontSize: '20px',
                        color: '#cccccc',
                      },
                    },
                    {
                      id: 'hero-button',
                      type: 'button',
                      order: 2,
                      props: {
                        text: 'Get Started',
                        link: '/contact',
                        style: 'primary',
                        size: 'large',
                      },
                    },
                  ],
                },
                {
                  id: 'hero-col-2',
                  width: 6,
                  order: 1,
                  components: [
                    {
                      id: 'hero-image',
                      type: 'image',
                      order: 0,
                      props: {
                        src: '/images/hero-illustration.png',
                        alt: 'Hero illustration',
                        width: '100%',
                        height: 'auto',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'features-section',
          name: 'Features',
          order: 1,
          settings: {
            backgroundColor: '#ffffff',
            padding: '80px 0',
          },
          rows: [
            {
              id: 'features-row',
              order: 0,
              settings: {
                columnsGap: '30px',
              },
              columns: [
                {
                  id: 'feature-1',
                  width: 4,
                  order: 0,
                  components: [
                    {
                      id: 'feature-1-icon',
                      type: 'icon',
                      order: 0,
                      props: {
                        name: 'rocket',
                        size: '48px',
                        color: '#007bff',
                      },
                    },
                    {
                      id: 'feature-1-heading',
                      type: 'heading',
                      order: 1,
                      props: {
                        level: 3,
                        text: 'Fast Performance',
                        fontSize: '24px',
                      },
                    },
                    {
                      id: 'feature-1-text',
                      type: 'text',
                      order: 2,
                      props: {
                        content: 'Lightning-fast load times guaranteed',
                      },
                    },
                  ],
                },
                {
                  id: 'feature-2',
                  width: 4,
                  order: 1,
                  components: [
                    {
                      id: 'feature-2-icon',
                      type: 'icon',
                      order: 0,
                      props: {
                        name: 'shield',
                        size: '48px',
                        color: '#28a745',
                      },
                    },
                    {
                      id: 'feature-2-heading',
                      type: 'heading',
                      order: 1,
                      props: {
                        level: 3,
                        text: 'Secure',
                        fontSize: '24px',
                      },
                    },
                    {
                      id: 'feature-2-text',
                      type: 'text',
                      order: 2,
                      props: {
                        content: 'Enterprise-grade security',
                      },
                    },
                  ],
                },
                {
                  id: 'feature-3',
                  width: 4,
                  order: 2,
                  components: [
                    {
                      id: 'feature-3-icon',
                      type: 'icon',
                      order: 0,
                      props: {
                        name: 'users',
                        size: '48px',
                        color: '#ffc107',
                      },
                    },
                    {
                      id: 'feature-3-heading',
                      type: 'heading',
                      order: 1,
                      props: {
                        level: 3,
                        text: 'User Friendly',
                        fontSize: '24px',
                      },
                    },
                    {
                      id: 'feature-3-text',
                      type: 'text',
                      order: 2,
                      props: {
                        content: 'Intuitive and easy to use',
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    seo: {
      title: 'Home | Our Agency',
      description: 'Welcome to our agency - we build amazing digital experiences',
      keywords: ['agency', 'web development', 'design'],
      ogImage: '/images/og-home.jpg',
    },
    isPublished: true,
    publishedAt: new Date(),
  },
})
```

### Fetching a Page (Single Query!)

```typescript
// Old way (20+ queries!)
const page = await prisma.pageBuilder.findUnique({
  where: { slug: 'home' },
  include: {
    sections: {
      include: {
        rows: {
          include: {
            columns: {
              include: {
                components: true,
              },
            },
          },
        },
      },
    },
  },
})

// New way (1 query!)
const page = await prisma.pageBuilder.findUnique({
  where: { slug: 'home' },
})
// page.content already contains everything!
```

## Component Types Reference

### Available Component Types

```typescript
type ComponentType =
  | 'heading' // H1-H6 headings
  | 'text' // Paragraph text
  | 'rich-text' // HTML/Markdown content
  | 'image' // Single image
  | 'gallery' // Image gallery/slider
  | 'video' // Video embed
  | 'button' // CTA button
  | 'icon' // Icon/SVG
  | 'spacer' // Vertical spacing
  | 'divider' // Horizontal line
  | 'card' // Card component
  | 'list' // Bullet/numbered list
  | 'table' // Data table
  | 'form' // Form component
  | 'map' // Google Maps embed
  | 'code' // Code block
  | 'html' // Custom HTML
  | 'carousel' // Image carousel
  | 'accordion' // Collapsible sections
  | 'tabs' // Tab navigation
  | 'testimonial' // Review/testimonial
  | 'pricing-table' // Pricing plans
  | 'contact-form' // Contact form
  | 'newsletter' // Email subscription
  | 'social-icons' // Social media links
  | 'blog-grid' // Blog post grid
  | 'service-card' // Service showcase
  | 'project-card' // Project showcase
```

### Component Props Examples

```typescript
// Heading Component
{
  type: 'heading',
  props: {
    level: 1,                    // 1-6 (H1-H6)
    text: 'Page Title',
    fontSize: '48px',
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginBottom: '20px'
  }
}

// Image Component
{
  type: 'image',
  props: {
    src: '/images/photo.jpg',
    alt: 'Description',
    width: '100%',
    height: 'auto',
    objectFit: 'cover',
    borderRadius: '8px',
    link: '/gallery'             // Optional click link
  }
}

// Button Component
{
  type: 'button',
  props: {
    text: 'Learn More',
    link: '/about',
    style: 'primary',            // primary, secondary, outline
    size: 'medium',              // small, medium, large
    icon: 'arrow-right',
    fullWidth: false,
    openInNewTab: false
  }
}

// Gallery Component
{
  type: 'gallery',
  props: {
    images: [
      { src: '/img1.jpg', alt: 'Image 1' },
      { src: '/img2.jpg', alt: 'Image 2' }
    ],
    layout: 'grid',              // grid, masonry, slider
    columns: 3,
    gap: '15px',
    lightbox: true
  }
}

// Card Component
{
  type: 'card',
  props: {
    image: '/card-image.jpg',
    title: 'Card Title',
    description: 'Card description',
    link: '/read-more',
    buttonText: 'Read More',
    style: 'elevated'            // flat, elevated, outlined
  }
}
```

## API Endpoints Quick Reference

### Public Endpoints (No Auth Required)

```bash
# Get all published menus
GET /api/v1/menus

# Get menu by slug
GET /api/v1/menus/{slug}

# Get menu by position
GET /api/v1/menus/position/{position}

# Get all published pages
GET /api/v1/pages

# Get page by slug
GET /api/v1/pages/{slug}
```

### Admin Endpoints (Auth Required)

```bash
# Menus
GET    /api/v1/admin/menus
POST   /api/v1/admin/menus
GET    /api/v1/admin/menus/{id}
PUT    /api/v1/admin/menus/{id}
DELETE /api/v1/admin/menus/{id}
POST   /api/v1/admin/menus/{id}/duplicate

# Pages
GET    /api/v1/admin/pages
POST   /api/v1/admin/pages
GET    /api/v1/admin/pages/{id}
PUT    /api/v1/admin/pages/{id}
DELETE /api/v1/admin/pages/{id}
POST   /api/v1/admin/pages/{id}/duplicate
POST   /api/v1/admin/pages/{id}/publish
POST   /api/v1/admin/pages/{id}/unpublish
```

## Performance Tips

### 1. Use Select to Limit Fields

```typescript
// Don't load full content in list views
const pages = await prisma.pageBuilder.findMany({
  select: {
    id: true,
    title: true,
    slug: true,
    isPublished: true,
    // content: false  // Don't load heavy JSON
  },
})
```

### 2. Use Published Content Cache

```typescript
// For public pages, use cached version
const page = await prisma.pageBuilder.findUnique({
  where: { slug, isPublished: true },
  select: {
    publishedContent: true, // Pre-cached published version
    seo: true,
  },
})
```

### 3. Leverage Indexes

```sql
-- All these queries are indexed:
WHERE slug = 'home'           -- slug index
WHERE position = 'header'     -- position index
WHERE isPublished = true      -- isPublished index
WHERE cacheKey = 'page:home'  -- cacheKey index
```

### 4. Async View Tracking

```typescript
// Don't wait for view count update
incrementViewCount(pageId).catch(() => {})
// Continue returning response immediately
```

## Migration from Old Structure

### Before (Relational)

```typescript
// Required 5+ database queries
const menu = await prisma.menu.findUnique({
  where: { id },
  include: {
    items: {
      include: {
        children: true,
      },
    },
  },
})
```

### After (JSON)

```typescript
// Single database query
const menu = await prisma.menu.findUnique({
  where: { id },
})
// menu.items is already a complete tree!
```

---

**Ready to use!** The database schema is optimized and ready for high-performance CMS operations.
