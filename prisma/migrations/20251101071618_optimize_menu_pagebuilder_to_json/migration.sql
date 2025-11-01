/*
  Warnings:

  - You are about to drop the `Column` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Component` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `MenuItem` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Row` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Section` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[cacheKey]` on the table `Menu` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[cacheKey]` on the table `PageBuilder` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `items` to the `Menu` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `PageBuilder` table without a default value. This is not possible if the table is not empty.

*/

-- ============================================
-- STEP 1: Add new columns with temporary defaults
-- ============================================

-- Add new columns to Menu table with temporary defaults
ALTER TABLE "Menu" ADD COLUMN "cacheKey" TEXT;
ALTER TABLE "Menu" ADD COLUMN "items" JSONB DEFAULT '[]'::jsonb;
ALTER TABLE "Menu" ADD COLUMN "lastCached" TIMESTAMP(3);
ALTER TABLE "Menu" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;

-- Add new columns to PageBuilder table with temporary defaults
ALTER TABLE "PageBuilder" ADD COLUMN "cacheKey" TEXT;
ALTER TABLE "PageBuilder" ADD COLUMN "content" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE "PageBuilder" ADD COLUMN "draftContent" JSONB;
ALTER TABLE "PageBuilder" ADD COLUMN "isDraft" BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE "PageBuilder" ADD COLUMN "lastCached" TIMESTAMP(3);
ALTER TABLE "PageBuilder" ADD COLUMN "lastViewed" TIMESTAMP(3);
ALTER TABLE "PageBuilder" ADD COLUMN "publishedContent" JSONB;
ALTER TABLE "PageBuilder" ADD COLUMN "version" INTEGER NOT NULL DEFAULT 1;
ALTER TABLE "PageBuilder" ADD COLUMN "viewCount" INTEGER NOT NULL DEFAULT 0;

-- ============================================
-- STEP 2: Migrate MenuItem data to Menu.items JSON
-- ============================================

-- Build hierarchical menu structure and update Menu.items
UPDATE "Menu" m
SET items = (
  SELECT COALESCE(jsonb_agg(
    jsonb_build_object(
      'id', mi.id,
      'title', mi.title,
      'type', mi.type,
      'link', mi.link,
      'icon', mi.icon,
      'target', mi.target,
      'cssClass', mi."cssClass",
      'order', mi."order",
      'isPublished', mi."isPublished",
      'meta', mi.meta,
      'children', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', child.id,
            'title', child.title,
            'type', child.type,
            'link', child.link,
            'icon', child.icon,
            'target', child.target,
            'cssClass', child."cssClass",
            'order', child."order",
            'isPublished', child."isPublished",
            'meta', child.meta
          ) ORDER BY child."order"
        ), '[]'::jsonb)
        FROM "MenuItem" child
        WHERE child."parentId" = mi.id
      )
    ) ORDER BY mi."order"
  ), '[]'::jsonb)
  FROM "MenuItem" mi
  WHERE mi."menuId" = m.id AND mi."parentId" IS NULL
),
"cacheKey" = 'menu:' || m.slug || ':v1';

-- ============================================
-- STEP 3: Migrate PageBuilder relational data to JSON
-- ============================================

