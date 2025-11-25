import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixMenuItemReferences() {
  console.log('Starting to fix MenuItem reference fields...')

  try {
    // Get all menu items
    const items = await prisma.$queryRaw<any[]>`
      SELECT id, reference, type FROM "MenuItem"
    `

    console.log(`Found ${items.length} menu items to check`)

    let fixed = 0
    let skipped = 0
    let errors = 0

    for (const item of items) {
      try {
        const reference = item.reference

        // Skip if already null
        if (reference === null || reference === undefined) {
          skipped++
          continue
        }

        // Check if it's already valid JSON (object or array)
        if (typeof reference === 'object') {
          skipped++
          continue
        }

        // If it's a string, we need to convert it to proper JSON
        if (typeof reference === 'string') {
          let jsonValue: any

          // Try to parse if it looks like JSON
          if (reference.startsWith('[') || reference.startsWith('{')) {
            try {
              jsonValue = JSON.parse(reference)
            } catch {
              // If it fails, treat as plain string - wrap it
              jsonValue = reference
            }
          } else {
            // Plain string - keep as string (will be stored as JSON string)
            jsonValue = reference
          }

          // Update using raw query to handle Json type properly
          await prisma.$executeRaw`
            UPDATE "MenuItem" 
            SET reference = ${JSON.stringify(jsonValue)}::jsonb
            WHERE id = ${item.id}
          `

          console.log(`✓ Fixed item ${item.id}: "${reference}" -> ${JSON.stringify(jsonValue)}`)
          fixed++
        } else {
          console.log(`⚠ Skipped item ${item.id}: unexpected type ${typeof reference}`)
          skipped++
        }
      } catch (error: any) {
        console.error(`✗ Error fixing item ${item.id}:`, error.message)
        errors++
      }
    }

    console.log('\n=== Summary ===')
    console.log(`Fixed: ${fixed}`)
    console.log(`Skipped: ${skipped}`)
    console.log(`Errors: ${errors}`)
    console.log('Done!')
  } catch (error) {
    console.error('Fatal error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

fixMenuItemReferences()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
