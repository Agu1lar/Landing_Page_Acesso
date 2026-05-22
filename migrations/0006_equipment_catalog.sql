CREATE TABLE IF NOT EXISTS "equipment" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" varchar(120) NOT NULL UNIQUE,
  "name" varchar(300) NOT NULL,
  "category" varchar(80) NOT NULL,
  "short_description" text NOT NULL,
  "long_description" text DEFAULT '' NOT NULL,
  "specs" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "featured" boolean DEFAULT false NOT NULL,
  "available" boolean DEFAULT true NOT NULL,
  "published" boolean DEFAULT true NOT NULL,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "updated_by" varchar(120)
);

CREATE TABLE IF NOT EXISTS "equipment_images" (
  "id" serial PRIMARY KEY NOT NULL,
  "equipment_id" integer NOT NULL REFERENCES "equipment"("id") ON DELETE CASCADE,
  "url" varchar(500) NOT NULL,
  "alt" varchar(300),
  "sort_order" integer DEFAULT 0 NOT NULL,
  "is_primary" boolean DEFAULT false NOT NULL
);

CREATE INDEX IF NOT EXISTS "equipment_category_idx" ON "equipment" ("category");
CREATE INDEX IF NOT EXISTS "equipment_deleted_at_idx" ON "equipment" ("deleted_at");
CREATE INDEX IF NOT EXISTS "equipment_images_equipment_id_idx" ON "equipment_images" ("equipment_id");

CREATE TABLE IF NOT EXISTS "admin_activity" (
  "id" serial PRIMARY KEY NOT NULL,
  "user_id" varchar(120) NOT NULL,
  "action" varchar(80) NOT NULL,
  "entity_type" varchar(40) NOT NULL,
  "entity_slug" varchar(120),
  "details" text,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "analytics_daily" (
  "date" date PRIMARY KEY NOT NULL,
  "page_views" integer DEFAULT 0 NOT NULL,
  "unique_sessions" integer DEFAULT 0 NOT NULL,
  "whatsapp_clicks" integer DEFAULT 0 NOT NULL,
  "quote_submits" integer DEFAULT 0 NOT NULL,
  "top_sources" jsonb DEFAULT '{}'::jsonb NOT NULL
);
