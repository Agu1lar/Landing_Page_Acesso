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

/** Picks the more informative scalar when merging client fields. */
export function pickRichestScalar(
  current: string | null | undefined,
  incoming: string | null | undefined,
) {
  const a = current?.trim() ?? '';
  const b = incoming?.trim() ?? '';
  if (!a) {
    return b || null;
  }
  if (!b) {
    return a;
  }
  return b.length > a.length ? b : a;
}

export type ClientAliasKind = 'email' | 'phone' | 'google_sub';

export type MergedClientFields = {
  displayName: string;
  email: string | null;
  phone: string | null;
  phoneNormalized: string | null;
  googleSub: string | null;
  company: string | null;
  firstSeenAt: Date;
  lastActivityAt: Date;
};

type ClientMergeInput = {
  displayName: string;
  email: string | null;
  phone: string | null;
  phoneNormalized: string | null;
  googleSub: string | null;
  company: string | null;
  firstSeenAt: Date;
  lastActivityAt: Date;
};

/** Merges client rows into one field set (richest scalars, earliest first seen). */
export function mergeClientFields(records: ClientMergeInput[]): MergedClientFields {
  if (records.length === 0) {
    throw new Error('mergeClientFields requires at least one record');
  }

  const sorted = [...records].sort((a, b) => a.firstSeenAt.getTime() - b.firstSeenAt.getTime());
  const seed = sorted[0]!;

  return records.reduce<ClientMergeInput>(
    (acc, row) => ({
      displayName: pickClientDisplayName(acc.displayName, row.displayName),
      email: pickRichestScalar(acc.email, row.email),
      phone: pickRichestScalar(acc.phone, row.phone),
      phoneNormalized: pickRichestScalar(acc.phoneNormalized, row.phoneNormalized),
      googleSub: pickRichestScalar(acc.googleSub, row.googleSub),
      company: pickRichestScalar(acc.company, row.company),
      firstSeenAt:
        row.firstSeenAt.getTime() < acc.firstSeenAt.getTime() ? row.firstSeenAt : acc.firstSeenAt,
      lastActivityAt:
        row.lastActivityAt.getTime() > acc.lastActivityAt.getTime()
          ? row.lastActivityAt
          : acc.lastActivityAt,
    }),
    { ...seed },
  );
}

/** Collects alias rows for identifiers not kept on the primary client row. */
export function collectClientAliasInserts(
  primary: MergedClientFields,
  sources: ClientMergeInput[],
  primaryClientId: number,
) {
  const aliases: Array<{ clientId: number; kind: ClientAliasKind; value: string }> = [];
  const seen = new Set<string>();

  const addAlias = (kind: ClientAliasKind, value: string | null | undefined) => {
    const normalized = value?.trim();
    if (!normalized) {
      return;
    }

    if (kind === 'email' && normalized === primary.email) {
      return;
    }
    if (kind === 'phone' && normalized === primary.phoneNormalized) {
      return;
    }
    if (kind === 'google_sub' && normalized === primary.googleSub) {
      return;
    }

    const key = `${kind}:${normalized}`;
    if (seen.has(key)) {
      return;
    }
    seen.add(key);
    aliases.push({ clientId: primaryClientId, kind, value: normalized });
  };

  for (const source of sources) {
    addAlias('email', source.email);
    addAlias('phone', source.phoneNormalized);
    addAlias('google_sub', source.googleSub);
  }

  return aliases;
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
