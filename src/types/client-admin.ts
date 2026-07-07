export type ClientRecord = {
  id: number;
  displayName: string;
  email: string | null;
  phone: string | null;
  phoneNormalized: string | null;
  googleSub: string | null;
  company: string | null;
  firstSeenAt: Date;
  lastActivityAt: Date;
  createdAt: Date;
  updatedAt: Date;
};

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
