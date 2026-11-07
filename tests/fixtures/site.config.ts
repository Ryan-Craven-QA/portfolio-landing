/**
 * Fixture configuration used only by `npm run test:e2e`
 * (astro.fixtures.config.ts sets SITE_FIXTURES=1).
 *
 * Every integration is "configured" with syntactically valid but fake values
 * so the tests can exercise enabled states. Network calls to these providers
 * are intercepted by Playwright; nothing is ever sent.
 */
import { defineSiteConfig } from '../../src/lib/schemas/site.ts';

export default defineSiteConfig({
  name: 'Fixture Studio',
  legalName: 'Fixture Studio Ltd',
  tagline: 'Fixture tagline for automated tests.',
  description:
    'Fixture Studio is a test configuration used to verify every page state, visibility rule, and integration in the site build.',
  url: 'https://fixtures.test-studio.dev',
  locale: 'en-US',
  currency: 'USD',
  hero: {
    eyebrow: 'Fixture eyebrow',
    title: 'Fixture hero title for tests.',
    description: 'Fixture hero description used by the end-to-end test suite.',
  },
  contact: {
    general: 'hello@fixtures.test-studio.dev',
    support: 'support@fixtures.test-studio.dev',
    form: { provider: 'formspree', formId: 'fixture123' },
    responseTime: 'within two business days',
  },
  newsletter: { provider: 'buttondown', username: 'fixture-studio' },
  analytics: { provider: 'cloudflare', token: '0123456789abcdef0123456789abcdef' },
  social: [{ label: 'GitHub', url: 'https://github.com/fixture-studio' }],
  founder: {
    name: 'Fixture Founder',
    role: 'Founder',
    bio: ['Fixture biography paragraph one.', 'Fixture biography paragraph two.'],
    links: [{ label: 'Website', url: 'https://founder.test-studio.dev' }],
  },
  legal: {},
  checkout: { extraAllowedHosts: ['store.test-studio.dev'] },
});
