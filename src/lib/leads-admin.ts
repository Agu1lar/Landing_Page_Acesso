import { and, desc, eq, gte, ilike, inArray, lte, or, sql } from 'drizzle-orm';
import type { InferSelectModel } from 'drizzle-orm';
import * as z from 'zod';
import { countContactOrders, normalizeLeadEmail, normalizeLeadPhone, sortRelatedLeads } from '@/lib/lead-contact';
import type { LeadStatus } from '@/lib/lead-status';
import { scoreLeadIntent } from '@/lib/lead-intent-score';
import { db } from '@/libs/DB';
import { leadsSchema } from '@/models/Schema';
import { QuoteCartItemSchema } from '@/validations/quote';
import type { QuoteCartItemInput } from '@/validations/quote';

export type LeadRecord = InferSelectModel<typeof leadsSchema>;

const leadActivityOrder = sql`coalesce(${leadsSchema.lastActivityAt}, ${leadsSchema.createdAt})`;

export type LeadListFilters = {
  dateFrom?: string;
  dateTo?: string;
  status?: string;
  city?: string;
  origin?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

const DEFAULT_PAGE_SIZE = 25;

type LeadCsvRow = {
  id: string;
  createdAt: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  city: string;
  rentalPeriod: string;
  equipmentName: string;
  items: string;
  origin: string;
  leadKind: string;
  status: string;
  message: string;
  utmSource: string;
  utmMedium: string;
  utmCampaign: string;
  utmContent: string;
  utmTerm: string;
  referrer: string;
  landingPage: string;
  internalNotes: string;
};

type CsvColumn = {
  key: keyof LeadCsvRow;
  header: string;
};

const CSV_COLUMNS: CsvColumn[] = [
  { key: 'id', header: 'ID' },
  { key: 'createdAt', header: 'Data' },
  { key: 'name', header: 'Nome' },
  { key: 'email', header: 'E-mail' },
  { key: 'phone', header: 'Telefone' },
  { key: 'company', header: 'Empresa' },
  { key: 'city', header: 'Cidade' },
  { key: 'rentalPeriod', header: 'Período' },
  { key: 'equipmentName', header: 'Equipamento' },
  { key: 'items', header: 'Itens do carrinho' },
  { key: 'origin', header: 'Origem' },
  { key: 'leadKind', header: 'Tipo' },
  { key: 'status', header: 'Status' },
  { key: 'message', header: 'Mensagem' },
  { key: 'utmSource', header: 'UTM source' },
  { key: 'utmMedium', header: 'UTM medium' },
  { key: 'utmCampaign', header: 'UTM campaign' },
  { key: 'utmContent', header: 'UTM content' },
  { key: 'utmTerm', header: 'UTM term' },
  { key: 'referrer', header: 'Referrer' },
  { key: 'landingPage', header: 'Landing page' },
  { key: 'internalNotes', header: 'Notas internas' },
];

/**
 * Parses cart line items stored on a lead row.
 *
 * @param itemsJson - Serialized cart from the quote form.
 * @returns Validated cart items, or an empty array when invalid.
 */
export function parseLeadCartItems(itemsJson: string | null | undefined) {
  if (!itemsJson?.trim()) {
    return [] as QuoteCartItemInput[];
  }
  try {
    const raw: unknown = JSON.parse(itemsJson);
    const parsed = z.array(QuoteCartItemSchema).safeParse(raw);
    return parsed.success ? parsed.data : [];
  } catch {
    return [];
  }
}

/**
 * Formats cart items for CSV or table display.
 *
 * @param itemsJson - Serialized cart from the quote form.
 * @returns Human-readable summary for admin views and export.
 */
export function formatLeadCartItems(itemsJson: string | null | undefined) {
  const items = parseLeadCartItems(itemsJson);
  if (items.length === 0) {
    return '';
  }
  return items
    .map((item) => {
      const kind = item.kind === 'accessory' ? 'Acessório' : 'Equipamento';
      const qty = item.quantity > 1 ? ` ×${item.quantity}` : '';
      return `${item.name} (${kind})${qty}`;
    })
    .join('; ');
}

function buildWhere(filters: LeadListFilters) {
  const conditions = [];

  if (filters.status?.trim()) {
    conditions.push(eq(leadsSchema.status, filters.status.trim()));
  }
  if (filters.city?.trim()) {
    conditions.push(ilike(leadsSchema.city, `%${filters.city.trim()}%`));
  }
  if (filters.origin?.trim()) {
    conditions.push(ilike(leadsSchema.origin, `%${filters.origin.trim()}%`));
  }
  if (filters.dateFrom?.trim()) {
    const from = new Date(`${filters.dateFrom.trim()}T00:00:00.000Z`);
    if (!Number.isNaN(from.getTime())) {
      conditions.push(gte(leadsSchema.createdAt, from));
    }
  }
  if (filters.dateTo?.trim()) {
    const to = new Date(`${filters.dateTo.trim()}T23:59:59.999Z`);
    if (!Number.isNaN(to.getTime())) {
      conditions.push(lte(leadsSchema.createdAt, to));
    }
  }
  if (filters.q?.trim()) {
    const term = `%${filters.q.trim()}%`;
    conditions.push(
      or(
        ilike(leadsSchema.name, term),
        ilike(leadsSchema.email, term),
        ilike(leadsSchema.phone, term),
        ilike(leadsSchema.equipmentName, term),
        ilike(leadsSchema.company, term),
      ),
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export type LeadWithIntent = LeadRecord & ReturnType<typeof scoreLeadIntent>;

/**
 * Returns open leads sorted by commercial intent (highest first).
 */
export async function listCommercialQueue(limit = 8) {
  const rows = await db
    .select()
    .from(leadsSchema)
    .where(eq(leadsSchema.status, 'new'))
    .orderBy(desc(leadActivityOrder))
    .limit(40);

  return rows
    .map((lead) => ({
      ...lead,
      ...scoreLeadIntent(lead),
    }))
    .sort(
      (a, b) =>
        b.score - a.score ||
        (b.lastActivityAt ?? b.createdAt).getTime() - (a.lastActivityAt ?? a.createdAt).getTime(),
    )
    .slice(0, limit);
}

/**
 * Lists leads for the admin panel with optional filters and pagination.
 *
 * @param filters - Date, status, city, origin, search and page options.
 * @returns Paginated lead rows and totals.
 */
export async function listLeads(filters: LeadListFilters = {}) {
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.min(100, Math.max(1, filters.pageSize ?? DEFAULT_PAGE_SIZE));
  const offset = (page - 1) * pageSize;
  const where = buildWhere(filters);

  const [rows, countRow] = await Promise.all([
    db
      .select()
      .from(leadsSchema)
      .where(where)
      .orderBy(desc(leadActivityOrder))
      .limit(pageSize)
      .offset(offset),
    db
      .select({ count: sql<number>`cast(count(*) as int)` })
      .from(leadsSchema)
      .where(where),
  ]);

  const total = countRow[0]?.count ?? 0;

  return {
    leads: rows,
    total,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/**
 * Fetches a single lead by id.
 *
 * @param id - Lead primary key.
 * @returns The lead row when found.
 */
export async function getLeadById(id: number) {
  const [lead] = await db.select().from(leadsSchema).where(eq(leadsSchema.id, id)).limit(1);
  return lead;
}

/**
 * Lists other leads that share email or phone with the reference row.
 */
export async function listRelatedLeads(reference: LeadRecord) {
  const email = normalizeLeadEmail(reference.email);
  const phoneDigits = normalizeLeadPhone(reference.phone);
  const matchConditions = [eq(leadsSchema.email, email)];

  if (phoneDigits) {
    matchConditions.push(sql`regexp_replace(${leadsSchema.phone}, '\\D', '', 'g') = ${phoneDigits}`);
  }

  const rows = await db
    .select()
    .from(leadsSchema)
    .where(or(...matchConditions))
    .orderBy(desc(leadActivityOrder));

  return sortRelatedLeads(rows);
}

/**
 * Maps lead id → count of rows for the same contact (email or phone).
 */
export async function buildContactOrderCounts(leads: LeadRecord[]) {
  const counts = new Map<number, number>();
  if (leads.length === 0) {
    return counts;
  }

  const emails = [...new Set(leads.map((row) => normalizeLeadEmail(row.email)))];
  const phones = [
    ...new Set(
      leads.map((row) => normalizeLeadPhone(row.phone)).filter((value): value is string => Boolean(value)),
    ),
  ];

  const matchConditions = [inArray(leadsSchema.email, emails)];
  if (phones.length > 0) {
    matchConditions.push(
      sql`regexp_replace(${leadsSchema.phone}, '\\D', '', 'g') in (${sql.join(
        phones.map((phone) => sql`${phone}`),
        sql`, `,
      )})`,
    );
  }

  const pool = await db
    .select()
    .from(leadsSchema)
    .where(or(...matchConditions));

  for (const lead of leads) {
    counts.set(lead.id, countContactOrders(lead, pool));
  }

  return counts;
}

/**
 * Updates lead status by id.
 *
 * @param id - Lead primary key.
 * @param status - New status value.
 * @returns Updated lead row when found.
 */
export async function updateLeadStatus(id: number, status: LeadStatus) {
  const [lead] = await db
    .update(leadsSchema)
    .set({ status })
    .where(eq(leadsSchema.id, id))
    .returning();

  return lead;
}

/**
 * Updates internal notes for a lead.
 *
 * @param id - Lead primary key.
 * @param internalNotes - Team-only notes (empty string clears).
 * @returns Updated lead row when found.
 */
export async function updateLeadInternalNotes(id: number, internalNotes: string) {
  const [lead] = await db
    .update(leadsSchema)
    .set({ internalNotes: internalNotes.trim() || null })
    .where(eq(leadsSchema.id, id))
    .returning();

  return lead;
}

function escapeCsvCell(value: string) {
  if (/[",\n\r]/u.test(value)) {
    return `"${value.replaceAll('"', '""')}"`;
  }
  return value;
}

function leadToCsvRow(lead: LeadRecord): LeadCsvRow {
  return {
    id: String(lead.id),
    createdAt: lead.createdAt.toISOString(),
    name: lead.name,
    email: lead.email,
    phone: lead.phone ?? '',
    company: lead.company ?? '',
    city: lead.city ?? '',
    rentalPeriod: lead.rentalPeriod ?? '',
    equipmentName: lead.equipmentName ?? '',
    items: formatLeadCartItems(lead.itemsJson),
    origin: lead.origin,
    leadKind: lead.leadKind,
    status: lead.status,
    message: lead.message ?? '',
    utmSource: lead.utmSource ?? '',
    utmMedium: lead.utmMedium ?? '',
    utmCampaign: lead.utmCampaign ?? '',
    utmContent: lead.utmContent ?? '',
    utmTerm: lead.utmTerm ?? '',
    referrer: lead.referrer ?? '',
    landingPage: lead.landingPage ?? '',
    internalNotes: lead.internalNotes ?? '',
  };
}

/**
 * Builds UTF-8 CSV with BOM for Excel.
 *
 * @param leads - Lead rows to serialize.
 * @returns CSV string with header row.
 */
export function buildLeadsCsv(leads: LeadRecord[]) {
  const header = CSV_COLUMNS.map((col) => escapeCsvCell(col.header)).join(',');
  const rows = leads.map((lead) => {
    const row = leadToCsvRow(lead);
    return CSV_COLUMNS.map((col) => escapeCsvCell(row[col.key] ?? '')).join(',');
  });
  return `\uFEFF${[header, ...rows].join('\r\n')}`;
}

/**
 * Loads all leads matching filters for export (capped).
 *
 * @param filters - Same filters as the list view.
 * @param maxRows - Maximum rows returned.
 * @returns Lead rows ordered by newest first.
 */
export async function listLeadsForExport(filters: LeadListFilters, maxRows = 5000) {
  const where = buildWhere(filters);
  return await db
    .select()
    .from(leadsSchema)
    .where(where)
    .orderBy(desc(leadsSchema.createdAt))
    .limit(maxRows);
}

/**
 * Builds query string for list filters (export link and pagination).
 *
 * @param filters - Active list filters.
 * @returns Query string including leading `?` when non-empty.
 */
export function buildLeadsFilterQuery(filters: LeadListFilters) {
  const params = new URLSearchParams();
  if (filters.dateFrom) {
    params.set('dateFrom', filters.dateFrom);
  }
  if (filters.dateTo) {
    params.set('dateTo', filters.dateTo);
  }
  if (filters.status) {
    params.set('status', filters.status);
  }
  if (filters.city) {
    params.set('city', filters.city);
  }
  if (filters.origin) {
    params.set('origin', filters.origin);
  }
  if (filters.q) {
    params.set('q', filters.q);
  }
  if (filters.page && filters.page > 1) {
    params.set('page', String(filters.page));
  }
  const query = params.toString();
  return query ? `?${query}` : '';
}