-- Build complete page structure and update PageBuilder.content
UPDATE "PageBuilder" pb
SET content = (
  SELECT COALESCE(jsonb_build_object(
    'sections', (
      SELECT COALESCE(jsonb_agg(
        jsonb_build_object(
          'id', s.id,
          'name', s.name,
          'order', s."order",
          'settings', s.settings,
          'rows', (
            SELECT COALESCE(jsonb_agg(
              jsonb_build_object(
                'id', r.id,
                'order', r."order",
                'settings', r.settings,
                'columns', (
                  SELECT COALESCE(jsonb_agg(
                    jsonb_build_object(
                      'id', col.id,
                      'width', col.width,
                      'order', col."order",
                      'settings', col.settings,
                      'components', (
                        SELECT COALESCE(jsonb_agg(
                          jsonb_build_object(
                            'id', comp.id,
                            'type', comp.type,
                            'order', comp."order",
                            'props', comp.props
                          ) ORDER BY comp."order"
                        ), '[]'::jsonb)
                        FROM "Component" comp
                        WHERE comp."columnId" = col.id
                      )
                    ) ORDER BY col."order"
                  ), '[]'::jsonb)
                  FROM "Column" col
                  WHERE col."rowId" = r.id
                )
              ) ORDER BY r."order"
            ), '[]'::jsonb)
            FROM "Row" r
            WHERE r."sectionId" = s.id
          )
        ) ORDER BY s."order"
      ), '[]'::jsonb)
      FROM "Section" s
      WHERE s."pageId" = pb.id
    )
  ), '{}'::jsonb)
),
"cacheKey" = 'page:' || pb.slug || ':v1',
"publishedContent" = CASE 
  WHEN pb."isPublished" = true THEN (
    SELECT jsonb_build_object(
      'sections', (
        SELECT COALESCE(jsonb_agg(
          jsonb_build_object(
            'id', s.id,
            'name', s.name,
            'order', s."order",
            'settings', s.settings,
            'rows', (
              SELECT COALESCE(jsonb_agg(
                jsonb_build_object(
                  'id', r.id,
                  'order', r."order",
                  'settings', r.settings,
                  'columns', (
                    SELECT COALESCE(jsonb_agg(
                      jsonb_build_object(
                        'id', col.id,
                        'width', col.width,
                        'order', col."order",
                        'settings', col.settings,
                        'components', (
                          SELECT COALESCE(jsonb_agg(
                            jsonb_build_object(
                              'id', comp.id,
                              'type', comp.type,
                              'order', comp."order",
                              'props', comp.props
                            ) ORDER BY comp."order"
                          ), '[]'::jsonb)
                          FROM "Component" comp
                          WHERE comp."columnId" = col.id
                        )
                      ) ORDER BY col."order"
                    ), '[]'::jsonb)
                    FROM "Column" col
                    WHERE col."rowId" = r.id
                  )
                ) ORDER BY r."order"
              ), '[]'::jsonb)
              FROM "Row" r
              WHERE r."sectionId" = s.id
            )
          ) ORDER BY s."order"
        ), '[]'::jsonb)
        FROM "Section" s
        WHERE s."pageId" = pb.id
      )
    )
  )
  ELSE NULL
END;

-- ============================================
-- STEP 4: Drop old foreign key constraints
-- ============================================

-- DropForeignKey
ALTER TABLE "public"."Column" DROP CONSTRAINT "Column_rowId_fkey";
ALTER TABLE "public"."Component" DROP CONSTRAINT "Component_columnId_fkey";
ALTER TABLE "public"."MenuItem" DROP CONSTRAINT "MenuItem_menuId_fkey";
ALTER TABLE "public"."MenuItem" DROP CONSTRAINT "MenuItem_parentId_fkey";
ALTER TABLE "public"."Row" DROP CONSTRAINT "Row_sectionId_fkey";
ALTER TABLE "public"."Section" DROP CONSTRAINT "Section_pageId_fkey";

-- ============================================
-- STEP 5: Make items and content NOT NULL
-- ============================================

-- Now that all data is migrated, remove defaults and set NOT NULL
ALTER TABLE "Menu" ALTER COLUMN "items" DROP DEFAULT;
ALTER TABLE "Menu" ALTER COLUMN "items" SET NOT NULL;

ALTER TABLE "PageBuilder" ALTER COLUMN "content" DROP DEFAULT;
ALTER TABLE "PageBuilder" ALTER COLUMN "content" SET NOT NULL;

-- DropTable
DROP TABLE "public"."Column";

-- DropTable
DROP TABLE "public"."Component";

-- DropTable
DROP TABLE "public"."MenuItem";

-- DropTable
DROP TABLE "public"."Row";

-- DropTable
DROP TABLE "public"."Section";

-- CreateIndex
CREATE UNIQUE INDEX "Menu_cacheKey_key" ON "Menu"("cacheKey");

-- CreateIndex
CREATE INDEX "Menu_isPublished_idx" ON "Menu"("isPublished");

-- CreateIndex
CREATE INDEX "Menu_cacheKey_idx" ON "Menu"("cacheKey");

-- CreateIndex
CREATE UNIQUE INDEX "PageBuilder_cacheKey_key" ON "PageBuilder"("cacheKey");

-- CreateIndex
CREATE INDEX "PageBuilder_isDraft_idx" ON "PageBuilder"("isDraft");

-- CreateIndex
CREATE INDEX "PageBuilder_cacheKey_idx" ON "PageBuilder"("cacheKey");

-- CreateIndex
CREATE INDEX "PageBuilder_publishedAt_idx" ON "PageBuilder"("publishedAt");
