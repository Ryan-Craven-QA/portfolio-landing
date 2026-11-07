/**
 * Content schemas for product lines, products, solutions, resources, FAQs
 * and legal pages.
 *
 * Pure Zod (no Astro imports). `src/content.config.ts` passes Astro's
 * `image()` helper in; /scripts pass a plain string schema instead.
 *
 * Safe defaults: product lines are hidden, products/resources/FAQs/legal pages
 * are drafts until you explicitly publish them.
 */
import { z } from 'astro/zod';
import { httpsUrl } from './site.ts';

/* ───────────────────────────── shared vocab ───────────────────────────── */

export const BUSINESS_STATUSES = {
  exploring: 'Exploring',
  'in-development': 'In development',
  'coming-soon': 'Coming soon',
  'early-access': 'Early access',
  available: 'Available',
} as const;

export const AVAILABILITY = {
  available: 'Available',
  'early-access': 'Early access',
  'coming-soon': 'Coming soon',
  unavailable: 'Unavailable',
} as const;

export const PRODUCT_TYPES = {
  'web-app': 'Web app',
  'desktop-app': 'Desktop app',
  'wordpress-plugin': 'WordPress plugin',
  automation: 'Automation workflow',
  'ai-workflow': 'AI workflow template',
  template: 'Template',
  spreadsheet: 'Spreadsheet template',
  calculator: 'Calculator',
  toolkit: 'Toolkit',
  checklist: 'Checklist',
  guide: 'Guide',
  course: 'Course',
  bundle: 'Bundle',
} as const;

export const RESOURCE_TYPES = {
  tutorial: 'Tutorial',
  guide: 'Guide',
  article: 'Article',
  download: 'Free download',
  documentation: 'Documentation',
} as const;

/** Glyphs available for product lines (see src/components/brand/LineGlyph.astro). */
export const LINE_GLYPHS = ['flow', 'plug', 'calendar', 'grid', 'shield'] as const;
/** Card illustrations available for product lines (see src/components/home/LineArt.astro). */
export const LINE_ART = ['document-fields', 'plugin-toggles', 'calendar-grid', 'file-stack', 'message-check'] as const;
/** UI icons usable from content (see src/components/ui/Icon.astro). */
export const CONTENT_ICONS = ['bolt', 'globe', 'layers', 'grid', 'shield', 'file', 'calendar', 'book', 'tool'] as const;

export const LICENSES = ['personal', 'commercial', 'team', 'organization', 'agency'] as const;
export const BILLING = ['one-time', 'monthly', 'yearly'] as const;

const slug = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Use lowercase letters, numbers and single hyphens');

/** Internal path ("/resources/x/") or an absolute https URL. */
const link = z.union([z.string().regex(/^\/[^\s]*$/, 'Internal links must start with "/"'), httpsUrl]);

const seo = z
  .object({
    title: z.string().min(1).max(70).optional(),
    description: z.string().min(50).max(170).optional(),
  })
  .optional();

/* ───────────────────────────── product lines ───────────────────────────── */

export const businessSchema = z
  .object({
    id: slug,
    /** Public name, e.g. "WordPress Plugins". */
    name: z.string().min(1).max(40),
    /** Short line under the name on cards. */
    tagline: z.string().min(1).max(90),
    description: z.string().min(1).max(360),
    /** Public visibility. Hidden lines (and all their products) are never built. */
    visible: z.boolean().default(false),
    /** Development status, shown as a badge unless "available". */
    status: z.enum(Object.keys(BUSINESS_STATUSES) as [keyof typeof BUSINESS_STATUSES]).default('in-development'),
    order: z.number().int().default(100),
    /** Brand hue for this line on the OKLCH wheel (0–360). */
    hue: z.number().min(0).max(360),
    glyph: z.enum(LINE_GLYPHS),
    art: z.enum(LINE_ART),
    /** The kinds of products this line offers (shown as examples, never as listings). */
    examples: z.array(z.string().min(1)).min(1).max(6),
    audience: z.string().min(1).optional(),
    /** Shown on the line page and its product pages, e.g. "Not legal advice." */
    disclaimer: z.string().min(1).optional(),
    seo,
  })
  .strict();

/* ───────────────────────────── products ───────────────────────────── */

export const offerSchema = z
  .object({
    id: slug,
    label: z.string().min(1).max(40),
    /** Major units (49 = $49). 0 = free. null = "contact us for pricing". */
    price: z.number().nonnegative().nullable(),
    currency: z.string().length(3).optional(),
    billing: z.enum(BILLING).default('one-time'),
    license: z.enum(LICENSES).optional(),
    scope: z.string().min(1).max(60).optional(),
    /** Hosted checkout (Gumroad, Stripe Payment Link, Lemon Squeezy, ...). Must be https on a verified host. */
    checkoutUrl: httpsUrl.optional(),
    /** Free offers: "/downloads/file.pdf" (in /public/downloads) or a verified https URL. */
    downloadUrl: z.union([z.string().regex(/^\/downloads\/[A-Za-z0-9._\-/]+$/), httpsUrl]).optional(),
    ctaLabel: z.string().min(1).max(32).optional(),
    recommended: z.boolean().default(false),
    features: z.array(z.string().min(1)).default([]),
    /** Your own words, e.g. "Renews yearly. Cancel any time." */
    note: z.string().min(1).max(160).optional(),
  })
  .strict();

