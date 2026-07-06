import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

async function acceptCookieConsentIfVisible(page: Page) {
  const dialog = page.getByRole('dialog', { name: 'Cookies e privacidade' });
  if (await dialog.isVisible()) {
    await page.getByRole('button', { name: 'Aceitar analytics' }).click();
    await expect(dialog).toBeHidden();
  }
}

function formatAxeViolations(
  violations: Awaited<ReturnType<AxeBuilder['analyze']>>['violations'],
) {
  return violations
    .map((violation) => {
      const nodes = violation.nodes.map((node) => node.html).join('\n');
      return `[${violation.impact}] ${violation.id}: ${violation.help}\n${nodes}`;
    })
    .join('\n\n');
}

test.describe('Accessibility', () => {
  test('cookie banner traps focus and starts on accept action', async ({ page }) => {
    await page.goto('/orcamento');

    const accept = page.getByRole('button', { name: 'Aceitar analytics' });
    await expect(accept).toBeVisible();
    await expect(accept).toBeFocused();

    await accept.press('Tab');
    await expect(page.getByRole('link', { name: 'Política de privacidade' })).toBeFocused();

    await page.keyboard.press('Shift+Tab');
    await expect(accept).toBeFocused();
  });

  test('quote form exposes validation errors to assistive tech', async ({ page }) => {
    await page.goto('/orcamento');
    await acceptCookieConsentIfVisible(page);

    await page.getByRole('button', { name: 'Enviar orçamento pelo WhatsApp' }).click();

    await expect(page.getByLabel('Nome completo *')).toHaveAttribute('aria-invalid', 'true');
    await expect(page.getByLabel('Nome completo *')).toHaveAttribute('aria-describedby', /.+/);
    await expect(page.getByRole('alert').first()).toBeVisible();
  });

  test('mobile menu closes with Escape and returns focus to toggle', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/orcamento');
    await acceptCookieConsentIfVisible(page);

    const menuButton = page.getByRole('button', { name: 'Menu' });
    await expect(menuButton).toBeVisible();
    await menuButton.click();

    const mobileNav = page.locator('#site-mobile-nav');
    await expect(mobileNav).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(mobileNav).toHaveCount(0);
    await expect(menuButton).toBeFocused();
  });

  test('orcamento has no serious axe violations after cookie consent', async ({ page }) => {
    await page.goto('/orcamento');
    await acceptCookieConsentIfVisible(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const serious = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    );

    expect(serious, formatAxeViolations(serious)).toEqual([]);
  });

  test('home has no serious axe violations after cookie consent', async ({ page }) => {
    await page.goto('/');
    await acceptCookieConsentIfVisible(page);

    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa'])
      .analyze();

    const serious = results.violations.filter(
      (violation) => violation.impact === 'critical' || violation.impact === 'serious',
    );

    expect(serious, formatAxeViolations(serious)).toEqual([]);
  });
});
