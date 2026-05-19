import { expect, takeSnapshot, test } from '@chromatic-com/playwright';

test.describe('Visual regression', () => {
  test.describe('Marketing pages', () => {
    test('captures homepage', async ({ page }, testInfo) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', {
          name: 'Equipamentos para sua obra, com segurança e agilidade',
        }),
      ).toBeVisible();

      await takeSnapshot(page, testInfo);
    });

    test('captures equipment catalog', async ({ page }, testInfo) => {
      await page.goto('/equipamentos');

      await expect(page.locator('article').first()).toBeVisible();

      await takeSnapshot(page, testInfo);
    });

    test('captures sobre page', async ({ page }, testInfo) => {
      await page.goto('/sobre');

      await expect(page.locator('main')).toBeVisible();

      await takeSnapshot(page, testInfo);
    });
  });
});
