CREATE TABLE IF NOT EXISTS "client_aliases" (
  "id" serial PRIMARY KEY NOT NULL,
  "client_id" integer NOT NULL,
  "kind" varchar(20) NOT NULL,
  "value" varchar(320) NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "client_aliases" ADD CONSTRAINT "client_aliases_client_id_clients_id_fk"
    FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "client_aliases_kind_value_uidx" ON "client_aliases" ("kind", "value");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "client_aliases_client_id_idx" ON "client_aliases" ("client_id");
