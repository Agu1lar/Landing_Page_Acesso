import { normalizeLeadEmail, normalizeLeadPhone } from '@/lib/lead-contact';

export type ClientIdentityInput = {
  displayName: string;
  email?: string | null;
  phone?: string | null;
  googleSub?: string | null;
  company?: string | null;
};

export type NormalizedClientIdentity = {
  displayName: string;
  email: string | null;
  phone: string | null;
  phoneNormalized: string | null;
  googleSub: string | null;
  company: string | null;
};

/** Normalizes contact fields used to match or create a client row. */
export function normalizeClientIdentity(input: ClientIdentityInput): NormalizedClientIdentity {
  const displayName = input.displayName.trim().slice(0, 200) || 'Visitante';
  const email = input.email?.trim() ? normalizeLeadEmail(input.email) : null;
  const phone = input.phone?.trim() ? input.phone.trim().slice(0, 40) : null;
  const phoneNormalized = normalizeLeadPhone(phone);
  const googleSub = input.googleSub?.trim() ? input.googleSub.trim().slice(0, 255) : null;
  const company = input.company?.trim() ? input.company.trim().slice(0, 200) : null;

  return {
    displayName,
    email,
    phone,
    phoneNormalized,
    googleSub,
    company,
  };
}

/** True when at least one stable identifier exists for deduplication. */
export function hasClientIdentityKey(identity: NormalizedClientIdentity) {
  return Boolean(identity.email || identity.phoneNormalized || identity.googleSub);
}

/** Picks the richer display name when merging client records. */
export function pickClientDisplayName(current: string | null | undefined, incoming: string) {
  const next = incoming.trim();
  if (!next) {
    return current?.trim() || 'Visitante';
  }

  const existing = current?.trim() ?? '';
  if (!existing || (existing === existing.toLowerCase() && next.length > existing.length)) {
    return next.slice(0, 200);
  }

  return existing.slice(0, 200);
}

/** Sort key for alphabetical client lists (ignores leading articles). */
export function clientSortKey(displayName: string) {
  return displayName
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/^(da|de|do|das|dos|e)\s+/iu, '');
}

/** Tokenizes a search query for multi-field matching. */
export function tokenizeClientSearchQuery(query: string) {
  return query
    .trim()
    .toLowerCase()
    .split(/\s+/)
    .filter((token) => token.length >= 2);
}
