import { PrismaClient } from '@prisma/client'
import prisma from './prisma'

/**
 * Slug Utility - Comprehensive slug management system
 *
 * Features:
 * - Auto-generate slugs from titles
 * - Purify invalid characters
 * - Ensure uniqueness with auto-suffixing
 * - Support for custom slug validation
 */

/**
 * Generates a slug from a given text
 * Converts to lowercase, removes special characters, replaces spaces with hyphens
 */
export function generateSlug(text: string): string {
  return (
    text
      .toString()
      .toLowerCase()
      .trim()
      // Remove accents/diacritics
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      // Replace spaces with hyphens
      .replace(/\s+/g, '-')
      // Remove all non-alphanumeric characters except hyphens
      .replace(/[^a-z0-9-]/g, '')
      // Replace multiple hyphens with single hyphen
      .replace(/-+/g, '-')
      // Remove leading/trailing hyphens
      .replace(/^-+|-+$/g, '')
  )
}

/**
 * Purifies an existing slug to ensure it meets requirements
 * Same as generateSlug but used for client-provided slugs
 */
export function purifySlug(slug: string): string {
  return generateSlug(slug)
}

/**
 * Checks if a slug is unique for a given model
 */
export async function isSlugUnique(
  model: string,
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const modelName = model as keyof PrismaClient
  const prismaModel = prisma[modelName] as any

  if (!prismaModel) {
    throw new Error(`Model ${model} not found in Prisma schema`)
  }

  const where: any = { slug }

  // Exclude current record when updating
  if (excludeId) {
    where.id = { not: excludeId }
  }

  const count = await prismaModel.count({ where })
  return count === 0
}

/**
 * Generates a unique slug by adding numeric suffix if needed
 * Example: "my-slug" -> "my-slug-2" -> "my-slug-3"
 */
export async function ensureUniqueSlug(
  model: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> {
  let slug = baseSlug
  let counter = 1
  let isUnique = await isSlugUnique(model, slug, excludeId)

  while (!isUnique) {
    counter++
    slug = `${baseSlug}-${counter}`
    isUnique = await isSlugUnique(model, slug, excludeId)
  }

  return slug
}

/**
 * Main slug handler - handles all slug operations
 *
 * @param model - Prisma model name (e.g., "post", "category")
 * @param title - Source text to generate slug from (if slug not provided)
 * @param providedSlug - Optional slug provided by client
 * @param excludeId - ID to exclude when checking uniqueness (for updates)
 * @returns Unique, purified slug
 */
export async function handleSlug(
  model: string,
  title: string,
  providedSlug?: string,
  excludeId?: string
): Promise<string> {
  // Step 1: Determine base slug
  let slug: string

  if (providedSlug && providedSlug.trim()) {
    // Client provided a slug - purify it
    slug = purifySlug(providedSlug)
  } else {
    // Generate from title
    slug = generateSlug(title)
  }

  // Step 2: Ensure slug is not empty
  if (!slug) {
    // Fallback to random string if generation fails
    slug = `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  }

  // Step 3: Ensure uniqueness with auto-suffixing
  slug = await ensureUniqueSlug(model, slug, excludeId)

  return slug
}

/**
 * Validates slug format without checking database
 * Returns true if slug matches valid pattern
 */
export function isValidSlugFormat(slug: string): boolean {
  // Valid slug: lowercase alphanumeric with hyphens, no leading/trailing hyphens
  const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
  return slugPattern.test(slug)
}

/**
 * Regenerates a slug from title (useful for bulk operations)
 */
export async function regenerateSlug(
  model: string,
  title: string,
  currentId?: string
): Promise<string> {
  const newSlug = generateSlug(title)
  return ensureUniqueSlug(model, newSlug, currentId)
}

/**
 * Batch slug generation for seeding or migrations
 */
export async function batchGenerateSlugs(
  model: string,
  items: Array<{ id: string; title: string; slug?: string }>
): Promise<Array<{ id: string; slug: string }>> {
  const results: Array<{ id: string; slug: string }> = []

  for (const item of items) {
    const slug = await handleSlug(model, item.title, item.slug, item.id)
    results.push({ id: item.id, slug })
  }

  return results
}
