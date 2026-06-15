import { parseLeadCartItems } from '@/lib/leads-admin';

export type LeadIntentTier = 'hot' | 'warm' | 'cold';

export type LeadIntentInput = {
  leadKind: string;
  phone?: string | null;
  city?: string | null;
  itemsJson?: string | null;
  equipmentName?: string | null;
  rentalPeriod?: string | null;
  message?: string | null;
  utmSource?: string | null;
  utmCampaign?: string | null;
  company?: string | null;
};

export type LeadIntentScore = {
  score: number;
  tier: LeadIntentTier;
};

/**
 * Estimates commercial priority from fields already stored on the lead row.
 */
export function scoreLeadIntent(lead: LeadIntentInput): LeadIntentScore {
  if (lead.leadKind === 'cookie_consent') {
    return { score: 0, tier: 'cold' };
  }

  let score = 3;

  if (lead.phone?.trim()) {
    score += 1;
  }
  if (lead.city?.trim()) {
    score += 1;
  }

  const items = parseLeadCartItems(lead.itemsJson);
  const totalUnits = items.reduce((sum, item) => sum + item.quantity, 0);

  if (items.length >= 2 || totalUnits >= 2) {
    score += 2;
  } else if (items.length === 1 || lead.equipmentName?.trim()) {
    score += 1;
  }

  if (lead.rentalPeriod?.trim()) {
    score += 1;
  }
  if (lead.message?.trim()) {
    score += 1;
  }
  if (lead.utmCampaign?.trim() || lead.utmSource?.trim()) {
    score += 1;
  }
  if (lead.company?.trim()) {
    score += 1;
  }

  if (score >= 8) {
    return { score, tier: 'hot' };
  }
  if (score >= 5) {
    return { score, tier: 'warm' };
  }
  return { score, tier: 'cold' };
}
