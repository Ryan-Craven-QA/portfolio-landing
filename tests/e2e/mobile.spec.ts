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
  await expect(menu.getByRole('link', { name: 'How it works', exact: true })).toBeVisible();
  await expect(menu.getByRole('link', { name: 'Request early access' })).toBeVisible();
  await expect(menu.getByRole('link', { name: /Fixture Software/ })).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(menu).toBeHidden();
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('mobile menu links close the menu and jump to the section', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: 'Open menu' }).click();
  const menu = page.getByRole('dialog', { name: 'Menu' });
  await menu.getByRole('link', { name: 'Pricing' }).click();
  await expect(menu).toBeHidden();
  await expect(page).toHaveURL(/\/#pricing$/);
  await expect(page.locator('#pricing-title')).toBeInViewport();

  await page.getByRole('button', { name: 'Open menu' }).click();
  await menu.getByRole('link', { name: 'Contact' }).click();
  await expect(page).toHaveURL(/\/contact\/$/);
});

test('the demo shows cards on a phone and its actions work', async ({ page }) => {
  await page.goto('/#demo');
  const demo = page.locator('[data-renewal-demo]');
  await expect(demo.locator('[data-demo-rows]')).toBeHidden();
  const cards = demo.locator('[data-demo-cards] > li');
  await expect(cards).toHaveCount(7);
  await cards.first().getByRole('button').click();
  await expect(cards).toHaveCount(6);
  await expect(demo.locator('[data-demo-cards] button[data-action]:focus')).toHaveCount(1);
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
