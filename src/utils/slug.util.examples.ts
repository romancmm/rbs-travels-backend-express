/**
 * Slug Utility Usage Examples
 *
 * This file demonstrates how to use the slug utility throughout the application.
 * These are examples only - not meant to be executed directly.
 */

import prisma from './prisma'
import { generateSlug, handleSlug, isValidSlugFormat, purifySlug } from './slug.util'

// ============================================
// EXAMPLE 1: Basic Slug Generation
// ============================================

async function example1_basicGeneration() {
  // Generate slug from title
  const slug1 = generateSlug('Hello World')
  console.log(slug1) // Output: 'hello-world'

  const slug2 = generateSlug('Café São Paulo!!!')
  console.log(slug2) // Output: 'cafe-sao-paulo'

  const slug3 = generateSlug('   Multiple   Spaces   ')
  console.log(slug3) // Output: 'multiple-spaces'
}

// ============================================
// EXAMPLE 2: Creating New Records
// ============================================

async function example2_createNewPost() {
  // Scenario 1: Client doesn't provide slug - auto-generate
  const slug1 = await handleSlug('post', 'My First Blog Post')
  console.log(slug1) // Output: 'my-first-blog-post'

  // Scenario 2: Client provides clean slug - use it
  const slug2 = await handleSlug('post', 'My Second Post', 'custom-slug')
  console.log(slug2) // Output: 'custom-slug'

  // Scenario 3: Client provides messy slug - purify it
  const slug3 = await handleSlug('post', 'My Third Post', 'Custom Slug!!!')
  console.log(slug3) // Output: 'custom-slug'

  // Scenario 4: Duplicate slug - auto-suffix
  const slug4 = await handleSlug('post', 'Existing Post', 'existing-post')
  console.log(slug4) // Output: 'existing-post-2' (if 'existing-post' exists)
}

// ============================================
// EXAMPLE 3: Updating Existing Records
// ============================================

async function example3_updatePost(postId: string) {
  // Get existing post
  const existingPost = { id: postId, title: 'Old Title', slug: 'old-slug' }

  // Scenario 1: Update title only - regenerate slug from new title
  const newSlug1 = await handleSlug(
    'post',
    'New Title',
    undefined,
    existingPost.id // Exclude current record from uniqueness check
  )
  console.log(newSlug1) // Output: 'new-title'

  // Scenario 2: Update slug only - ensure uniqueness
  const newSlug2 = await handleSlug('post', existingPost.title, 'new-custom-slug', existingPost.id)
  console.log(newSlug2) // Output: 'new-custom-slug'

  // Scenario 3: Update both title and slug
  const newSlug3 = await handleSlug('post', 'Updated Title', 'updated-slug', existingPost.id)
  console.log(newSlug3) // Output: 'updated-slug'
}

// ============================================
// EXAMPLE 4: Validating Slug Format
// ============================================

function example4_validation() {
  // Valid slugs
  console.log(isValidSlugFormat('valid-slug-123')) // true
  console.log(isValidSlugFormat('my-blog-post')) // true
  console.log(isValidSlugFormat('abc')) // true

  // Invalid slugs
  console.log(isValidSlugFormat('Invalid Slug')) // false (uppercase, space)
  console.log(isValidSlugFormat('invalid_slug')) // false (underscore)
  console.log(isValidSlugFormat('-invalid-')) // false (leading/trailing hyphen)
  console.log(isValidSlugFormat('invalid--slug')) // false (double hyphen)
}

// ============================================
// EXAMPLE 5: Purifying User Input
// ============================================

function example5_purification() {
  // Purify messy input
  const clean1 = purifySlug('Hello World!!!')
  console.log(clean1) // Output: 'hello-world'

  const clean2 = purifySlug('Café_São_Paulo')
  console.log(clean2) // Output: 'cafe-sao-paulo'

  const clean3 = purifySlug('___invalid___')
  console.log(clean3) // Output: 'invalid'

  const clean4 = purifySlug('123-456-789')
  console.log(clean4) // Output: '123-456-789'
}

// ============================================
// EXAMPLE 6: Service Implementation
// ============================================

