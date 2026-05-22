CREATE TABLE IF NOT EXISTS "analytics_events" (
  "id" serial PRIMARY KEY NOT NULL,
  "event_type" varchar(40) NOT NULL,
  "origin" varchar(80),
  "equipment_slug" varchar(120),
  "equipment_name" varchar(300),
  "pathname" varchar(500),
  "device" varchar(20),
  "utm_source" varchar(120),
  "utm_medium" varchar(120),
  "utm_campaign" varchar(200),
  "utm_content" varchar(200),
  "utm_term" varchar(200),
  "referrer" varchar(500),
  "landing_page" varchar(500),
  "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "analytics_events_created_at_idx" ON "analytics_events" ("created_at");
CREATE INDEX IF NOT EXISTS "analytics_events_event_type_idx" ON "analytics_events" ("event_type");
