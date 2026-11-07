import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { PUBLIC_ROUTES, isolateNetwork } from './helpers.ts';

/**
 * Automated accessibility checks (WCAG 2.2 A/AA rules in axe-core) on every
 * public page, in both themes. Runs on desktop and mobile viewports.
 * Reduced motion is emulated so scroll-reveal never hides content mid-scan.
 */
test.use({ reducedMotion: 'reduce' });

for (const theme of ['dark', 'light'] as const) {
  test.describe(`${theme} theme`, () => {
    for (const route of PUBLIC_ROUTES) {
      test(`${route} has no detectable WCAG violations`, async ({ page }) => {
        await isolateNetwork(page);
        await page.addInitScript((value) => localStorage.setItem('theme', value), theme);
        await page.goto(route);
        await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
        const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice']).analyze();
        const summary = results.violations.map(
          (violation) => `${violation.id} (${violation.impact}): ${violation.help}\n    ${violation.nodes.slice(0, 3).map((node) => node.target.join(' ')).join('\n    ')}`,
        );
        expect(summary, summary.join('\n')).toEqual([]);
      });
    }
  });
}
