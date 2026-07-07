import { describe, expect, it } from 'vitest';
import { buildLeadCartItemDisplay } from '@/lib/lead-cart';
import { resolveLeadWhatsAppStatus } from '@/lib/lead-whatsapp-status';

describe('buildLeadCartItemDisplay', () => {
  it('shows category and short description instead of raw slug', () => {
    const display = buildLeadCartItemDisplay(
      {
        slug: 'diagonal-1-00',
        name: 'ANDAIME TIPO TUBO E BRAÇADEIRA',
        kind: 'equipment',
        quantity: 1,
      },
      {
        name: 'Diagonal 1,00',
        category: 'andaimes',
        shortDescription: 'Locação de diagonal 1,00 para andaimes e acesso temporário.',
      },
    );

    expect(display.subtitle).toContain('Andaimes');
    expect(display.subtitle).not.toContain('diagonal-1-00');
    expect(display.catalogNameNote).toBe('Diagonal 1,00');
  });
});

describe('resolveLeadWhatsAppStatus', () => {
  it('marks quote leads with popup success as opened', () => {
    expect(
      resolveLeadWhatsAppStatus({ leadKind: 'quote', whatsappOpened: true }),
    ).toBe('opened');
  });

  it('marks blocked popup as blocked', () => {
    expect(
      resolveLeadWhatsAppStatus({ leadKind: 'quote', whatsappOpened: false }),
    ).toBe('blocked');
  });
});
