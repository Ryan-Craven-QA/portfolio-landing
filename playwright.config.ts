import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the FIXTURE builds (tests/fixtures), which
 * exercise every product, pricing and visibility state:
 *  - dist-fixtures/            single-product landing page (the live mode), port 4322
 *  - dist-fixtures-portfolio/  the optional portfolio homepage, port 4323
 * `npm run test:e2e` builds both first.
 */
const PORT = 4322;
const PORTFOLIO_PORT = 4323;

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['list']] : [['list']],
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'off',
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, testIgnore: /(mobile|portfolio)\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /(mobile|a11y)\.spec\.ts/ },
    {
      name: 'portfolio',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 }, baseURL: `http://localhost:${PORTFOLIO_PORT}` },
      testMatch: /portfolio\.spec\.ts/,
    },
  ],
  webServer: [
    {
      command: `npx astro preview --config astro.fixtures.config.ts --port ${PORT} --ignore-lock`,
      url: `http://localhost:${PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
    {
      command: `npx astro preview --config astro.fixtures-portfolio.config.ts --port ${PORTFOLIO_PORT} --ignore-lock`,
      url: `http://localhost:${PORTFOLIO_PORT}/`,
      reuseExistingServer: !process.env.CI,
      timeout: 60_000,
    },
  ],
});
