import { expect, test } from '@playwright/test';
import { PUBLIC_ROUTES, isolateNetwork } from './helpers.ts';

/** Runs in the "mobile" project (Pixel 7 viewport). */
test.beforeEach(async ({ page }) => isolateNetwork(page));

test('the mobile menu opens as a modal, traps focus and closes with Escape', async ({ page }) => {
  await page.goto('/');
  const toggle = page.getByRole('button', { name: 'Open menu' });
  await expect(toggle).toBeVisible();
  await expect(page.getByRole('navigation', { name: 'Primary' })).toBeHidden();
  await toggle.click();
  const menu = page.getByRole('dialog', { name: 'Menu' });
  await expect(menu).toBeVisible();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(menu.getByRole('link', { name: 'Products', exact: true })).toBeVisible();
  await expect(menu.getByRole('link', { name: /Fixture Software/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('mobile menu links navigate', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  await page.getByRole('dialog', { name: 'Menu' }).getByRole('link', { name: 'Resources' }).click();
  await expect(page).toHaveURL(/\/resources\/$/);
});

test('catalog filters are collapsed behind a toggle on small screens', async ({ page }) => {
  await page.goto('/products/');
  const panel = page.locator('details[data-filter-panel]');
  await expect(panel).not.toHaveAttribute('open', '');
  await panel.locator('summary').click();
  await expect(page.getByRole('searchbox', { name: 'Search', exact: true })).toBeVisible();
});

for (const route of PUBLIC_ROUTES) {
  test(`${route} has no horizontal overflow on a phone`, async ({ page }) => {
    await page.goto(route);
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}
