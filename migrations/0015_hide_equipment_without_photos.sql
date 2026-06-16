-- Hide catalog items without photos from the public site.
UPDATE "equipment"
SET
  "published" = false,
  "available" = false,
  "updated_at" = NOW()
WHERE "slug" IN ('carregador', 'bateria', 'rodape-de-0-20-x-3-00-m')
  AND "deleted_at" IS NULL;
