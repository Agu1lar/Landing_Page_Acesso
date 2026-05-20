export const LEAD_STATUSES = ['new', 'contacted', 'quoted', 'won', 'lost'] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

/**
 * Returns true when value is a valid lead status.
 */
export function isLeadStatus(value: string): value is LeadStatus {
  return LEAD_STATUSES.includes(value as LeadStatus);
}
