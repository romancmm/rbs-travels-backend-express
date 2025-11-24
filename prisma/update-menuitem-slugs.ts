import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Utility script to regenerate slugs for menu items
 * Useful for fixing invalid slugs or regenerating from titles
 */

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

async function regenerateMenuItemSlugs() {
  console.log('🔄 Regenerating menu item slugs from titles...\n')

  const menuItems = await prisma.menuItem.findMany({
    select: {
      id: true,
      title: true,
      slug: true,
    },
  })

  console.log(`📝 Found ${menuItems.length} menu items to process\n`)

  for (const item of menuItems) {
    let newSlug = generateSlug(item.title)
    let counter = 1

    // Ensure unique slug (skip if it's already the current item's slug)
    while (true) {
      const existing = await prisma.menuItem.findUnique({ where: { slug: newSlug } })
      if (!existing || existing.id === item.id) {
        break
      }
      newSlug = `${generateSlug(item.title)}-${counter}`
      counter++
    }

    // Only update if slug changed
    if (newSlug !== item.slug) {
      await prisma.menuItem.update({
        where: { id: item.id },
        data: { slug: newSlug },
      })
      console.log(`✅ Updated: "${item.title}" → "${item.slug}" → "${newSlug}"`)
    } else {
      console.log(`⏭️  Skipped: "${item.title}" → "${item.slug}" (unchanged)`)
    }
  }

  console.log('\n✨ Slug regeneration completed!')
  await prisma.$disconnect()
}

// Run the script
regenerateMenuItemSlugs().catch((error) => {
  console.error('❌ Error:', error)
  process.exit(1)
})
