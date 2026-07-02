CREATE TABLE IF NOT EXISTS "rate_limit_buckets" (
  "id" serial PRIMARY KEY NOT NULL,
  "bucket_key" varchar(200) NOT NULL,
  "window_start" timestamp NOT NULL,
  "request_count" integer DEFAULT 1 NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "rate_limit_buckets_bucket_key_unique" ON "rate_limit_buckets" ("bucket_key");
