CREATE TABLE "leads" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(200) NOT NULL,
	"email" varchar(320) NOT NULL,
	"phone" varchar(40) NOT NULL,
	"company" varchar(200),
	"equipment_slug" varchar(120),
	"equipment_name" varchar(300),
	"rental_period" varchar(80),
	"city" varchar(120) NOT NULL,
	"message" text,
	"origin" varchar(80) DEFAULT 'site' NOT NULL,
	"status" varchar(40) DEFAULT 'new' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
