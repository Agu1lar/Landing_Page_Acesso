-- Ensure battery-line equipment stays archived (slug + legacy category).
UPDATE "equipment"
SET
  "deleted_at" = COALESCE("deleted_at", NOW()),
  "published" = false,
  "available" = false,
  "updated_at" = NOW()
WHERE (
    "slug" IN ('carregador', 'bateria')
    OR "category" = 'ferramentas-bateria'
  )
  AND "deleted_at" IS NULL;
