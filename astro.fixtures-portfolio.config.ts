/**
 * Same fixtures as astro.fixtures.config.ts, but with the multi-product
 * portfolio homepage (`homepage: 'portfolio'`), built into
 * dist-fixtures-portfolio/. Keeps the portfolio mode covered by the e2e suite
 * (tests/e2e/portfolio.spec.ts) while the live site runs in product mode.
 */
process.env.SITE_FIXTURES = '1';
process.env.SITE_FIXTURE_HOMEPAGE = 'portfolio';

const { default: config } = await import('./astro.config.ts');

export default config;
