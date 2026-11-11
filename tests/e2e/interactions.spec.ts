import { expect, test } from '@playwright/test';
import { isolateNetwork } from './helpers.ts';

test.beforeEach(async ({ page }) => isolateNetwork(page));

test('primary navigation shows the product sections and marks the current page', async ({ page }) => {
  await page.goto('/contact/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link')).toHaveText(['How it works', 'Demo', 'Features', 'Pricing', 'FAQ', 'Contact']);
  await expect(nav.getByRole('link', { name: 'Contact' })).toHaveAttribute('aria-current', 'page');
  await expect(nav.getByRole('link', { name: 'Pricing' })).toHaveAttribute('href', '/#pricing');
  await expect(nav.getByRole('link', { name: 'Pricing' })).not.toHaveAttribute('aria-current', 'page');
});

test('the skip link moves focus to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await skip.press('Enter');
  await expect(page).toHaveURL(/#main$/);
});

test('theme defaults to dark, toggles, and persists across pages', async ({ page }) => {
  await page.goto('/');
  const html = page.locator('html');
  await expect(html).toHaveAttribute('data-theme', 'dark');
  await page.locator('header [data-theme-toggle]').click();
  await expect(html).toHaveAttribute('data-theme', 'light');
  await expect(page.locator('header [data-theme-toggle]')).toHaveAttribute('aria-label', 'Switch to dark theme');
  await page.goto('/about/');
  await expect(html).toHaveAttribute('data-theme', 'light');
});

test('site search opens with "/" and Ctrl+K and navigates with the keyboard', async ({ page }) => {
  await page.goto('/about/');
  await page.keyboard.press('/');
  const dialog = page.getByRole('dialog', { name: 'Search the site' });
  await expect(dialog).toBeVisible();
  const input = dialog.getByRole('combobox');
  await expect(input).toBeFocused();
  await input.fill('paid app');
  await expect(dialog.getByRole('option', { name: /Fixture Paid App/ })).toBeVisible();
  await expect(input).toHaveAttribute('aria-activedescendant', /search-option-0/);
  await input.press('Enter');
  await expect(page).toHaveURL(/\/products\/fixture-software\/fixture-paid-app\/$/);
  await page.waitForLoadState('load');

  await page.keyboard.press('Control+k');
  await expect(dialog).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(dialog).toBeHidden();
});

test('search shows a friendly message when nothing matches', async ({ page }) => {
  await page.goto('/');
  await page.locator('header button[data-search-open]').first().click();
  const dialog = page.getByRole('dialog', { name: 'Search the site' });
  await dialog.getByRole('combobox').fill('zzzz-nothing');
  await expect(dialog.locator('[data-search-empty]')).toBeVisible();
});

test('unknown URLs return the 404 page', async ({ page }) => {
  const response = await page.goto('/this/does/not/exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('We couldn’t find that page.');
  await expect(page.locator('main').getByRole('link', { name: 'Interactive demo' })).toHaveAttribute('href', '/#demo');
});

test('resource pages render a table of contents and code blocks', async ({ page }) => {
  await page.goto('/resources/fixture-guide/');
  const toc = page.getByRole('navigation', { name: 'On this page' });
  await expect(toc.getByRole('link')).toHaveText(['First section', 'Second section']);
  await expect(page.locator('.prose pre code')).toContainText('const fixture');
  await expect(page.locator('#download a[data-download]')).toHaveAttribute('href', '/downloads/wordpress-maintenance-checklist.csv');
});
