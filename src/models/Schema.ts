import { boolean, date, integer, jsonb, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
import type { EquipmentSpec } from '@/types/equipment';

// This file defines the structure of your database tables using the Drizzle ORM.

// To modify the database schema:
// 1. Update this file with your desired changes.
// 2. Generate a new migration by running: `npm run db:generate`

// The generated migration file will reflect your schema changes.
// It automatically run the command `db-server:file`, which apply the migration before Next.js starts in development mode,
// Alternatively, if your database is running, you can run `npm run db:migrate` and there is no need to restart the server.

// Need a database for production? Check out https://get.neon.com/BMFYNtx
// Tested and compatible with Next.js Boilerplate

export const counterSchema = pgTable('counter', {
  id: serial('id').primaryKey(),
  count: integer('count').default(0),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/** Leads de orçamento e contato — Sprint 5 */
export const leadsSchema = pgTable('leads', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 200 }).notNull(),
  email: varchar('email', { length: 320 }).notNull(),
  phone: varchar('phone', { length: 40 }).notNull(),
  company: varchar('company', { length: 200 }),
  equipmentSlug: varchar('equipment_slug', { length: 120 }),
  equipmentName: varchar('equipment_name', { length: 300 }),
  rentalPeriod: varchar('rental_period', { length: 80 }),
  city: varchar('city', { length: 120 }).notNull(),
  message: text('message'),
  itemsJson: text('items_json'),
  origin: varchar('origin', { length: 80 }).notNull().default('site'),
  status: varchar('status', { length: 40 }).notNull().default('new'),
  utmSource: varchar('utm_source', { length: 120 }),
  utmMedium: varchar('utm_medium', { length: 120 }),
  utmCampaign: varchar('utm_campaign', { length: 200 }),
  utmContent: varchar('utm_content', { length: 200 }),
  utmTerm: varchar('utm_term', { length: 200 }),
  referrer: varchar('referrer', { length: 500 }),
  landingPage: varchar('landing_page', { length: 500 }),
  internalNotes: text('internal_notes'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/** Conversion events for admin dashboard — Sprint 11.5 */
export const analyticsEventsSchema = pgTable('analytics_events', {
  id: serial('id').primaryKey(),
  eventType: varchar('event_type', { length: 40 }).notNull(),
  origin: varchar('origin', { length: 80 }),
  equipmentSlug: varchar('equipment_slug', { length: 120 }),
  equipmentName: varchar('equipment_name', { length: 300 }),
  pathname: varchar('pathname', { length: 500 }),
  device: varchar('device', { length: 20 }),
  utmSource: varchar('utm_source', { length: 120 }),
  utmMedium: varchar('utm_medium', { length: 120 }),
  utmCampaign: varchar('utm_campaign', { length: 200 }),
  utmContent: varchar('utm_content', { length: 200 }),
  utmTerm: varchar('utm_term', { length: 200 }),
  referrer: varchar('referrer', { length: 500 }),
  landingPage: varchar('landing_page', { length: 500 }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/** Catálogo de equipamentos — Sprint 11.2 */
export const equipmentSchema = pgTable('equipment', {
  id: serial('id').primaryKey(),
  slug: varchar('slug', { length: 120 }).notNull().unique(),
  name: varchar('name', { length: 300 }).notNull(),
  category: varchar('category', { length: 80 }).notNull(),
  shortDescription: text('short_description').notNull(),
  longDescription: text('long_description').notNull().default(''),
  specs: jsonb('specs').$type<EquipmentSpec[]>().notNull().default([]),
  tags: jsonb('tags').$type<string[]>().notNull().default([]),
  featured: boolean('featured').notNull().default(false),
  available: boolean('available').notNull().default(true),
  published: boolean('published').notNull().default(true),
  deletedAt: timestamp('deleted_at', { mode: 'date' }),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { mode: 'date' })
    .defaultNow()
    .$onUpdate(() => new Date())
    .notNull(),
  updatedBy: varchar('updated_by', { length: 120 }),
});

export const equipmentImagesSchema = pgTable('equipment_images', {
  id: serial('id').primaryKey(),
  equipmentId: integer('equipment_id')
    .notNull()
    .references(() => equipmentSchema.id, { onDelete: 'cascade' }),
  url: varchar('url', { length: 500 }).notNull(),
  alt: varchar('alt', { length: 300 }),
  sortOrder: integer('sort_order').notNull().default(0),
  isPrimary: boolean('is_primary').notNull().default(false),
});

/** Auditoria de alterações no admin — Sprint 11.7 */
export const adminActivitySchema = pgTable('admin_activity', {
  id: serial('id').primaryKey(),
  userId: varchar('user_id', { length: 120 }).notNull(),
  action: varchar('action', { length: 80 }).notNull(),
  entityType: varchar('entity_type', { length: 40 }).notNull(),
  entitySlug: varchar('entity_slug', { length: 120 }),
  details: text('details'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});

/** Agregados diários para o painel — Sprint 11.6 */
export const analyticsDailySchema = pgTable('analytics_daily', {
  date: date('date').primaryKey(),
  pageViews: integer('page_views').notNull().default(0),
  uniqueSessions: integer('unique_sessions').notNull().default(0),
  whatsappClicks: integer('whatsapp_clicks').notNull().default(0),
  quoteSubmits: integer('quote_submits').notNull().default(0),
  topSources: jsonb('top_sources').$type<Record<string, number>>().notNull().default({}),
});
