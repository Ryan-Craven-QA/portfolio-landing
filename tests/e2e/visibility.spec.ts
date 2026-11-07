import { expect, test } from '@playwright/test';
import { HIDDEN_NAMES, HIDDEN_ROUTES, PUBLIC_PRODUCTS, isolateNetwork } from './helpers.ts';

test.beforeEach(async ({ page }) => isolateNetwork(page));

test.describe('drafts and hidden content are never published', () => {
  for (const route of HIDDEN_ROUTES) {
    test(`${route} returns 404`, async ({ page }) => {
      const response = await page.goto(route);
      expect(response?.status()).toBe(404);
    });
  }

  test('the catalog lists exactly the public products', async ({ page }) => {
    await page.goto('/products/');
    const names = await page.locator('#product-grid article h2').allInnerTexts();
    expect(names.sort()).toEqual([...PUBLIC_PRODUCTS].sort());
  });

  test('search index, sitemap and RSS contain no hidden entries', async ({ request }) => {
    for (const path of ['/search.json', '/sitemap-0.xml', '/rss.xml']) {
      const body = await (await request.get(path)).text();
      for (const name of HIDDEN_NAMES) expect(body, `${path} leaks "${name}"`).not.toContain(name);
      for (const route of HIDDEN_ROUTES) expect(body, `${path} leaks ${route}`).not.toContain(route);
    }
    const index = (await (await request.get('/search.json')).json()) as Array<{ t: string }>;
    expect(index.map((record) => record.t)).toContain('Fixture Paid App');
    const sitemap = await (await request.get('/sitemap-0.xml')).text();
    expect(sitemap).toContain('/products/fixture-software/fixture-paid-app/');
  });

  test('hidden product lines are absent from navigation and the footer', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer[data-site-footer]');
    await expect(footer).toContainText('Fixture Software');
    await expect(footer).not.toContainText('Fixture Hidden Line');
    await expect(page.locator('#mobile-menu')).not.toContainText('Fixture Hidden Line');
  });

  test('only published FAQs are shown', async ({ page }) => {
    await page.goto('/support/');
    await expect(page.getByText('Fixture published question?')).toBeVisible();
    await expect(page.getByText('Fixture draft question must not appear?')).toHaveCount(0);
    await expect(page.getByText('Fixture hidden line question must not appear?')).toHaveCount(0);
  });

  test('only published legal pages are linked', async ({ page }) => {
    await page.goto('/');
    const footer = page.locator('footer[data-site-footer]');
    await expect(footer.getByRole('link', { name: 'Privacy' })).toHaveAttribute('href', '/legal/privacy/');
    await expect(footer.getByRole('link', { name: 'Terms' })).toHaveCount(0);
  });

  test('a public resource does not link draft products', async ({ page }) => {
    await page.goto('/resources/fixture-guide/');
    await expect(page.getByRole('link', { name: 'Fixture Paid App' }).first()).toBeVisible();
    await expect(page.getByText('Fixture Draft Product')).toHaveCount(0);
  });
});
