/*
  Warnings:

  - You are about to drop the column `references` on the `MenuItem` table. All the data in the column will be lost.
  - The `reference` column on the `MenuItem` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "public"."MenuItem_reference_idx";

-- AlterTable
ALTER TABLE "MenuItem" DROP COLUMN "references",
DROP COLUMN "reference",
ADD COLUMN     "reference" JSONB;

-- AlterTable
ALTER TABLE "_PostCategories" ADD CONSTRAINT "_PostCategories_AB_pkey" PRIMARY KEY ("A", "B");

-- DropIndex
DROP INDEX "public"."_PostCategories_AB_unique";
