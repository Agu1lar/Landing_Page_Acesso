CREATE TABLE IF NOT EXISTS "clients" (
  "id" serial PRIMARY KEY NOT NULL,
  "display_name" varchar(200) NOT NULL,
  "email" varchar(320),
  "phone" varchar(40),
  "phone_normalized" varchar(20),
  "google_sub" varchar(255),
  "company" varchar(200),
  "first_seen_at" timestamp DEFAULT now() NOT NULL,
  "last_activity_at" timestamp DEFAULT now() NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "clients_email_uidx" ON "clients" ("email") WHERE "email" IS NOT NULL AND "email" <> '';
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "clients_google_sub_uidx" ON "clients" ("google_sub") WHERE "google_sub" IS NOT NULL AND "google_sub" <> '';
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "clients_phone_normalized_uidx" ON "clients" ("phone_normalized") WHERE "phone_normalized" IS NOT NULL AND "phone_normalized" <> '';
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "client_id" integer;
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "leads" ADD CONSTRAINT "leads_client_id_clients_id_fk"
    FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_client_id_idx" ON "leads" ("client_id");
