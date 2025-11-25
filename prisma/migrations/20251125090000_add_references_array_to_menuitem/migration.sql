-- AlterTable
ALTER TABLE "MenuItem" ADD COLUMN     "references" TEXT[] DEFAULT ARRAY[]::TEXT[];
