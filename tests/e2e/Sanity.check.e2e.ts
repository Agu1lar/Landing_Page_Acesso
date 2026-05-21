import { expect, test } from '@playwright/test';

// Checkly runs this file after deploy (*.check.e2e.ts).
// Validates the marketing site is up on preview/production.

test.describe('Sanity', () => {
  test.describe('Marketing site', () => {
    test('displays homepage', async ({ page }) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', {
          name: 'Equipamentos para sua obra, com segurança e agilidade',
        }),
      ).toBeVisible();

      await expect(page.getByRole('link', { name: 'Equipamentos' }).first()).toBeVisible();
    });

    test('opens equipment catalog', async ({ page }) => {
      await page.goto('/equipamentos');

      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      await expect(page.locator('article').first()).toBeVisible();
    });

    test('opens quote page', async ({ page }) => {
      await page.goto('/orcamento');

      await expect(page.getByLabel('Nome completo *')).toBeVisible();
      await expect(
        page.getByRole('button', { name: 'Enviar solicitação de orçamento' }),
      ).toBeVisible();
    });
  });
});
