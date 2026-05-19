import { afterEach, describe, expect, it, vi } from 'vitest';
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
  createdAt: new Date('2026-05-19'),
};

describe('notifyLeadByEmail', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('skips Resend call when API key is missing', async () => {
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    vi.stubEnv('RESEND_API_KEY', '');
    vi.stubEnv('LEADS_NOTIFY_EMAIL', 'comercial@example.com');

    await notifyLeadByEmail(sampleLead);

    expect(fetchMock).not.toHaveBeenCalled();
  });
});
