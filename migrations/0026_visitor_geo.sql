-- Approximate visitor location (browser geolocation after analytics consent)
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "geo_city" varchar(120);
--> statement-breakpoint
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "geo_region" varchar(120);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN IF NOT EXISTS "geo_city" varchar(120);
--> statement-breakpoint
ALTER TABLE "analytics_events" ADD COLUMN IF NOT EXISTS "geo_region" varchar(120);
