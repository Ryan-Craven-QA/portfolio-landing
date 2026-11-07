import { expect, test } from '@playwright/test';
import { isolateNetwork } from './helpers.ts';

const FORMSPREE = 'https://formspree.io/f/fixture123';

test.beforeEach(async ({ page }) => isolateNetwork(page));

test('contact form prefills topic and product from the URL', async ({ page }) => {
  await page.goto('/contact/?topic=support&product=fixture-paid-app');
  await expect(page.getByRole('radio', { name: 'Product support' })).toBeChecked();
  await expect(page.getByLabel('Product (optional)')).toHaveValue('fixture-paid-app');
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

test('newsletter form posts straight to the provider in a new tab', async ({ page }) => {
  await page.goto('/');
  const form = page.locator('[data-newsletter-form]');
  await expect(form).toHaveAttribute('action', 'https://buttondown.com/api/emails/embed-subscribe/fixture-studio');
  await expect(form).toHaveAttribute('method', 'post');
  await expect(form).toHaveAttribute('target', '_blank');
  await expect(form.locator('input[type="email"]')).toHaveAttribute('name', 'email');
  await expect(form.locator('input[name="embed"]')).toHaveValue('1');
});
