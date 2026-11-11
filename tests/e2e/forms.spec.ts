import { expect, test } from '@playwright/test';
import { isolateNetwork } from './helpers.ts';

const FORMSPREE = 'https://formspree.io/f/fixture123';

test.beforeEach(async ({ page }) => isolateNetwork(page));

test('contact form prefills topic and product from the URL', async ({ page }) => {
  await page.goto('/contact/?topic=feedback&product=fixture-paid-app');
  await expect(page.getByRole('radio', { name: 'Feedback or an idea' })).toBeChecked();
  await expect(page.getByLabel('Product (optional)')).toHaveValue('fixture-paid-app');
  // Single-product mode offers no "product support" topic: nothing is on sale to support.
  await expect(page.getByRole('radio', { name: 'Product support' })).toHaveCount(0);
});

test('contact form posts to the configured provider and confirms success', async ({ page }) => {
  let body = '';
  await page.route(FORMSPREE, async (route) => {
    body = route.request().postData() ?? '';
    expect(route.request().headers().accept).toBe('application/json');
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/contact/?topic=business');
  await page.getByLabel('Name', { exact: true }).fill('Ada Lovelace');
  await page.getByLabel('Email', { exact: true }).fill('ada@example.com');
  await page.getByLabel('Message', { exact: true }).fill('I would like to ask about an agency license.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByRole('heading', { name: 'Message sent.' })).toBeFocused();
  for (const expected of ['Ada Lovelace', 'ada@example.com', 'agency license', 'business', 'Business inquiry — Fixture Studio']) {
    expect(body).toContain(expected);
  }
});

test('contact form reports failures and offers the email fallback', async ({ page }) => {
  await page.route(FORMSPREE, (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{"errors":[{"message":"Server error"}]}' }));
  await page.goto('/contact/');
  await page.getByLabel('Name', { exact: true }).fill('Ada');
  await page.getByLabel('Email', { exact: true }).fill('ada@example.com');
  await page.getByLabel('Message', { exact: true }).fill('Testing the failure path.');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.locator('[data-form-status]')).toContainText('could not be sent');
  await expect(page.locator('[data-form-status]')).toContainText('hello@fixtures.test-studio.dev');
  await expect(page.getByRole('button', { name: 'Send message' })).toBeEnabled();
});

test('contact form does not submit when required fields are empty', async ({ page }) => {
  let called = false;
  await page.route(FORMSPREE, (route) => {
    called = true;
    return route.fulfill({ status: 200, body: '{"ok":true}' });
  });
  await page.goto('/contact/');
  await page.getByRole('button', { name: 'Send message' }).click();
  await expect(page.getByLabel('Name', { exact: true })).toBeFocused();
  expect(called).toBe(false);
});

test('the honeypot field is present but hidden', async ({ page }) => {
  await page.goto('/contact/');
  const honeypot = page.locator('input[name="_gotcha"]');
  await expect(honeypot).toHaveCount(1);
  await expect(honeypot).toBeHidden();
});

/* ───────────────────────── early-access registration ───────────────────────── */

async function fillEarlyAccess(page: import('@playwright/test').Page) {
  const form = page.locator('form[data-early-access-form]');
  await form.getByLabel('Name', { exact: true }).fill('Grace Hopper');
  await form.getByLabel('Work email').fill('grace@example.com');
  await form.getByLabel('Company').fill('Example Property Co');
  await form.getByLabel('Your role (optional)').selectOption('Property manager');
  await form.getByLabel('Vendors you work with').selectOption('26–50');
  await form.getByLabel('How you track them today (optional)').selectOption('Spreadsheet');
  await form.getByLabel('What’s the hardest part today? (optional)').fill('Certificates expire before anyone notices.');
  await form.getByRole('checkbox').check();
  return form;
}

test('early-access form posts the registration to the provider and confirms in place', async ({ page }) => {
  let body = '';
  await page.route(FORMSPREE, async (route) => {
    body = route.request().postData() ?? '';
    expect(route.request().method()).toBe('POST');
    expect(route.request().headers().accept).toBe('application/json');
    await route.fulfill({ status: 200, contentType: 'application/json', body: '{"ok":true}' });
  });
  await page.goto('/?interest=both#register');
  const form = await fillEarlyAccess(page);
  await expect(form.getByRole('radio', { name: 'Both' })).toBeChecked();
  await form.getByRole('button', { name: 'Send my request' }).click();

  await expect(page.getByRole('heading', { name: 'Thanks — you’re on the list.' })).toBeFocused();
  await expect(page.locator('[data-early-access-root] [data-form-success]')).toContainText('within two business days');
  await expect(page.locator('[data-early-access-root] [data-form-success]').getByRole('link', { name: /Pick a time/ })).toHaveAttribute(
    'href',
    'https://cal.com/fixture-studio/intro',
  );
  for (const expected of ['early-access', 'both', 'Grace Hopper', 'grace@example.com', 'Example Property Co', 'Property manager', '26', 'Spreadsheet', 'consent', 'Both — Fixture Studio']) {
    expect(body, expected).toContain(expected);
  }
});

test('early-access form requires the essentials and consent before sending', async ({ page }) => {
  let called = false;
  await page.route(FORMSPREE, (route) => {
    called = true;
    return route.fulfill({ status: 200, body: '{"ok":true}' });
  });
  await page.goto('/#register');
  const form = page.locator('form[data-early-access-form]');
  await form.getByRole('button', { name: 'Request early access' }).click();
  await expect(form.getByLabel('Name', { exact: true })).toBeFocused();
  await fillEarlyAccess(page);
  await form.getByRole('checkbox').uncheck();
  await form.getByRole('button', { name: 'Request early access' }).click();
  await expect(form.getByRole('checkbox')).toBeFocused();
  expect(called).toBe(false);
});

test('early-access form reports failures and keeps what was typed', async ({ page }) => {
  await page.route(FORMSPREE, (route) => route.fulfill({ status: 500, contentType: 'application/json', body: '{"errors":[{"message":"Server error"}]}' }));
  await page.goto('/#register');
  const form = await fillEarlyAccess(page);
  await form.getByRole('button', { name: 'Request early access' }).click();
  await expect(form.locator('[data-form-status]')).toContainText('could not be sent');
  await expect(form.locator('[data-form-status]')).toContainText('hello@fixtures.test-studio.dev');
  await expect(form.getByLabel('Company')).toHaveValue('Example Property Co');
  await expect(form.getByRole('button', { name: 'Request early access' })).toBeEnabled();
});

test('early-access links from other pages land on the form with the right choice', async ({ page }) => {
  await page.goto('/contact/');
  const main = page.locator('main');
  await expect(main.getByRole('link', { name: 'Pick a time for a 20-minute call' })).toHaveAttribute('href', 'https://cal.com/fixture-studio/intro');
  await main.getByRole('link', { name: 'Request early access' }).click();
  await expect(page).toHaveURL(/\/\?interest=early-access#register$/);
  await expect(page.locator('form[data-early-access-form]').getByRole('radio', { name: 'Early access to the Starter Kit' })).toBeChecked();

  await page.goto('/?interest=interview#register');
  const form = page.locator('form[data-early-access-form]');
  await expect(form.getByRole('radio', { name: 'A 20-minute interview' })).toBeChecked();
  await expect(form.locator('[data-submit-label]')).toHaveText('Request an interview');
});
