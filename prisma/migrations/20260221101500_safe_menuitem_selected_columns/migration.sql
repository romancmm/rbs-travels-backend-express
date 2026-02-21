-- Safe, idempotent MenuItem column migration
ALTER TABLE "MenuItem"
ADD COLUMN IF NOT EXISTS "bgImage" TEXT;

ALTER TABLE "MenuItem"
ADD COLUMN IF NOT EXISTS "showTitle" BOOLEAN;

ALTER TABLE "MenuItem"
ALTER COLUMN "showTitle" SET DEFAULT true;

UPDATE "MenuItem"
SET "showTitle" = true
WHERE "showTitle" IS NULL;

ALTER TABLE "MenuItem"
ALTER COLUMN "showTitle" SET NOT NULL;
