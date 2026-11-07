/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  SITE CONFIGURATION
 *  Brand, contact channels, newsletter, analytics and legal links.
 *  Everything is validated at build time (see src/lib/schemas/site.ts).
 *  Run `npm run preflight` to see what is still missing before launch.
 * ─────────────────────────────────────────────────────────────────────────────
 *
 *  Product lines, products, solutions and resources live in src/content/.
 *  See CONTENT_MANAGEMENT.md.
 */
import { defineSiteConfig } from '../lib/schemas/site.ts';

export default defineSiteConfig({
  // "Plainwork" is a working name. Check trademark and domain availability
  // before launch; changing it here updates the whole site.
  name: 'Plainwork',
  // legalName: 'Plainwork LLC',

  tagline: 'Practical software, templates, and guides for everyday work.',
  description:
    'Plainwork is an independent studio making practical software, templates, and plain-language guides that take the friction out of everyday work.',

  // Canonical production URL. The SITE_URL environment variable overrides it
  // (set SITE_URL in Cloudflare Pages). While this is a placeholder, builds are
  // marked `noindex` so search engines never index the wrong domain.
  url: 'https://www.example.com',
  locale: 'en-US',
  currency: 'USD',

  hero: {
    eyebrow: 'Independent software studio',
    title: 'Practical tools for the unglamorous work.',
    description:
      'Plainwork makes focused software, ready-to-use templates, and plain-language guides that take the friction out of everyday tasks.',
  },

  contact: {
    // Add real addresses you monitor. Nothing is shown until you do.
    // general: 'hello@yourdomain.com',
    // support: 'support@yourdomain.com',
    // business: 'partners@yourdomain.com',

    // A form provider lets visitors write to you without exposing an address.
    // form: { provider: 'formspree', formId: 'xxxxxxxx' },
    // form: { provider: 'web3forms', accessKey: '00000000-0000-0000-0000-000000000000' },
    form: { provider: 'none' },

    // responseTime: 'within two business days',
  },

  // Product-update emails. Until a provider is configured the site offers the
  // RSS feed instead of a sign-up form, so no email addresses are collected.
  // newsletter: { provider: 'buttondown', username: 'yourname' },
  // newsletter: { provider: 'kit', formId: '1234567' },
  newsletter: { provider: 'none' },

  // Privacy-friendly analytics. Off until you choose a provider.
  // analytics: { provider: 'cloudflare', token: '0123456789abcdef0123456789abcdef' },
  analytics: { provider: 'none' },

  // social: [{ label: 'GitHub', url: 'https://github.com/your-handle' }],
  social: [],

  // Optional founder section on the About page. Write it in your own words.
  // founder: {
  //   name: 'Your Name',
  //   role: 'Founder',
  //   bio: ['First paragraph.', 'Second paragraph.'],
  //   photo: '/images/founder.jpg',
  //   photoAlt: 'Portrait of Your Name',
  //   links: [{ label: 'LinkedIn', url: 'https://www.linkedin.com/in/your-handle' }],
  // },

  legal: {
    // Use these if your policies are hosted elsewhere; otherwise publish the
    // pages in src/content/legal/.
    // privacyUrl: 'https://...',
    // termsUrl: 'https://...',
    // refundsUrl: 'https://...',
  },

  checkout: {
    // Well-known checkout hosts (Gumroad, Stripe, Lemon Squeezy, Paddle,
    // Polar, Payhip) are allowed by default. Add your own storefront host here.
    extraAllowedHosts: [],
  },
});
