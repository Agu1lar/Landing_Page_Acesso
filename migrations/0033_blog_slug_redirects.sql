CREATE TABLE IF NOT EXISTS "blog_slug_redirects" (
  "id" serial PRIMARY KEY NOT NULL,
  "from_slug" varchar(120) NOT NULL UNIQUE,
  "to_slug" varchar(120) NOT NULL,
  "article_id" integer,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "blog_slug_redirects_to_slug_idx" ON "blog_slug_redirects" ("to_slug");
