import { describe, expect, it } from 'vitest';
import { buildQuoteWhatsAppMessage, buildQuoteWhatsAppUrl } from '@/lib/quote-whatsapp';

describe('build quote WhatsApp message', () => {
  it('includes cart items with quantity and contact fields', () => {
    const message = buildQuoteWhatsAppMessage({
      name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '(31) 99999-0000',
      city: 'Belo Horizonte',
      rentalPeriod: 'semanal',
      cartItems: [
        {
          slug: 'plataforma-elevatoria-hb-1430',
          name: 'Plataforma elevatória HB 1430',
          kind: 'equipment',
          quantity: 2,
          specsSummary: 'Altura de trabalho: ~6,1 m · Capacidade de carga: ~300 kg',
        },
      ],
      origin: 'site-orcamento',
    });

    expect(message).toContain('Meu nome é Maria Silva');
    expect(message).toContain('Plataforma elevatória HB 1430 — quantidade: 2');
    expect(message).toContain('Altura de trabalho: ~6,1 m');
    expect(message).toContain('Capacidade de carga: ~300 kg');
    expect(message).toContain('Semanal');
  });

  it('includes equipment specs when quoting a single item', () => {
    const message = buildQuoteWhatsAppMessage({
      name: 'João',
      email: 'joao@example.com',
      phone: '31999990000',
      city: 'Contagem',
      equipmentName: 'Plataforma elevatória HB 1430',
      equipmentSpecsSummary: 'Altura de trabalho: ~6,1 m · Capacidade de carga: ~300 kg',
    });

    expect(message).toContain('Plataforma elevatória HB 1430');
    expect(message).toContain('Altura de trabalho: ~6,1 m');
  });
});

describe('build quote WhatsApp url', () => {
  it('encodes message for wa.me link', () => {
    const url = buildQuoteWhatsAppUrl({
      name: 'João',
      email: 'joao@example.com',
      phone: '31999990000',
      city: 'Contagem',
      equipmentName: 'Compactador',
    });

    expect(url).toContain('https://wa.me/');
    expect(url).toContain('text=');
  });
});
