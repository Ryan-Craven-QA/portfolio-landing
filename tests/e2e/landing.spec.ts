import { expect, test, type Page } from '@playwright/test';
import { isolateNetwork, trackProblems } from './helpers.ts';

/** The single-product landing page (fixture build, `homepage: 'product'`). */
test.beforeEach(async ({ page }) => isolateNetwork(page));

const demoOf = (page: Page) => page.locator('[data-renewal-demo]');
const view = (page: Page, name: RegExp) => demoOf(page).locator('[data-demo-controls] label', { hasText: name });

test('one headline, every section, and the scope disclaimer', async ({ page }) => {
  const problems = await trackProblems(page);
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Fixture hero title for tests.');
  for (const id of ['problem', 'solution', 'demo', 'features', 'how-it-works', 'who-its-for', 'pricing', 'faq', 'register', 'contact']) {
    await expect(page.locator(`section#${id}`), `#${id}`).toHaveCount(1);
  }
  // The eyebrow says registration is open only because the fixture has a form.
  await expect(page.locator('section[aria-labelledby="hero-title"] .eyebrow').first()).toHaveText('Fixture eyebrow · Early access open');
  await expect(page.locator('section#solution')).toContainText('It does not review documents, verify insurance coverage, determine legal compliance');
  await expect(page.locator('footer [data-disclaimer]')).toHaveText('Fixture disclaimer: administrative tracking only.');
  expect(problems.console).toEqual([]);
});

test('header links jump to landing sections and the hero leads to registration', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  await expect(nav.getByRole('link')).toHaveText(['How it works', 'Demo', 'Features', 'Pricing', 'FAQ', 'Contact']);
  await nav.getByRole('link', { name: 'Pricing' }).click();
  await expect(page).toHaveURL(/\/#pricing$/);
  await expect(page.locator('#pricing-title')).toBeInViewport();

  const hero = page.locator('section[aria-labelledby="hero-title"]');
  await expect(hero.getByRole('link', { name: 'Request early access' })).toHaveAttribute('href', '/#register');
  await hero.getByRole('link', { name: 'Try the demo' }).click();
  await expect(page.locator('#demo-title')).toBeInViewport();
});

test('the demo is labelled fictional and filters by view, owner, search and sort', async ({ page }) => {
  await page.goto('/');
  const demo = demoOf(page);
  const rows = demo.locator('[data-demo-rows] tr');
  await expect(demo).toContainText('Fictional vendors and people');
  await expect(demo).toContainText('Nothing is saved or sent');
  await expect(rows).toHaveCount(7);
  await expect(demo.locator('[data-count="action"]')).toHaveText('7');

  await view(page, /Waiting on vendor/).click();
  await expect(rows).toHaveCount(1);
  await expect(rows.first()).toContainText('Glimmerlake Pool Service');
  await expect(demo.locator('[data-demo-status]')).toHaveText('Waiting on vendor: showing 1 of 14 documents');

  await view(page, /^\s*All/).click();
  await expect(rows).toHaveCount(14);
  await demo.getByLabel('Sort').selectOption('vendor');
  await expect(rows.first()).toContainText('Bluestem Painting');
  await demo.getByLabel('Following up').selectOption('dana');
  await expect(rows).toHaveCount(4);
  await demo.getByLabel('Search').fill('quillfeather');
  await expect(rows).toHaveCount(2);

  await demo.getByLabel('Search').fill('no such vendor');
  await expect(demo.locator('[data-demo-empty]')).toBeVisible();
  await demo.getByRole('button', { name: 'Show everything' }).click();
  await expect(rows).toHaveCount(14);
  await expect(demo.getByLabel('Following up')).toHaveValue('');
});

