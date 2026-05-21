import { expect, test } from '@playwright/test';

const aerialSlug = 'plataforma-elevatoria-hb-1430';
const aerialName = 'Plataforma elevatória HB 1430';

test.describe('Marketing conversion flows', () => {
  test.describe('Home and catalog', () => {
    test('displays home hero and brand trust signals', async ({ page }) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', {
          name: 'Equipamentos para sua obra, com segurança e agilidade',
        }),
      ).toBeVisible();

      await expect(page.getByText('Desde 2013 · Região metropolitana de BH')).toBeVisible();
      await expect(page.getByText('Empresa desde 2013', { exact: true })).toBeVisible();
    });

    test('displays client logo images in trust section', async ({ page }) => {
      await page.goto('/');

      await expect(
        page.getByRole('heading', { name: 'Empresas que confiam na Acesso em Minas Gerais' }),
      ).toBeVisible();

      const logos = page.locator('section[aria-labelledby="client-logos-title"] img');
      await expect(logos).toHaveCount(6);
      await expect(logos.first()).toHaveAttribute('src', /\/clientes\/[\w-]+\.webp/u);
    });

    test('navigates home to equipment detail via catalog link', async ({ page }) => {
      await page.goto('/equipamentos');

      await page
        .getByRole('link', { name: /betoneira/i })
        .first()
        .click();

      await expect(page).toHaveURL(/\/equipamentos\/betoneira/u);
      await expect(page.getByRole('heading', { level: 1 })).toContainText(/betoneira/i);
    });

    test('opens aerial equipment detail with specs section', async ({ page }) => {
      await page.goto(`/equipamentos/${aerialSlug}`);

      await expect(page.getByRole('heading', { level: 1, name: aerialName })).toBeVisible();
      await expect(page.getByText(/sob consulta/i).first()).toBeVisible();
    });
  });

  test.describe('Quote funnel', () => {
    test('prefills equipment on orcamento from query string', async ({ page }) => {
      await page.goto(`/orcamento?equipamento=${aerialSlug}`);

      await expect(page.getByText(`Equipamento de interesse: ${aerialName}`)).toBeVisible();
    });

    test('submits quote form and shows success message', async ({ page }) => {
      await page.goto('/orcamento');

      await page.getByLabel('Nome completo *').fill('Teste E2E Sprint 8');
      await page.getByLabel('E-mail *').fill('e2e-sprint8@example.com');
      await page.getByLabel('Telefone / WhatsApp *').fill('31999990000');
      await page.getByLabel('Cidade da obra *').fill('Belo Horizonte');
      await page.getByLabel('Período de locação').selectOption('semanal');

      await page.getByRole('button', { name: 'Enviar solicitação de orçamento' }).click();

      await expect(page.getByRole('status')).toContainText('Pedido enviado!');
    });

    test('shows whatsapp quote action on orcamento page', async ({ page }) => {
      await page.goto('/orcamento');

      await expect(
        page.getByRole('button', { name: 'Enviar orçamento pelo WhatsApp' }),
      ).toBeVisible();
    });
  });

  test.describe('Institutional pages', () => {
    test('loads key marketing routes', async ({ page }) => {
      const routes = ['/sobre', '/contato', '/faq', '/treinamento-plataformas-aereas'];

      for (const route of routes) {
        await page.goto(route);
        await expect(page.locator('main')).toBeVisible();
      }
    });
  });
});
