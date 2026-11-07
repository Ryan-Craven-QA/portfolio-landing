import { expect, test } from '@playwright/test';
import { PUBLIC_ROUTES, cspViolations, isolateNetwork, trackProblems } from './helpers.ts';

const ORIGIN = 'https://fixtures.test-studio.dev';

for (const route of PUBLIC_ROUTES) {
  test(`${route}: metadata, single h1, and no console errors or CSP violations`, async ({ page }) => {
    await isolateNetwork(page);
    const problems = await trackProblems(page);
    const response = await page.goto(route);
    expect(response?.status()).toBe(200);

    await expect(page.locator('html')).toHaveAttribute('lang', 'en');
    await expect(page).toHaveTitle(/.+/);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.{50,}/);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `${ORIGIN}${route}`);
    await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', new RegExp(`^${ORIGIN}/`));
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /^index/);
    await expect(page.locator('h1')).toHaveCount(1);

    // Structured data must always be valid JSON.
    for (const block of await page.locator('script[type="application/ld+json"]').allTextContents()) {
      expect(() => JSON.parse(block)).not.toThrow();
    }

    await page.waitForLoadState('networkidle');
    expect(problems.console, problems.console.join('\n')).toEqual([]);
    const csp = await cspViolations(page);
    expect(csp, csp.join('\n')).toEqual([]);
  });
}

test('robots.txt allows indexing and points to the sitemap', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).toContain('Allow: /');
  expect(body).toContain(`Sitemap: ${ORIGIN}/sitemap-index.xml`);
});

test('the CSP allows exactly the configured third parties', async ({ page }) => {
  await isolateNetwork(page);
  await page.goto('/');
  const csp = (await page.locator('meta[http-equiv="content-security-policy"]').getAttribute('content')) ?? '';
  expect(csp).toContain("default-src 'self'");
  expect(csp).toMatch(/form-action 'self'[^;]*https:\/\/formspree\.io/);
  expect(csp).toMatch(/form-action 'self'[^;]*https:\/\/buttondown\.com/);
  expect(csp).toMatch(/script-src 'self'[^;]*https:\/\/static\.cloudflareinsights\.com/);
  expect(csp).toContain("object-src 'none'");
  expect(csp).not.toContain("'unsafe-eval'");
});

test('home page exposes Organization and WebSite structured data', async ({ page }) => {
  await isolateNetwork(page);
  await page.goto('/');
  const data = (await page.locator('script[type="application/ld+json"]').allTextContents()).flatMap((text) => {
    const parsed = JSON.parse(text) as unknown;
    return Array.isArray(parsed) ? parsed : [parsed];
  }) as Array<{ '@type': string; name?: string; email?: string }>;
  const org = data.find((item) => item['@type'] === 'Organization');
  expect(org?.name).toBe('Fixture Studio Ltd');
  expect(org?.email).toBe('hello@fixtures.test-studio.dev');
  expect(data.some((item) => item['@type'] === 'WebSite')).toBe(true);
});

test('analytics loads only the configured beacon', async ({ page }) => {
  await isolateNetwork(page);
  await page.goto('/');
  await expect(page.locator('script[src="https://static.cloudflareinsights.com/beacon.min.js"]')).toHaveAttribute(
    'data-cf-beacon',
    '{"token":"0123456789abcdef0123456789abcdef"}',
  );
});
