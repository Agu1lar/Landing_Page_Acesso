import { faker } from '@faker-js/faker';
import { expect, test } from '@playwright/test';

const validLeadPayload = () => ({
  name: 'Teste API Leads',
  email: faker.internet.email().toLowerCase(),
  phone: '31999990000',
  city: 'Belo Horizonte',
  rentalPeriod: 'semanal',
  origin: 'site-orcamento',
  website: '',
});

test.describe('Leads API', () => {
  test('rejects invalid payload with 422', async ({ request }) => {
    const response = await request.post('/api/leads', {
      data: {
        name: 'A',
        email: 'invalid',
        phone: '',
        city: '',
        origin: 'site-orcamento',
      },
    });

    expect(response.status()).toBe(422);
  });

  test('accepts honeypot without persisting lead', async ({ request }) => {
    const response = await request.post('/api/leads', {
      data: {
        ...validLeadPayload(),
        website: 'https://spam.example',
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body).toMatchObject({ ok: true, id: 0 });
  });

  test('creates lead with valid payload', async ({ request }) => {
    const response = await request.post('/api/leads', {
      data: {
        ...validLeadPayload(),
        cartItems: [
          {
            slug: 'betoneira',
            name: 'Betoneira',
            kind: 'equipment',
            quantity: 1,
          },
        ],
      },
    });

    expect(response.status()).toBe(200);
    const body = await response.json();
    expect(body.ok).toBe(true);
    expect(typeof body.id).toBe('number');
    expect(body.id).toBeGreaterThan(0);
  });
});
