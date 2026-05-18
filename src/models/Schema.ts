import { integer, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';

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
  origin: varchar('origin', { length: 80 }).notNull().default('site'),
  status: varchar('status', { length: 40 }).notNull().default('new'),
  createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
});
