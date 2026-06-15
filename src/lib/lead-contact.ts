import type { LeadRecord } from '@/lib/leads-admin';

/** Normalizes email for contact matching. */
export function normalizeLeadEmail(email: string) {
  return email.trim().toLowerCase();
}

/** Keeps digits only; returns null when too short to match reliably. */
export function normalizeLeadPhone(phone: string | null | undefined) {
  if (!phone?.trim()) {
    return null;
  }

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10) {
    return null;
  }

  return digits;
}

/** True when two lead rows likely belong to the same person. */
export function leadsShareContact(a: Pick<LeadRecord, 'email' | 'phone'>, b: Pick<LeadRecord, 'email' | 'phone'>) {
  if (normalizeLeadEmail(a.email) === normalizeLeadEmail(b.email)) {
    return true;
  }

  const phoneA = normalizeLeadPhone(a.phone);
  const phoneB = normalizeLeadPhone(b.phone);
  return Boolean(phoneA && phoneB && phoneA === phoneB);
}

/** Sort key for admin lists — most recent activity first. */
export function leadActivityTimestamp(lead: Pick<LeadRecord, 'createdAt' | 'lastActivityAt'>) {
  return (lead.lastActivityAt ?? lead.createdAt).getTime();
}

/** Counts leads that share email or phone with the reference row. */
export function countContactOrders(reference: Pick<LeadRecord, 'id' | 'email' | 'phone'>, rows: LeadRecord[]) {
  return rows.filter((row) => leadsShareContact(reference, row)).length;
}

/** Related leads for one contact, newest activity first. */
export function sortRelatedLeads(rows: LeadRecord[]) {
  return [...rows].sort((a, b) => leadActivityTimestamp(b) - leadActivityTimestamp(a));
}
