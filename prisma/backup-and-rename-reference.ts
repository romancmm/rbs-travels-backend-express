/**
 * Backup existing referenceId data and rename column
 * This script:
 * 1. Backs up referenceId values
 * 2. Renames column from referenceId to reference
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('🔄 Starting column rename migration...\n')

    // Step 1: Get all menu items with referenceId
    console.log('📊 Fetching current MenuItem data...')
    const items = await prisma.$queryRaw<
      Array<{
        id: string
        title: string
        referenceId: string | null
      }>
    >`
      SELECT id, title, "referenceId"
      FROM "MenuItem"
      WHERE "referenceId" IS NOT NULL
    `

    console.log(`Found ${items.length} menu items with referenceId:\n`)
    items.forEach((item) => {
      console.log(`  - ${item.title}: ${item.referenceId}`)
    })

    // Step 2: Rename column using raw SQL
    console.log('\n🔧 Renaming column from referenceId to reference...')
    await prisma.$executeRaw`
      ALTER TABLE "MenuItem" 
      RENAME COLUMN "referenceId" TO "reference"
    `

    console.log('✅ Column renamed successfully!')

    // Step 3: Update index
    console.log('\n🔧 Updating index name...')
    await prisma.$executeRaw`
      ALTER INDEX "MenuItem_referenceId_idx" 
      RENAME TO "MenuItem_reference_idx"
    `

    console.log('✅ Index renamed successfully!')

    // Step 4: Verify the changes
    console.log('\n✅ Verifying migrated data...')
    const verifyItems = await prisma.$queryRaw<
      Array<{
        id: string
        title: string
        reference: string | null
      }>
    >`
      SELECT id, title, reference
      FROM "MenuItem"
      WHERE reference IS NOT NULL
    `

    console.log(`Verified ${verifyItems.length} menu items with reference field:\n`)
    verifyItems.forEach((item) => {
      console.log(`  - ${item.title}: ${item.reference}`)
    })

    console.log('\n🎉 Migration completed successfully!')
  } catch (error) {
    console.error('❌ Migration failed:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
