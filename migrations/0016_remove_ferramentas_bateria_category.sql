-- Remove ferramentas-bateria category equipment from the public catalog.
UPDATE "equipment"
SET
  "deleted_at" = COALESCE("deleted_at", NOW()),
  "published" = false,
  "available" = false,
  "updated_at" = NOW()
WHERE "category" = 'ferramentas-bateria'
  AND "deleted_at" IS NULL;
