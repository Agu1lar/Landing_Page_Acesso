import { afterEach, describe, expect, it, vi } from 'vitest';

vi.mock('@/libs/Env', () => ({
  Env: {
    RESEND_API_KEY: undefined,
    LEADS_NOTIFY_EMAIL: 'comercial@example.com',
    RESEND_FROM_EMAIL: 'Acesso <onboarding@resend.dev>',
  },
}));

import { notifyLeadByEmail } from '@/lib/email';

const sampleLead = {
  id: 1,
  name: 'Maria Silva',
  email: 'maria@example.com',
  phone: '31999990000',
  company: null,
  equipmentSlug: 'betoneira',
  equipmentName: 'Betoneira',
  rentalPeriod: 'semanal',
  city: 'Belo Horizonte',
  message: null,
  itemsJson: null,
  origin: 'site-orcamento',
  status: 'new',
  utmSource: null,
  utmMedium: null,
  utmCampaign: null,
  utmContent: null,
  utmTerm: null,
  referrer: null,
  landingPage: null,
  createdAt: new Date('2026-05-19'),
};

describe('notifyLeadByEmail', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('skips Resend call when API key is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);

    await notifyLeadByEmail(sampleLead);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
