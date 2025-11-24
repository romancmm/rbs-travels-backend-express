import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Migration script to convert old MenuItem structure to new generic structure
 * Old: separate fields (categoryId, pageId, articleId, link)
 * New: generic fields (type, referenceId, url)
 */
async function migrateMenuItemStructure() {
  console.log('🔄 Starting MenuItem structure migration...\n')

  try {
    // Fetch all menu items from the database
    const menuItems = await prisma.$queryRaw<any[]>`
      SELECT 
        id, "menuId", title, slug, type, link, 
        "categoryId", "pageId", "articleId",
        icon, target, "cssClass", "parentId", "order",
        "isPublished", meta, "createdAt", "updatedAt"
      FROM "MenuItem"
    `

    console.log(`📝 Found ${menuItems.length} menu items to migrate\n`)

    for (const item of menuItems) {
      let url: string | null = null
      let referenceId: string | null = null
      let newType = 'custom'

      // Determine the new structure based on old fields
      if (item.categoryId) {
        referenceId = item.categoryId
        newType = 'category'
        console.log(`✓ ${item.title}: Category → ${referenceId}`)
      } else if (item.pageId) {
        referenceId = item.pageId
        newType = 'page'
        console.log(`✓ ${item.title}: Page → ${referenceId}`)
      } else if (item.articleId) {
        referenceId = item.articleId
        newType = 'post'
        console.log(`✓ ${item.title}: Post → ${referenceId}`)
      } else if (item.link) {
        url = item.link
        newType = item.link.startsWith('http') ? 'external' : 'custom'
        console.log(`✓ ${item.title}: ${newType} → ${url}`)
      } else {
        // Custom/parent menu item
        newType = 'custom'
        console.log(`✓ ${item.title}: Custom menu item`)
      }

      // Update with new structure
      await prisma.$executeRaw`
        UPDATE "MenuItem"
        SET 
          type = ${newType},
          url = ${url},
          "referenceId" = ${referenceId}
        WHERE id = ${item.id}
      `
    }

    console.log('\n✨ Migration completed successfully!')
    console.log('\n📊 Summary:')
    console.log('   - Old fields (categoryId, pageId, articleId, link) can now be removed')
    console.log('   - New fields (type, referenceId, url) populated')
    console.log('   - Generic polymorphic pattern implemented')
  } catch (error) {
    console.error('\n❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateMenuItemStructure()
