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
      cartItems: [{ slug: 'betoneira', name: 'Betoneira', kind: 'equipment', quantity: 2 }],
      origin: 'site-orcamento',
    });

    expect(message).toContain('Meu nome é Maria Silva');
    expect(message).toContain('Betoneira — quantidade: 2');
    expect(message).toContain('Semanal');
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
