import { expect, test } from '@playwright/test';
import { isolateNetwork } from './helpers.ts';

test.beforeEach(async ({ page }) => isolateNetwork(page));

const visibleNames = (page: import('@playwright/test').Page) => page.locator('#product-grid article:visible h2').allInnerTexts();

test('filters by product line and keeps the state in the URL', async ({ page }) => {
  await page.goto('/products/');
  await expect(page.locator('[data-filter-count="catalog"]')).toHaveText('6 products');
  await page.locator('form[data-filter-form] label', { hasText: 'Fixture Templates' }).click();
  await expect(page.locator('[data-filter-count="catalog"]')).toHaveText('3 of 6 products');
  expect((await visibleNames(page)).sort()).toEqual(['Fixture Bundle', 'Fixture Custom Host', 'Fixture Free Template']);
  await expect(page).toHaveURL(/line=fixture-templates/);
});

test('restores filters from a shared URL', async ({ page }) => {
  await page.goto('/products/?line=fixture-software&price=paid');
  expect((await visibleNames(page)).sort()).toEqual(['Fixture Coming Soon', 'Fixture No Checkout', 'Fixture Paid App']);
});

test('searches by text and filters by price', async ({ page }) => {
  await page.goto('/products/');
  await page.getByRole('searchbox', { name: 'Search', exact: true }).fill('bundle');
  await expect.poll(() => visibleNames(page)).toEqual(['Fixture Bundle']);
  await page.getByRole('searchbox', { name: 'Search', exact: true }).fill('');
  await page.locator('form[data-filter-form] label', { hasText: /^Free/ }).click();
  await expect.poll(() => visibleNames(page)).toEqual(['Fixture Free Template']);
});

test('sorts by price', async ({ page }) => {
  await page.goto('/products/');
  await page.locator('select[name="sort"]').selectOption('price:asc');
  await expect
    .poll(() => visibleNames(page))
    .toEqual(['Fixture Free Template', 'Fixture Paid App', 'Fixture No Checkout', 'Fixture Coming Soon', 'Fixture Bundle', 'Fixture Custom Host']);
  await page.locator('select[name="sort"]').selectOption('price:desc');
  await expect.poll(async () => (await visibleNames(page))[0]).toBe('Fixture Custom Host');
});

test('shows an empty state with a working reset', async ({ page }) => {
  await page.goto('/products/');
  await page.getByRole('searchbox', { name: 'Search', exact: true }).fill('no such product anywhere');
  const empty = page.locator('[data-filter-empty="catalog"]');
  await expect(empty).toBeVisible();
  await empty.getByRole('button', { name: 'Clear filters' }).click();
  await expect(page.locator('[data-filter-count="catalog"]')).toHaveText('6 products');
  await expect(empty).toBeHidden();
});

test('resource library filters by type', async ({ page }) => {
  await page.goto('/resources/');
  await expect(page.locator('[data-filter-count="resources"]')).toHaveText('2 resources');
  await page.locator('form[data-filter-form] label', { hasText: 'Documentation' }).click();
  await expect(page.locator('#resource-grid article:visible h2')).toHaveText(['Fixture documentation page']);
});
