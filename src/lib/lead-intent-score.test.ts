import { describe, expect, it } from 'vitest';
import { scoreLeadIntent } from '@/lib/lead-intent-score';

describe('scoreLeadIntent', () => {
  it('marks cookie-consent leads as cold', () => {
    expect(
      scoreLeadIntent({
        leadKind: 'cookie_consent',
      }),
    ).toEqual({ score: 0, tier: 'cold' });
  });

  it('scores a rich quote lead as hot', () => {
    const result = scoreLeadIntent({
      leadKind: 'quote',
      phone: '31999990000',
      city: 'Belo Horizonte',
      itemsJson: JSON.stringify([
        { slug: 'a', name: 'A', kind: 'equipment', quantity: 1 },
        { slug: 'b', name: 'B', kind: 'accessory', quantity: 2 },
      ]),
      rentalPeriod: 'semanal',
      message: 'Obra urgente',
      utmCampaign: 'google-ads',
      company: 'Obra Ltda',
    });

    expect(result.tier).toBe('hot');
    expect(result.score).toBeGreaterThanOrEqual(8);
  });

  it('scores a minimal quote lead as warm or cold', () => {
    const result = scoreLeadIntent({
      leadKind: 'quote',
      phone: '31999990000',
      city: 'Contagem',
      equipmentName: 'Betoneira',
    });

    expect(result.score).toBeGreaterThanOrEqual(5);
    expect(['warm', 'hot']).toContain(result.tier);
  });
});
