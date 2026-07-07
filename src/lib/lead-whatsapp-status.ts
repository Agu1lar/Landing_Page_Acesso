import type { LeadRecord } from '@/lib/leads-admin';

export type LeadWhatsAppStatus = 'opened' | 'blocked' | 'unknown' | 'not_applicable';

/** Resolves WhatsApp engagement for admin display. */
export function resolveLeadWhatsAppStatus(lead: Pick<LeadRecord, 'leadKind' | 'whatsappOpened'>): LeadWhatsAppStatus {
  if (lead.leadKind === 'cookie_consent') {
    return 'not_applicable';
  }

  if (lead.whatsappOpened === true) {
    return 'opened';
  }

  if (lead.whatsappOpened === false) {
    return 'blocked';
  }

  return 'unknown';
}
