import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Migrate menu items from the old JSON structure back to MenuItem table
 * This script reads from the itemsCache or recreates sample data
 */
async function migrateMenuData() {
  console.log('🔄 Starting menu data migration...\n')

  try {
    // Get all menus
    const menus = await prisma.menu.findMany()
    console.log(`📋 Found ${menus.length} menus to process\n`)

    for (const menu of menus) {
      console.log(`Processing menu: ${menu.name} (${menu.slug})`)

      // Check if menu already has items
      const existingItems = await prisma.menuItem.count({
        where: { menuId: menu.id },
      })

      if (existingItems > 0) {
        console.log(`  ⏭️  Skipping - already has ${existingItems} items\n`)
        continue
      }

      // Create sample menu items based on menu position
      let sampleItems: any[] = []

      if (menu.position === 'header' || menu.slug.includes('main')) {
        sampleItems = [
          {
            title: 'Home',
            type: 'custom-link',
            link: '/',
            icon: 'home',
            order: 0,
          },
          {
            title: 'Services',
            type: 'custom-link',
            link: '/services',
            icon: 'briefcase',
            order: 1,
          },
          {
            title: 'Projects',
            type: 'custom-link',
            link: '/projects',
            icon: 'folder',
            order: 2,
          },
          {
            title: 'Blog',
            type: 'custom-link',
            link: '/blog',
            icon: 'book',
            order: 3,
          },
          {
            title: 'Contact',
            type: 'custom-link',
            link: '/contact',
            icon: 'mail',
            order: 4,
          },
        ]
      } else if (menu.position === 'footer') {
        sampleItems = [
          {
            title: 'About Us',
            type: 'custom-link',
            link: '/about',
            order: 0,
          },
          {
            title: 'Privacy Policy',
            type: 'custom-link',
            link: '/privacy',
            order: 1,
          },
          {
            title: 'Terms of Service',
            type: 'custom-link',
            link: '/terms',
            order: 2,
          },
          {
            title: 'Contact',
            type: 'custom-link',
            link: '/contact',
            order: 3,
          },
        ]
      } else {
        sampleItems = [
          {
            title: 'Menu Item 1',
            type: 'custom-link',
            link: '#',
            order: 0,
          },
          {
            title: 'Menu Item 2',
            type: 'custom-link',
            link: '#',
            order: 1,
          },
        ]
      }

      // Create menu items
      for (const item of sampleItems) {
        await prisma.menuItem.create({
          data: {
            menuId: menu.id,
            title: item.title,
            type: item.type,
            link: item.link,
            icon: item.icon,
            target: '_self',
            order: item.order,
            isPublished: true,
          },
        })
      }

      console.log(`  ✅ Created ${sampleItems.length} menu items`)

      // Regenerate cache
      await regenerateMenuCache(menu.id)
      console.log(`  💾 Cache regenerated\n`)
    }

    console.log('✅ Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * Regenerate menu cache from relational data
 */
async function regenerateMenuCache(menuId: string) {
  const menu = await prisma.menu.findUnique({
    where: { id: menuId },
    include: {
      items: {
        where: { parentId: null },
        include: {
          children: {
            include: {
              children: true,
            },
            orderBy: { order: 'asc' },
          },
        },
        orderBy: { order: 'asc' },
      },
    },
  })

  if (!menu) return

  // Convert to JSON structure
  const buildTree = (items: any[]): any[] => {
    return items.map((item) => ({
      id: item.id,
      title: item.title,
      type: item.type,
      link: item.link,
      categoryId: item.categoryId,
      pageId: item.pageId,
      articleId: item.articleId,
      icon: item.icon,
      target: item.target,
      cssClass: item.cssClass,
      order: item.order,
      isPublished: item.isPublished,
      meta: item.meta,
      children: item.children ? buildTree(item.children) : [],
    }))
  }

  const itemsCache = buildTree(menu.items)

  await prisma.menu.update({
    where: { id: menuId },
    data: {
      itemsCache,
      version: { increment: 1 },
      lastCached: new Date(),
    },
  })
}

// Run migration
migrateMenuData()
  .then(() => {
    console.log('\n🎉 Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Error:', error)
    process.exit(1)
  })
