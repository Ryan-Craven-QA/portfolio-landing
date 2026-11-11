/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION
 *  Brand, homepage mode, contact channels, analytics and legal links.
 *  Everything is validated at build time (see src/lib/schemas/site.ts).
 *  Run `npm run preflight` to see what is still missing before launch.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Landing-page copy (problem, features, pricing…) lives in src/config/landing.ts.
 *  The demo's fictional data lives in src/config/demo.ts.
 */
import { defineSiteConfig } from '../lib/schemas/site.ts';

export default defineSiteConfig({
  // "RenewalTrail" is a WORKING NAME until trademark and domain clearance is
  // complete. Changing it here updates every page; copy uses a {brand} token.
  name: 'RenewalTrail',
  nameCleared: false,
  // legalName: 'Your Company LLC',

  tagline: 'Vendor document renewal tracking for small property-management companies.',
  description:
    'Track vendor document expiration dates, renewal requests, and follow-ups in one place. Built for small property-management companies. In development.',

  // Canonical production URL. The SITE_URL environment variable overrides it.
  // While this is a placeholder, builds are marked `noindex`.
  url: 'https://www.example.com',
  locale: 'en-US',
  currency: 'USD',

  // Single-product landing page. Switch to 'portfolio' to bring back the
  // multi-product studio homepage built from src/content/businesses.yaml.
  homepage: 'product',

  hero: {
    // " · Early access open" is added automatically once a form or email is configured.
    eyebrow: 'In development',
    title: 'Know what expires next—and who’s following up.',
    description:
      'We’re building RenewalTrail for small property-management companies: one place to track vendor document expiration dates, renewal requests, and who owns each follow-up.',
  },

  // Shown in the footer of every page. Keep it — the product only supports
  // administrative tracking.
  disclaimer:
    'RenewalTrail is an administrative tracking tool. It does not verify insurance coverage, determine legal compliance, or certify vendor eligibility.',

  features: {
    search: false,
  },

  earlyAccess: {
    // Optional: a scheduling page for research interviews (Cal.com, Calendly…).
    // bookingUrl: 'https://cal.com/your-name/renewaltrail-interview',
  },

  contact: {
    // Add real addresses you monitor. Nothing is shown until you do.
    // general: 'hello@yourdomain.com',
    // support: 'support@yourdomain.com',
    // business: 'partners@yourdomain.com',

    // The early-access form and the contact form post to this provider.
    // Until one is set, NO form is shown (no data is collected).
    // form: { provider: 'formspree', formId: 'xxxxxxxx' },
    // form: { provider: 'web3forms', accessKey: '00000000-0000-0000-0000-000000000000' },
    form: { provider: 'none' },

    // responseTime: 'within two business days',
  },

  // Optional product-update emails. The early-access form already covers
  // launch updates, so this can stay off.
  newsletter: { provider: 'none' },

  // Privacy-friendly analytics. Off until you choose a provider.
  // analytics: { provider: 'cloudflare', token: '0123456789abcdef0123456789abcdef' },
  analytics: { provider: 'none' },

  social: [],

  // Optional founder section on the About page. Write it in your own words.
  // founder: {
  //   name: 'Your Name',
  //   role: 'Founder',
  //   bio: ['First paragraph.', 'Second paragraph.'],
  //   links: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/your-handle' }],
  // },

  legal: {
    // privacyUrl: 'https://...',
    // termsUrl: 'https://...',
    // refundsUrl: 'https://...',
  },

  checkout: {
    extraAllowedHosts: [],
  },
});
