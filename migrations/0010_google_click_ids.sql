ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "gclid" varchar(255);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "gbraid" varchar(255);
ALTER TABLE "leads" ADD COLUMN IF NOT EXISTS "wbraid" varchar(255);

ALTER TABLE "analytics_events" ADD COLUMN IF NOT EXISTS "gclid" varchar(255);
ALTER TABLE "analytics_events" ADD COLUMN IF NOT EXISTS "gbraid" varchar(255);
ALTER TABLE "analytics_events" ADD COLUMN IF NOT EXISTS "wbraid" varchar(255);
