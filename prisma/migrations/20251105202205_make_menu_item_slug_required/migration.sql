/*
  Warnings:

  - Made the column `slug` on table `MenuItem` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "MenuItem" ALTER COLUMN "slug" SET NOT NULL;
