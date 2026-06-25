-- Remove discontinued andaime components from the public catalog.
UPDATE "equipment"
SET
  "deleted_at" = COALESCE("deleted_at", NOW()),
  "published" = false,
  "available" = false,
  "updated_at" = NOW(),
  "updated_by" = 'migration-0018'
WHERE "slug" IN (
  'arco-fechado',
  'arco-p-escada',
  'luva-de-uniao',
  'parafuso-enxerto'
)
AND "deleted_at" IS NULL;
