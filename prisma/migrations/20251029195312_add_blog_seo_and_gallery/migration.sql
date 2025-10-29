/*
  Warnings:

  - You are about to drop the column `featuredImage` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "featuredImage",
ADD COLUMN     "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "seo" JSONB,
ADD COLUMN     "thumbnail" TEXT;
