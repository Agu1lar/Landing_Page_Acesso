CREATE TABLE IF NOT EXISTS "dashboard_password_reset" (
  "id" serial PRIMARY KEY NOT NULL,
  "email" varchar(320) NOT NULL,
  "code_hash" varchar(255) NOT NULL,
  "expires_at" timestamp NOT NULL,
  "attempt_count" integer DEFAULT 0 NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "dashboard_password_reset_email_idx"
  ON "dashboard_password_reset" ("email");