test('demo actions move a renewal along, keep focus, and never touch the network', async ({ page }) => {
  await page.goto('/');
  const demo = demoOf(page);
  const sent: string[] = [];
  page.on('request', (request) => {
    const url = new URL(request.url());
    if (request.method() !== 'GET' || url.hostname !== 'localhost') sent.push(`${request.method()} ${request.url()}`);
  });

  await demo.getByRole('button', { name: 'Mark request sent: Brassbell Electric, Certificate of insurance' }).click();
  await expect(demo.locator('[data-count="action"]')).toHaveText('6');
  await expect(demo.locator('[data-count="waiting"]')).toHaveText('2');
  await expect(demo.locator('[data-demo-status]')).toContainText('It moved to “Waiting on vendor”. Demo only — nothing was sent.');
  await expect(demo.locator('[data-demo-log] li').first()).toHaveText('Renewal request marked as sent — Brassbell Electric, Certificate of insurance.');
  // Focus moves to the action that took the row's place, not into the void.
  await expect(demo.locator('[data-demo-rows] button[data-action]:focus')).toHaveCount(1);

  await view(page, /Waiting on vendor/).click();
  await demo.getByRole('button', { name: 'Mark received: Brassbell Electric, Certificate of insurance' }).click();
  await view(page, /Needs action/).click();
  const record = demo.getByRole('button', { name: 'Record new date: Brassbell Electric, Certificate of insurance' });
  await record.click();
  await expect(demo.locator('[data-count="current"]')).toHaveText('5');
  await expect(demo.locator('[data-demo-log] li').first()).toContainText('New expiration date recorded');

  await demo.getByRole('button', { name: 'Reset demo' }).click();
  await expect(demo.locator('[data-count="action"]')).toHaveText('7');
  await expect(demo.locator('[data-count="current"]')).toHaveText('4');
  await expect(demo.locator('[data-demo-log-wrap]')).toBeHidden();
  await expect(demo.locator('[data-demo-status]')).toHaveText('Demo reset to the original sample data.');
  expect(sent).toEqual([]);
});

test('pricing is clearly planned, with no way to pay', async ({ page }) => {
  await page.goto('/');
  const pricing = page.locator('section#pricing');
  await expect(pricing).toContainText('Nothing is for sale yet');
  await expect(pricing.getByText('Not available to buy yet')).toHaveCount(2);
  await expect(pricing.getByText(/^Planned (price|range)$/)).toHaveCount(2);
  await expect(pricing.getByText('Open now')).toBeVisible();
  await expect(pricing.locator('a[href^="http"], [data-checkout]')).toHaveCount(0);
  for (const link of await pricing.getByRole('link').all()) await expect(link).toHaveAttribute('href', '/#register');
});

test('pricing buttons preselect what the visitor asked for', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('form[data-early-access-form]');
  await page.locator('section#pricing').getByRole('link', { name: 'Request an interview' }).click();
  await expect(form.getByRole('radio', { name: 'A 20-minute interview' })).toBeChecked();
  await expect(form.locator('[data-submit-label]')).toHaveText('Request an interview');
  await expect(form.locator('input[name="_subject"]')).toHaveValue('A 20-minute interview — Fixture Studio');
});

test('FAQ answers expand in place', async ({ page }) => {
  await page.goto('/');
  const faq = page.locator('section#faq');
  const first = faq.locator('details').first();
  await expect(first).not.toHaveAttribute('open', '');
  await first.locator('summary').click();
  await expect(first).toHaveAttribute('open', '');
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('the demo still shows the sample data and the form still posts to the provider', async ({ page }) => {
    await page.goto('/');
    const demo = demoOf(page);
    await expect(demo.locator('[data-demo-rows] tr')).toHaveCount(7);
    await expect(demo.locator('[data-demo-controls]')).toBeHidden();
    await expect(demo).toContainText('Filters and demo actions need JavaScript.');
    const form = page.locator('form[data-early-access-form]');
    await expect(form).toHaveAttribute('action', 'https://formspree.io/f/fixture123');
    await expect(form).toHaveAttribute('method', 'post');
  });
});
