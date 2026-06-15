export const LEAD_KINDS = ['quote', 'cookie_consent'] as const;

export type LeadKind = (typeof LEAD_KINDS)[number];

export function isLeadKind(value: string): value is LeadKind {
  return LEAD_KINDS.includes(value as LeadKind);
}
