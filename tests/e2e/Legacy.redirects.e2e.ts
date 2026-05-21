import { expect, test } from '@playwright/test';

test.describe('WordPress legacy 301 redirects', () => {
  test('redirects blog index to faq', async ({ request }) => {
    const response = await request.get('/blog/', { maxRedirects: 0 });

    expect(response.status()).toBe(301);
    expect(response.headers().location).toMatch(/\/faq$/u);
  });

  test('redirects aerial blog post to category page', async ({ request }) => {
    const response = await request.get(
      '/plataforma-elevatoria-tesoura-a-solucao-ideal-para-trabalhos-em-altura/',
      { maxRedirects: 0 },
    );

    expect(response.status()).toBe(301);
    expect(response.headers().location).toMatch(/\/categorias\/equipamentos-aereos$/u);
  });

  test('redirects wp category archive to equipamentos', async ({ request }) => {
    const response = await request.get('/category/plataformas-elevatorias/', {
      maxRedirects: 0,
    });

    expect(response.status()).toBe(301);
    expect(response.headers().location).toMatch(/\/equipamentos$/u);
  });

  test('leaves marketing routes unchanged', async ({ request }) => {
    const response = await request.get('/orcamento', { maxRedirects: 0 });

    expect(response.status()).toBe(200);
  });
});
