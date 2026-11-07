import { expect, test } from '@playwright/test';
import { isolateNetwork } from './helpers.ts';

test.beforeEach(async ({ page }) => isolateNetwork(page));

const productLd = async (page: import('@playwright/test').Page) => {
  const blocks = await page.locator('script[type="application/ld+json"]').allTextContents();
  return blocks
    .flatMap((text) => {
      const data = JSON.parse(text) as unknown;
      return Array.isArray(data) ? data : [data];
    })
    .filter((item): item is { '@type': string; offers: unknown[] } => (item as { '@type'?: string })['@type'] === 'Product');
};

test('verified checkout links render as purchase buttons with the provider named', async ({ page }) => {
  await page.goto('/products/fixture-software/fixture-paid-app/');
  const checkouts = page.locator('[data-checkout]');
  await expect(checkouts).toHaveCount(3);
  await expect(page.locator('[data-checkout="gumroad"]')).toHaveAttribute('href', 'https://fixture.gumroad.com/l/paid-app');
  await expect(page.locator('[data-checkout="stripe"]')).toHaveAttribute('href', 'https://buy.stripe.com/test_fixture123');
  await expect(page.locator('[data-checkout="lemonsqueezy"]')).toContainText('Buy annual license');
  await expect(page.getByText('Secure checkout on Gumroad')).toBeVisible();
  await expect(page.locator('[data-offer="monthly"]')).toContainText('Recommended');

  const products = await productLd(page);
  expect(products).toHaveLength(1);
  expect(products[0]?.offers).toHaveLength(3);
});

test('a coming-soon product never offers checkout, even with a checkout URL configured', async ({ page }) => {
  await page.goto('/products/fixture-software/fixture-coming-soon/');
  await expect(page.locator('[data-checkout]')).toHaveCount(0);
  await expect(page.locator('[data-unavailable="not-released"]')).toContainText('Coming soon');
  await expect(page.getByRole('link', { name: 'Get notified when it’s ready' })).toBeVisible();
  expect(await productLd(page)).toHaveLength(0);
  expect(await page.content()).not.toContain('should-not-render');
});

test('an available product without a checkout URL shows an honest unavailable state', async ({ page }) => {
  await page.goto('/products/fixture-software/fixture-no-checkout/');
  await expect(page.locator('[data-checkout]')).toHaveCount(0);
  await expect(page.locator('[data-unavailable="no-checkout"]')).toContainText('Checkout not yet available');
  expect(await productLd(page)).toHaveLength(0);
});

test('free products download directly from the site', async ({ page, request }) => {
  await page.goto('/products/fixture-templates/fixture-free-template/');
  const download = page.locator('[data-download]');
  await expect(download).toHaveAttribute('href', '/downloads/document-inventory-template.csv');
  await expect(download).toHaveAttribute('download', '');
  expect((await request.get('/downloads/document-inventory-template.csv')).status()).toBe(200);
});

test('custom checkout hosts from site config are allowed, and custom pricing routes to contact', async ({ page }) => {
  await page.goto('/products/fixture-templates/fixture-custom-host/');
  await expect(page.locator('[data-checkout="custom"]')).toHaveAttribute('href', 'https://store.test-studio.dev/buy/team');
  await expect(page.getByRole('link', { name: 'Contact us for pricing' })).toHaveAttribute(
    'href',
    '/contact/?topic=business&product=fixture-custom-host',
  );
});

test('bundles list what they include and show early access', async ({ page }) => {
  await page.goto('/products/fixture-templates/fixture-bundle/');
  await expect(page.locator('main').getByText('Early access').first()).toBeVisible();
  const included = page.locator('h2:has-text("In this bundle") + ul');
  await expect(included.getByRole('link', { name: 'Fixture Paid App' })).toBeVisible();
  await expect(included.getByRole('link', { name: 'Fixture Free Template' })).toBeVisible();
  await expect(page.locator('[data-checkout="payhip"]')).toBeVisible();
});

test('product cards summarize pricing', async ({ page }) => {
  await page.goto('/products/');
  const card = (name: string) => page.locator('#product-grid article', { hasText: name });
  await expect(card('Fixture Paid App')).toContainText('From $9 / month');
  await expect(card('Fixture Free Template')).toContainText('Free');
  await expect(card('Fixture Bundle')).toContainText('$59');
});
