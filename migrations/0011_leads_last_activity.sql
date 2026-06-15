ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "last_activity_at" timestamp;

UPDATE "leads" SET "last_activity_at" = "created_at" WHERE "last_activity_at" IS NULL;
