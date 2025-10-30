/*
  Warnings:

  - You are about to drop the column `thumbnail` on the `Post` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Post" DROP COLUMN "thumbnail",
ADD COLUMN     "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "seo" JSONB,
ADD COLUMN     "thumbnail" TEXT;
