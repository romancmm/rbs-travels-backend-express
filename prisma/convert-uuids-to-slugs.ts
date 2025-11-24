/**
 * Convert UUID-based references to slug-based references
 * This script looks up the slug for each referenced entity and updates the MenuItem
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔄 Converting UUID references to slug references...\n')

    // Get all menu items with reference values
    const menuItems = await prisma.menuItem.findMany({
      where: {
        reference: {
          not: null,
        },
      },
      select: {
        id: true,
        title: true,
        type: true,
        reference: true,
      },
    })

    console.log(`Found ${menuItems.length} menu items to convert:\n`)

    for (const item of menuItems) {
      console.log(`Processing: ${item.title} (${item.type})`)
      console.log(`  Current reference (UUID): ${item.reference}`)

      let slug: string | null = null

      try {
        // Look up the slug based on type
        switch (item.type) {
          case 'page': {
            const page = await prisma.page.findUnique({
              where: { id: item.reference! },
              select: { slug: true },
            })
            slug = page?.slug || null
            break
          }
          case 'post': {
            const post = await prisma.post.findUnique({
              where: { id: item.reference! },
              select: { slug: true },
            })
            slug = post?.slug || null
            break
          }
          case 'category': {
            const category = await prisma.category.findUnique({
              where: { id: item.reference! },
              select: { slug: true },
            })
            slug = category?.slug || null
            break
          }
          case 'service': {
            const service = await prisma.service.findUnique({
              where: { id: item.reference! },
              select: { slug: true },
            })
            slug = service?.slug || null
            break
          }
          case 'project': {
            const project = await prisma.project.findUnique({
              where: { id: item.reference! },
              select: { slug: true },
            })
            slug = project?.slug || null
            break
          }
          default:
            console.log(`  ⚠️  Unknown type: ${item.type}`)
            continue
        }

        if (slug) {
          // Update the menu item with the slug
          await prisma.menuItem.update({
            where: { id: item.id },
            data: { reference: slug },
          })
          console.log(`  ✅ Updated to slug: ${slug}`)
        } else {
          console.log(`  ⚠️  Could not find ${item.type} with ID: ${item.reference}`)
          console.log(`  ℹ️  Setting reference to null`)
          await prisma.menuItem.update({
            where: { id: item.id },
            data: { reference: null },
          })
        }
      } catch (error) {
        console.error(`  ❌ Error processing item: ${error}`)
      }

      console.log()
    }

    // Verify the results
    console.log('\n✅ Verifying converted data...')
    const updatedItems = await prisma.menuItem.findMany({
      where: {
        reference: {
          not: null,
        },
      },
      select: {
        title: true,
        type: true,
        reference: true,
      },
    })

    console.log(`\nFinal state (${updatedItems.length} items with references):\n`)
    updatedItems.forEach((item) => {
      console.log(`  - ${item.title} (${item.type}): ${item.reference}`)
    })

    console.log('\n🎉 Conversion completed successfully!')
  } catch (error) {
    console.error('❌ Conversion failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
