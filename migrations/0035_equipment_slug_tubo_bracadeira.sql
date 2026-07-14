CREATE TABLE IF NOT EXISTS "equipment_slug_redirects" (
  "id" serial PRIMARY KEY NOT NULL,
  "from_slug" varchar(120) NOT NULL UNIQUE,
  "to_slug" varchar(120) NOT NULL,
  "equipment_id" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "blog_slug_redirects" (
  "id" serial PRIMARY KEY NOT NULL,
  "from_slug" varchar(120) NOT NULL UNIQUE,
  "to_slug" varchar(120) NOT NULL,
  "article_id" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

-- Rename mistyped catalog slug (was "diagonal 1,00", now tubo e braçadeira)
UPDATE "equipment"
SET "slug" = 'andaime-tipo-tubo-e-bracadeira'
WHERE "slug" = 'diagonal-1-00'
  AND NOT EXISTS (
    SELECT 1 FROM "equipment" WHERE "slug" = 'andaime-tipo-tubo-e-bracadeira'
  );

INSERT INTO "equipment_slug_redirects" ("from_slug", "to_slug", "equipment_id")
SELECT
  'diagonal-1-00',
  'andaime-tipo-tubo-e-bracadeira',
  e.id
FROM "equipment" e
WHERE e.slug = 'andaime-tipo-tubo-e-bracadeira'
ON CONFLICT ("from_slug") DO UPDATE
SET
  "to_slug" = EXCLUDED."to_slug",
  "equipment_id" = EXCLUDED."equipment_id",
  "created_at" = now();
