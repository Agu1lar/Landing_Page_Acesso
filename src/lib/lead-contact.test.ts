import { describe, expect, it } from 'vitest';
import {
  countContactOrders,
  leadsShareContact,
  normalizeLeadEmail,
  normalizeLeadPhone,
} from '@/lib/lead-contact';
import type { LeadRecord } from '@/lib/leads-admin';

function lead(partial: Partial<LeadRecord> & Pick<LeadRecord, 'id' | 'email'>): LeadRecord {
  return {
    id: partial.id,
    email: partial.email,
    phone: partial.phone ?? null,
    name: partial.name ?? 'Test',
    company: null,
    equipmentSlug: null,
    equipmentName: null,
    rentalPeriod: null,
    city: null,
    message: null,
    itemsJson: null,
    origin: 'site-orcamento',
    leadKind: 'quote',
    googleSub: null,
    status: 'new',
    utmSource: null,
    utmMedium: null,
    utmCampaign: null,
    utmContent: null,
    utmTerm: null,
    gclid: null,
    gbraid: null,
    wbraid: null,
    referrer: null,
    landingPage: null,
    internalNotes: null,
    createdAt: new Date('2026-06-01T12:00:00.000Z'),
    lastActivityAt: partial.lastActivityAt ?? null,
    ...partial,
  };
}

describe('lead contact matching', () => {
  it('matches by normalized email', () => {
    expect(
      leadsShareContact(
        lead({ id: 1, email: 'Maria@gmail.com' }),
        lead({ id: 2, email: 'maria@gmail.com' }),
      ),
    ).toBe(true);
  });

  it('matches by phone digits', () => {
    expect(
      leadsShareContact(
        lead({ id: 1, email: 'a@x.com', phone: '(31) 99999-8888' }),
        lead({ id: 2, email: 'b@y.com', phone: '31999998888' }),
      ),
    ).toBe(true);
  });

  it('does not match different people with the same first name only', () => {
    expect(
      leadsShareContact(
        lead({ id: 1, email: 'maria.a@x.com', name: 'Maria' }),
        lead({ id: 2, email: 'maria.b@y.com', name: 'Maria' }),
      ),
    ).toBe(false);
  });

  it('counts orders for the same contact', () => {
    const rows = [
      lead({ id: 1, email: 'maria@x.com' }),
      lead({ id: 2, email: 'maria@x.com' }),
      lead({ id: 3, email: 'joao@x.com' }),
    ];
    expect(countContactOrders(rows[0]!, rows)).toBe(2);
    expect(normalizeLeadEmail(' Test@Mail.COM ')).toBe('test@mail.com');
    expect(normalizeLeadPhone('(31) 3376-3377')).toBe('3133763377');
  });
});
