CREATE TABLE IF NOT EXISTS "blog_articles" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" varchar(120) NOT NULL UNIQUE,
  "title" text NOT NULL,
  "excerpt" text NOT NULL,
  "meta_title" varchar(200) NOT NULL,
  "meta_description" varchar(320) NOT NULL,
  "cover_image_url" text,
  "content" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "related_links" jsonb DEFAULT '[]'::jsonb NOT NULL,
  "status" varchar(20) DEFAULT 'draft' NOT NULL,
  "published_at" timestamp,
  "reading_minutes" integer DEFAULT 1 NOT NULL,
  "deleted_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  "updated_by" varchar(320)
);