// Real-world service example
async function example6_serviceImplementation() {
  // In your service file (e.g., Post.service.ts)

  // CREATE
  const createPostService = async (data: any) => {
    // Handle slug automatically
    const slug = await handleSlug('post', data.title, data.slug)

    return await prisma.post.create({
      data: {
        ...data,
        slug, // Use the generated/purified slug
      },
    })
  }

  // UPDATE
  const updatePostService = async (id: string, data: any) => {
    let slug = data.slug

    // Only process slug if title or slug is being updated
    if (data.title || data.slug) {
      const existingPost = await prisma.post.findUnique({ where: { id } })
      if (!existingPost) throw new Error('Post not found')

      const title = data.title || existingPost.title
      slug = await handleSlug('post', title, data.slug, id)
    }

    return await prisma.post.update({
      where: { id },
      data: {
        ...data,
        ...(slug && { slug }), // Only update slug if it was processed
      },
    })
  }
}

// ============================================
// EXAMPLE 7: Different Models
// ============================================

async function example7_multipleModels() {
  // Works with any model that has a slug field
  const postSlug = await handleSlug('post', 'My Blog Post')
  const categorySlug = await handleSlug('category', 'Technology')
  const serviceSlug = await handleSlug('service', 'Web Development')
  const projectSlug = await handleSlug('project', 'Portfolio Website')
  const pageSlug = await handleSlug('page', 'About Us')
  const menuSlug = await handleSlug('menu', 'Main Menu')
  const menuItemSlug = await handleSlug('menuItem', 'Home')
  const pageBuilderSlug = await handleSlug('pageBuilder', 'Landing Page')

  console.log({
    postSlug, // 'my-blog-post'
    categorySlug, // 'technology'
    serviceSlug, // 'web-development'
    projectSlug, // 'portfolio-website'
    pageSlug, // 'about-us'
    menuSlug, // 'main-menu'
    menuItemSlug, // 'home'
    pageBuilderSlug, // 'landing-page'
  })
}

// ============================================
// EXAMPLE 8: API Request Examples
// ============================================

async function example8_apiRequests() {
  // Client-side API request examples

  // 1. Create without slug (auto-generate)
  await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'My Amazing Post',
      content: 'Content here...',
      // No slug provided - backend will generate: 'my-amazing-post'
    }),
  })

  // 2. Create with custom slug (will be purified)
  await fetch('/api/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'My Amazing Post',
      slug: 'Custom Slug!!!', // Backend will purify to: 'custom-slug'
      content: 'Content here...',
    }),
  })

  // 3. Update with new slug
  await fetch('/api/posts/123', {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      slug: 'updated-slug', // Backend will ensure uniqueness
    }),
  })
}

// ============================================
// EXAMPLE 9: Edge Cases
// ============================================

async function example9_edgeCases() {
  // Empty title - generates random slug
  const slug1 = await handleSlug('post', '')
  console.log(slug1) // Output: 'item-1234567890-abc123xyz'

  // Only special characters - generates random slug
  const slug2 = await handleSlug('post', '!!!???###')
  console.log(slug2) // Output: 'item-1234567890-abc123xyz'

  // Very long title - will be truncated in generation
  const slug3 = await handleSlug(
    'post',
    'This is a very long title that might exceed reasonable slug length limits'
  )
  console.log(slug3) // Output: 'this-is-a-very-long-title-that-might-exceed-reasonable-slug-length-limits'

  // Unicode characters
  const slug4 = await handleSlug('post', 'Привет мир')
  console.log(slug4) // Output: 'privet-mir' (transliterated)

  // Numbers and special chars mixed
  const slug5 = await handleSlug('post', '123-ABC-456-xyz')
  console.log(slug5) // Output: '123-abc-456-xyz'
}

// ============================================
// EXAMPLE 10: Batch Operations
// ============================================

async function example10_batchOperations() {
  // For migrations or bulk imports
  const items = [
    { id: '1', title: 'First Post' },
    { id: '2', title: 'Second Post' },
    { id: '3', title: 'Third Post' },
  ]

  // Generate slugs for all items
  for (const item of items) {
    const slug = await handleSlug('post', item.title, undefined, item.id)
    console.log(`${item.title} -> ${slug}`)
    // Update database with new slug
  }
}

export default {
  example1_basicGeneration,
  example2_createNewPost,
  example3_updatePost,
  example4_validation,
  example5_purification,
  example6_serviceImplementation,
  example7_multipleModels,
  example8_apiRequests,
  example9_edgeCases,
  example10_batchOperations,
}
