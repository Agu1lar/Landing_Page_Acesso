import { expect, test } from '@playwright/test';

/**
 * Category landing pages expose CollectionPage, BreadcrumbList and ItemList in JSON-LD.
 */
test.describe('Category SEO', () => {
  test('concretagem page includes category json-ld graph', async ({ page }) => {
    await page.goto('/categorias/concretagem');

    await expect(page.getByRole('heading', { level: 1 })).toContainText(/concretagem/i);

    const jsonLdBlocks = await page.locator('script[type="application/ld+json"]').allTextContents();
    const payload = jsonLdBlocks.join('');

    expect(payload).toContain('CollectionPage');
    expect(payload).toContain('BreadcrumbList');
    expect(payload).toContain('ItemList');
    expect(payload).toContain('/equipamentos/');
    expect(payload).toContain('/categorias/concretagem');
  });
});
