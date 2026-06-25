-- Remove discontinued andaime components from the public catalog.
UPDATE "equipment"
SET
  "deleted_at" = COALESCE("deleted_at", NOW()),
  "published" = false,
  "available" = false,
  "updated_at" = NOW(),
  "updated_by" = 'migration-0019'
WHERE "slug" IN (
  'chave-de-catraca-7-8',
  'degrau-de-escada'
)
AND "deleted_at" IS NULL;
