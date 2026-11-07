import type { Page } from '@playwright/test';

/** Every public route of the fixture build. */
export const PUBLIC_ROUTES = [
  '/',
  '/about/',
  '/contact/',
  '/support/',
  '/products/',
  '/products/fixture-software/',
  '/products/fixture-templates/',
  '/products/fixture-software/fixture-paid-app/',
  '/products/fixture-software/fixture-coming-soon/',
  '/products/fixture-software/fixture-no-checkout/',
  '/products/fixture-templates/fixture-free-template/',
  '/products/fixture-templates/fixture-custom-host/',
  '/products/fixture-templates/fixture-bundle/',
  '/solutions/',
  '/solutions/fixture-solution/',
  '/resources/',
  '/resources/fixture-guide/',
  '/resources/fixture-docs/',
  '/legal/privacy/',
];

/** Drafts and hidden entries in the fixtures: none of these may be reachable. */
export const HIDDEN_ROUTES = [
  '/products/fixture-software/fixture-draft/',
  '/products/fixture-hidden-line/',
  '/products/fixture-hidden-line/fixture-hidden-line-product/',
  '/solutions/fixture-hidden-solution/',
  '/resources/fixture-draft-resource/',
  '/resources/fixture-future-resource/',
  '/resources/fixture-hidden-line-resource/',
  '/legal/terms/',
];

export const HIDDEN_NAMES = [
  'Fixture Draft Product',
  'Fixture Hidden Line',
  'Fixture hidden solution',
  'Fixture draft resource',
  'Fixture future resource',
  'Fixture hidden line resource',
  'Fixture Terms',
  'Fixture draft question',
  'Fixture hidden line question',
];

export const PUBLIC_PRODUCTS = [
  'Fixture Paid App',
  'Fixture Free Template',
  'Fixture Coming Soon',
  'Fixture No Checkout',
  'Fixture Custom Host',
  'Fixture Bundle',
];

/**
 * Keeps tests hermetic: third-party requests never leave the machine.
 * The analytics beacon gets an empty script; everything else is aborted
 * unless a test installs its own route first.
 */
export async function isolateNetwork(page: Page) {
  await page.route(/^https:\/\/static\.cloudflareinsights\.com\//, (route) =>
    route.fulfill({ status: 200, contentType: 'application/javascript', body: '/* analytics stub */' }),
  );
  await page.route(
    (url) => url.hostname !== 'localhost' && url.hostname !== '127.0.0.1',
    (route) => route.abort('blockedbyclient'),
  );
}

export interface Problems {
  console: string[];
  csp: string[];
}

/** Collects console errors, uncaught exceptions and CSP violations. */
export async function trackProblems(page: Page): Promise<Problems> {
  const problems: Problems = { console: [], csp: [] };
  await page.addInitScript(() => {
    const w = window as unknown as { __csp: string[] };
    w.__csp = [];
    document.addEventListener('securitypolicyviolation', (event) => {
      w.__csp.push(`${event.violatedDirective} blocked ${event.blockedURI || 'inline'} (${event.sourceFile}:${event.lineNumber})`);
    });
  });
  page.on('console', (message) => {
    if (message.type() !== 'error') return;
    const text = message.text();
    // Aborted third-party requests are expected in the hermetic test setup.
    if (/ERR_BLOCKED_BY_CLIENT|net::ERR_FAILED/.test(text)) return;
    problems.console.push(text);
  });
  page.on('pageerror', (error) => problems.console.push(`pageerror: ${error.message}`));
  return problems;
}

export async function cspViolations(page: Page): Promise<string[]> {
  return page.evaluate(() => (window as unknown as { __csp?: string[] }).__csp ?? []);
}
