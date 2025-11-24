/*
  Warnings:

  - You are about to drop the column `articleId` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `categoryId` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `link` on the `MenuItem` table. All the data in the column will be lost.
  - You are about to drop the column `pageId` on the `MenuItem` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "public"."MenuItem_articleId_idx";

-- DropIndex
DROP INDEX "public"."MenuItem_categoryId_idx";

-- DropIndex
DROP INDEX "public"."MenuItem_pageId_idx";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "articleId",
DROP COLUMN "categoryId",
DROP COLUMN "link",
DROP COLUMN "pageId",
ADD COLUMN     "reference" TEXT,
ADD COLUMN     "url" TEXT;

-- CreateIndex
CREATE INDEX "MenuItem_reference_idx" ON "MenuItem"("reference");

-- CreateIndex
CREATE INDEX "MenuItem_isPublished_idx" ON "MenuItem"("isPublished");
