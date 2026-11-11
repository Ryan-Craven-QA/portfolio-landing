/**
 * Site configuration schema.
 *
 * Pure module (no Astro imports) so it can be used by the site build AND by the
 * Node tooling in /scripts (preflight, build verification). Keep it that way:
 * relative imports must use explicit `.ts` extensions and only erasable
 * TypeScript syntax is allowed (no enums, namespaces or parameter properties).
 */
import { z } from 'astro/zod';

/** An absolute https:// URL. Plain http is rejected everywhere on purpose. */
export const httpsUrl = z.url({ protocol: /^https$/, hostname: z.regexes.domain });

const email = z.email();

/** A bare hostname such as `store.example.com` (no scheme, path or port). */
const hostname = z
  .string()
  .regex(/^(?=.{1,253}$)([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i, 'Expected a bare hostname like "store.example.com"');

const contactFormSchema = z.discriminatedUnion('provider', [
  /** No form: the contact page falls back to email links (if any are configured). */
  z.object({ provider: z.literal('none') }),
  /** https://formspree.io — form endpoint https://formspree.io/f/<formId>. */
  z.object({
    provider: z.literal('formspree'),
    formId: z.string().regex(/^[a-zA-Z0-9]{4,32}$/, 'Formspree form IDs are the short code after /f/ in the endpoint URL'),
  }),
  /** https://web3forms.com — the access key is designed to be public in HTML. */
  z.object({ provider: z.literal('web3forms'), accessKey: z.uuid() }),
]);

const newsletterSchema = z.discriminatedUnion('provider', [
  /** No provider: the updates section offers the RSS feed instead of a form. */
  z.object({ provider: z.literal('none') }),
  /** https://buttondown.com — posts to the public embed-subscribe endpoint. */
  z.object({ provider: z.literal('buttondown'), username: z.string().regex(/^[a-zA-Z0-9_-]+$/) }),
  /** https://kit.com (formerly ConvertKit) — posts to the public form subscription endpoint. */
  z.object({ provider: z.literal('kit'), formId: z.string().regex(/^\d+$/) }),
  /** Any provider with a plain HTML embed form (MailerLite, EmailOctopus, Beehiiv, ...). */
  z.object({
    provider: z.literal('custom'),
    name: z.string().min(1),
    action: httpsUrl,
    emailField: z.string().min(1).default('email'),
    hiddenFields: z.record(z.string(), z.string()).default({}),
  }),
]);

const analyticsSchema = z.discriminatedUnion('provider', [
  z.object({ provider: z.literal('none') }),
  /**
   * Cloudflare Web Analytics (free, cookieless). Provide `token` to have the
   * site include the beacon itself. Leave `token` out if you enabled automatic
   * injection in the Cloudflare dashboard: the CSP will still allow it.
   */
  z.object({ provider: z.literal('cloudflare'), token: z.string().regex(/^[a-f0-9]{32}$/).optional() }),
  /** Plausible Analytics (paid, cookieless). */
  z.object({
    provider: z.literal('plausible'),
    domain: hostname,
    src: httpsUrl.default('https://plausible.io/js/script.js'),
    apiHost: httpsUrl.default('https://plausible.io'),
  }),
  /** Umami (self-hosted or Umami Cloud, cookieless). */
  z.object({
    provider: z.literal('umami'),
    websiteId: z.uuid(),
    src: httpsUrl.default('https://cloud.umami.is/script.js'),
    /**
     * Host(s) the tracker sends data to, for the Content-Security-Policy.
     * Umami Cloud moved collection to gateway.umami.is in 2026; the older host
     * is kept as a fallback.
     */
    connectHosts: z
      .array(httpsUrl)
      .default(['https://cloud.umami.is', 'https://gateway.umami.is', 'https://api-gateway.umami.dev']),
  }),
]);

const founderSchema = z.object({
  name: z.string().min(1),
  role: z.string().min(1),
  /** One string per paragraph. Write it yourself: nothing here is generated. */
  bio: z.array(z.string().min(1)).min(1),
  /** Optional image path relative to /public, e.g. "/images/founder.jpg". */
  photo: z.string().startsWith('/').optional(),
  photoAlt: z.string().optional(),
  links: z.array(z.object({ label: z.string(), url: httpsUrl })).default([]),
});

export const siteConfigSchema = z
  .object({
    /** Brand name shown in the header, titles and metadata. */
    name: z.string().min(1),
    /**
     * Set to true only once trademark and domain clearance for `name` is
     * complete. Until then `npm run preflight` reports it as a working name.
     */
    nameCleared: z.boolean().default(false),
    /** Registered business name for the copyright line, once you have one. */
    legalName: z.string().min(1).optional(),
    /** Short positioning line used in metadata and the footer. */
    tagline: z.string().min(1).max(90),
    /** Default meta description (keep it under ~160 characters). */
    description: z.string().min(50).max(170),
    /** Canonical production origin, e.g. "https://www.yourdomain.com". Overridden by the SITE_URL env var. */
    url: z.url({ protocol: /^https?$/ }),
    locale: z.string().default('en-US'),
    /** ISO 4217 currency used when a product offer does not specify one. */
    currency: z.string().length(3).default('USD'),

    /**
     * What the homepage shows:
     * - "product": a single-product landing page (copy in src/config/landing.ts)
     * - "portfolio": the multi-product studio homepage built from product lines
     */
    homepage: z.enum(['product', 'portfolio']).default('product'),

    /** Homepage hero copy. */
    hero: z.object({
      eyebrow: z.string().min(1),
      title: z.string().min(1).max(80),
      description: z.string().min(1).max(260),
    }),

    /** Short scope statement shown in the footer of every page. */
    disclaimer: z.string().min(1).max(400).optional(),

    features: z
      .object({
        /** Site search (⌘K). Useful once there are many pages; off for a single-product site. */
        search: z.boolean().default(false),
      })
      .default({ search: false }),

    earlyAccess: z
      .object({
        /**
         * Optional scheduling link for research interviews (Cal.com, Calendly,
         * Google Calendar booking page…). Shown next to the registration form.
         */
        bookingUrl: httpsUrl.optional(),
        /** Optional label for the scheduling link. */
        bookingLabel: z.string().min(1).max(40).default('Pick a time for a 20-minute call'),
      })
      .default({ bookingLabel: 'Pick a time for a 20-minute call' }),

    contact: z
      .object({
        /** General inquiries. */
        general: email.optional(),
        /** Product support. Falls back to `general` when omitted. */
        support: email.optional(),
        /** Partnerships, licensing and business inquiries. Falls back to `general`. */
        business: email.optional(),
        form: contactFormSchema.default({ provider: 'none' }),
        /** Only set this if you will actually meet it, e.g. "within two business days". */
        responseTime: z.string().min(1).optional(),
      })
      .default({ form: { provider: 'none' } }),

    newsletter: newsletterSchema.default({ provider: 'none' }),
    analytics: analyticsSchema.default({ provider: 'none' }),

    social: z.array(z.object({ label: z.string().min(1), url: httpsUrl })).default([]),

    /** Optional founder section on the About page. Leave undefined to hide it. */
    founder: founderSchema.optional(),

    /**
     * Policies hosted elsewhere (e.g. a policy generator). When a URL is set it
     * is used instead of the matching page in src/content/legal.
     */
    legal: z
      .object({
        privacyUrl: httpsUrl.optional(),
        termsUrl: httpsUrl.optional(),
        refundsUrl: httpsUrl.optional(),
      })
      .default({}),

    checkout: z
      .object({
        /**
         * Extra hostnames you trust for checkout links (for example a custom
         * storefront domain). Well-known providers are already allowed — see
         * src/lib/commerce.ts.
         */
        extraAllowedHosts: z.array(hostname).default([]),
      })
      .default({ extraAllowedHosts: [] }),
  })
  .strict();

export type SiteConfigInput = z.input<typeof siteConfigSchema>;
export type SiteConfig = z.output<typeof siteConfigSchema>;

/** Identity helper that gives editor autocompletion in src/config/site.ts. */
export function defineSiteConfig(config: SiteConfigInput): SiteConfigInput {
  return config;
}

export function parseSiteConfig(input: unknown, source = 'src/config/site.ts'): SiteConfig {
  const result = siteConfigSchema.safeParse(input);
  if (!result.success) {
    const issues = result.error.issues.map((issue) => `  • ${issue.path.join('.') || '(root)'}: ${issue.message}`).join('\n');
    throw new Error(`Invalid site configuration in ${source}:\n${issues}`);
  }
  return result.data;
}

/** True when the canonical URL is still a placeholder domain. */
export function isPlaceholderUrl(url: string): boolean {
  try {
    const { hostname: host } = new URL(url);
    return /(^|\.)example\.(com|org|net)$/.test(host) || host === 'localhost';
  } catch {
    return true;
  }
}