export function productSchema<TImage extends z.ZodType>(image: () => TImage) {
  return z
    .object({
      name: z.string().min(1).max(60),
      /** Product line id from src/content/businesses.yaml. */
      business: slug,
      type: z.enum(Object.keys(PRODUCT_TYPES) as [keyof typeof PRODUCT_TYPES]),
      /** One or two sentences for cards and meta descriptions. */
      summary: z.string().min(20).max(200),
      /** Optional headline on the product page. */
      tagline: z.string().min(1).max(110).optional(),
      /** Drafts are never built. Set to "public" to publish. */
      visibility: z.enum(['public', 'draft']).default('draft'),
      availability: z.enum(Object.keys(AVAILABILITY) as [keyof typeof AVAILABILITY]).default('coming-soon'),
      featured: z.boolean().default(false),
      featuredOrder: z.number().int().default(100),
      releaseDate: z.coerce.date().optional(),
      updatedDate: z.coerce.date().optional(),
      version: z.string().min(1).max(20).optional(),
      offers: z.array(offerSchema).default([]),
      /** What the customer receives. */
      includes: z.array(z.string().min(1)).default([]),
      highlights: z.array(z.object({ title: z.string().min(1).max(60), body: z.string().min(1).max(240) }).strict()).default([]),
      requirements: z.array(z.string().min(1)).default([]),
      formats: z.array(z.string().min(1)).default([]),
      cover: z.object({ src: image(), alt: z.string().min(1) }).strict().optional(),
      screenshots: z
        .array(z.object({ src: image(), alt: z.string().min(1), caption: z.string().min(1).optional() }).strict())
        .default([]),
      links: z
        .object({
          documentation: link.optional(),
          support: link.optional(),
          changelog: link.optional(),
          demo: httpsUrl.optional(),
        })
        .strict()
        .default({}),
      /** For bundles: ids of the products included. */
      bundleIncludes: z.array(slug).default([]),
      related: z.array(slug).default([]),
      tags: z.array(z.string().min(1)).default([]),
      faqs: z.array(z.object({ question: z.string().min(1), answer: z.string().min(1) }).strict()).default([]),
      seo,
    })
    .strict();
}

/* ───────────────────────────── solutions ───────────────────────────── */

export const solutionSchema = z
  .object({
    id: slug,
    /** Phrased as the visitor's goal, e.g. "Automate repetitive tasks". */
    title: z.string().min(1).max(60),
    summary: z.string().min(1).max(200),
    /** The situation, in the customer's words. */
    problem: z.string().min(1).max(400),
    /** How the related product lines help (keep it factual). */
    approach: z.array(z.string().min(1)).min(1).max(6),
    /** Concrete tasks — also used by the homepage task finder. */
    tasks: z.array(z.string().min(1).max(70)).min(1).max(6),
    businesses: z.array(slug).min(1),
    /** Optional explicit product ids; otherwise all public products of the lines are shown. */
    products: z.array(slug).default([]),
    icon: z.enum(CONTENT_ICONS),
    order: z.number().int().default(100),
    keywords: z.array(z.string().min(1)).default([]),
    seo,
  })
  .strict();

/* ───────────────────────────── resources ───────────────────────────── */

export function resourceSchema<TImage extends z.ZodType>(image: () => TImage) {
  return z
    .object({
      title: z.string().min(1).max(90),
      description: z.string().min(50).max(200),
      type: z.enum(Object.keys(RESOURCE_TYPES) as [keyof typeof RESOURCE_TYPES]),
      status: z.enum(['published', 'draft']).default('draft'),
      publishDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      business: slug.optional(),
      products: z.array(slug).default([]),
      tags: z.array(z.string().min(1)).default([]),
      featured: z.boolean().default(false),
      download: z
        .object({
          label: z.string().min(1).max(60),
          href: z.union([z.string().regex(/^\/downloads\/[A-Za-z0-9._\-/]+$/), httpsUrl]),
          format: z.string().min(1).max(20),
          size: z.string().min(1).max(20).optional(),
        })
        .strict()
        .optional(),
      cover: z.object({ src: image(), alt: z.string().min(1) }).strict().optional(),
      seo,
    })
    .strict();
}

/* ───────────────────────────── FAQs & legal ───────────────────────────── */

export const faqSchema = z
  .object({
    id: slug,
    question: z.string().min(1).max(140),
    /** Plain text. Separate paragraphs with a blank line. */
    answer: z.string().min(1),
    link: z.object({ label: z.string().min(1), href: link }).strict().optional(),
    category: z.enum(['general', 'products', 'purchasing', 'support']).default('general'),
    status: z.enum(['published', 'draft']).default('draft'),
    /** Optional product line; the FAQ hides while that line is hidden. */
    business: slug.optional(),
    order: z.number().int().default(100),
  })
  .strict();

export const legalSchema = z
  .object({
    title: z.string().min(1),
    description: z.string().min(50).max(170),
    status: z.enum(['published', 'draft']).default('draft'),
    lastUpdated: z.coerce.date(),
  })
  .strict();

export type BusinessData = z.output<typeof businessSchema>;
export type OfferData = z.output<typeof offerSchema>;
export type SolutionData = z.output<typeof solutionSchema>;
export type FaqData = z.output<typeof faqSchema>;
export type LegalData = z.output<typeof legalSchema>;
