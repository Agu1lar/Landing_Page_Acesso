import type { InferSelectModel } from 'drizzle-orm';
import type { clientsSchema, leadsSchema } from '@/models/Schema';

export type ClientRecord = InferSelectModel<typeof clientsSchema>;
export type ClientLeadRecord = InferSelectModel<typeof leadsSchema>;

export type ClientListItem = ClientRecord & {
  leadCount: number;
  quoteCount: number;
  cookieConsentCount: number;
};

export type ClientListFilters = {
  q?: string;
  page?: number;
  pageSize?: number;
};
