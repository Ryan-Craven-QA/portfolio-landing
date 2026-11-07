/**
 * Loads and validates the site configuration.
 *
 * Server/build-time only — never import this from client-side scripts.
 *
 * The test suite builds the site against fixture content and a fixture config
 * (`astro.fixtures.config.ts` sets SITE_FIXTURES=1). Static builds discard all
 * server code after rendering, so the fixture module never reaches /dist.
 */
import { existsSync } from 'node:fs';
import productionConfig from './site.ts';
import fixtureConfig from '../../tests/fixtures/site.config.ts';
import { isPlaceholderUrl, parseSiteConfig, type SiteConfig } from '../lib/schemas/site.ts';

// Local overrides (SITE_URL, SITE_NOINDEX, …) from .env. Real environment
// variables — e.g. those set in Cloudflare Pages — are never overwritten.
if (existsSync('.env')) {
  try {
    process.loadEnvFile('.env');
  } catch {
    // An unreadable .env is ignored; the build falls back to src/config/site.ts.
  }
}

export const IS_FIXTURE_BUILD = process.env.SITE_FIXTURES === '1';

export function loadSiteConfig(): SiteConfig {
  return IS_FIXTURE_BUILD
    ? parseSiteConfig(fixtureConfig, 'tests/fixtures/site.config.ts')
    : parseSiteConfig(productionConfig, 'src/config/site.ts');
}

/** Canonical origin: SITE_URL env var wins over the config file. */
export function resolveSiteUrl(config: SiteConfig): string {
  const fromEnv = process.env.SITE_URL?.trim();
  const url = fromEnv && fromEnv.length > 0 ? fromEnv : config.url;
  return url.replace(/\/+$/, '');
}

/**
 * Whether search engines should be told not to index this build:
 * - the canonical URL is still a placeholder,
 * - SITE_NOINDEX=true is set (useful for staging), or
 * - it's a Cloudflare Pages preview build of a non-production branch.
 */
export function shouldNoIndex(siteUrl: string): boolean {
  if (process.env.SITE_NOINDEX === 'true') return true;
  if (isPlaceholderUrl(siteUrl)) return true;
  const branch = process.env.CF_PAGES_BRANCH;
  const productionBranch = process.env.PRODUCTION_BRANCH ?? 'main';
  if (branch && branch !== productionBranch) return true;
  return false;
}
