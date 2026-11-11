import { expect, test } from '@playwright/test';
import { isolateNetwork, trackProblems } from './helpers.ts';

/**
 * The optional multi-product homepage (`homepage: 'portfolio'`), built from the
 * same fixtures into dist-fixtures-portfolio/ and served on its own port.
 * Keeps the extensible architecture working while the live site runs in
 * single-product mode.
 */
test.beforeEach(async ({ page }) => isolateNetwork(page));

test('portfolio navigation lists the catalog sections and marks the current page', async ({ page }) => {
  await page.goto('/solutions/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link')).toHaveText(['Home', 'Products', 'Solutions', 'Resources', 'About', 'Contact']);
  await expect(nav.getByRole('link', { name: 'Solutions' })).toHaveAttribute('aria-current', 'page');
});

test('the portfolio homepage shows product lines instead of the product landing page', async ({ page }) => {
  const problems = await trackProblems(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fixture hero title for tests.');
  await expect(page.locator('section#demo')).toHaveCount(0);
  await expect(page.locator('section[aria-labelledby="hero-title"]').getByRole('link', { name: 'Explore products' })).toHaveAttribute('href', '/products/');
  await expect(page.locator('main')).toContainText('Fixture Software');
  expect(problems.console).toEqual([]);
});

test('the homepage task finder filters tasks and opens the matching solution', async ({ page }) => {
  await page.goto('/');
  const finder = page.locator('[data-task-finder]');
  const input = finder.getByRole('searchbox', { name: /What needs doing/ });
  await input.fill('nothing matches this');
  await expect(finder.locator('[data-task-empty]')).toBeVisible();
  await expect(finder.locator('[data-task]:visible')).toHaveCount(0);
  await input.fill('invoices');
  await expect(finder.locator('[data-task]:visible').first()).toContainText('Fixture task about invoices');
  await input.press('Enter');
  await expect(page).toHaveURL(/\/solutions\/fixture-solution\/$/);
});

test('newsletter form posts straight to the provider in a new tab', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('[data-newsletter-form]');
  await expect(form).toHaveAttribute('action', 'https://buttondown.com/api/emails/embed-subscribe/fixture-studio');
  await expect(form).toHaveAttribute('method', 'post');
  await expect(form).toHaveAttribute('target', '_blank');
  await expect(form.locator('input[type="email"]')).toHaveAttribute('name', 'email');
  await expect(form.locator('input[name="embed"]')).toHaveValue('1');
});

test('the contact form offers product support in portfolio mode', async ({ page }) => {
  await page.goto('/contact/?topic=support');
  await expect(page.getByRole('radio', { name: 'Product support' })).toBeChecked();
});

test('the 404 page links to the catalog sections', async ({ page }) => {
  const response = await page.goto('/no/such/page/');
  expect(response?.status()).toBe(404);
  const main = page.locator('main');
  for (const name of ['Products', 'Solutions', 'Resources', 'Support']) await expect(main.getByRole('link', { name, exact: true })).toBeVisible();
});
