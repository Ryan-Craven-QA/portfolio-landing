/**
 * Builds the site against tests/fixtures (content + site config) into
 * dist-fixtures/. Used by `npm run test:e2e` and `npm run preview:fixtures`.
 * The fixtures exercise every product, pricing and visibility state.
 */
process.env.SITE_FIXTURES = '1';

const { default: config } = await import('./astro.config.ts');

export default config;
