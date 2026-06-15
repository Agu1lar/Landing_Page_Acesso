ALTER TABLE "leads" ALTER COLUMN "phone" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "leads" ALTER COLUMN "city" DROP NOT NULL;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "lead_kind" varchar(40) DEFAULT 'quote' NOT NULL;
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN "google_sub" varchar(255);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "leads_email_lead_kind_idx" ON "leads" ("email", "lead_kind");
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "page_engagement_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "pathname" varchar(500) NOT NULL,
  "active_seconds" integer NOT NULL,
  "device" varchar(20),
  "session_id" varchar(64),
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_engagement_events_created_at_idx" ON "page_engagement_events" ("created_at");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "page_engagement_events_pathname_idx" ON "page_engagement_events" ("pathname");
