/*
  Warnings:

  - A unique constraint covering the columns `[slug]` on the table `MenuItem` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "slug" TEXT;

-- Populate slug field based on title (create URL-friendly slugs)
UPDATE "MenuItem" 
SET "slug" = lower(
  regexp_replace(
    regexp_replace(
      regexp_replace(title, '[^a-zA-Z0-9\s\-]', '', 'g'),
      '\s+', '-', 'g'
    ),
    '-+', '-', 'g'
  )
)
WHERE "slug" IS NULL;

-- Handle potential duplicates by appending ID suffix
UPDATE "MenuItem" 
SET "slug" = "slug" || '-' || substring(id, 1, 8)
WHERE id IN (
  SELECT id FROM (
    SELECT id, slug, 
           ROW_NUMBER() OVER (PARTITION BY slug ORDER BY "createdAt") as rn
    FROM "MenuItem"
  ) t WHERE rn > 1
);

-- CreateIndex
CREATE UNIQUE INDEX "MenuItem_slug_key" ON "MenuItem"("slug");

-- CreateIndex
CREATE INDEX "MenuItem_slug_idx" ON "MenuItem"("slug");
