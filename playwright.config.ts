import { defineConfig, devices } from '@playwright/test';

/**
 * End-to-end tests run against the FIXTURE build (tests/fixtures), which
 * exercises every product, pricing and visibility state. `npm run test:e2e`
 * builds it first.
 */
const PORT = 4322;

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
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } }, testIgnore: /mobile\.spec\.ts/ },
    { name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: /(mobile|a11y)\.spec\.ts/ },
  ],
  webServer: {
    command: `npx astro preview --config astro.fixtures.config.ts --port ${PORT} --ignore-lock`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
