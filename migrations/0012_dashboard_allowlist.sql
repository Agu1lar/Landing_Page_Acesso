CREATE TABLE IF NOT EXISTS "dashboard_allowlist" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(320) NOT NULL,
  "role" varchar(40) DEFAULT 'comercial' NOT NULL,
  "added_by_email" varchar(320),
  "created_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "dashboard_allowlist_email_unique" UNIQUE("email")
);
