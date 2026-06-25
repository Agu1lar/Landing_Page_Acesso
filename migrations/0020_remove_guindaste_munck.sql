-- Remove discontinued Guindaste Munck from the public catalog.
UPDATE "equipment"
SET
  "deleted_at" = COALESCE("deleted_at", NOW()),
  "published" = false,
  "available" = false,
  "updated_at" = NOW(),
  "updated_by" = 'migration-0020'
WHERE "slug" = 'guindaste-industrial-munck-remocao-bh'
AND "deleted_at" IS NULL;
