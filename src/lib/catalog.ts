/**
 * The catalog: the ONLY way pages read content.
 *
 * It loads every collection, applies the visibility rules in visibility.ts,
 * validates cross-references (with readable build errors), and returns view
 * models with URLs, prices and safe checkout actions already resolved.
 *
 * Anything not returned from here is not public — pages, navigation, search,
 * RSS and the sitemap are all generated from these lists.
 */
import { getCollection, type CollectionEntry } from 'astro:content';
import { loadSiteConfig } from '../config/load.ts';
import {
  displayOfferPrice,
  pricingModelLabel,
  resolveOfferAction,
  summarizePricing,
  type CheckoutAction,
  type OfferInput,
  type PriceDisplay,
} from './commerce.ts';
import { routes } from './routes.ts';
import { AVAILABILITY, BUSINESS_STATUSES, PRODUCT_TYPES, RESOURCE_TYPES } from './schemas/content.ts';
import * as visibility from './visibility.ts';

export const site = loadSiteConfig();

/** Drafts are previewable only on the dev server started with `npm run dev:drafts`. */
export const PREVIEW_DRAFTS: boolean = import.meta.env.DEV && import.meta.env.MODE === 'drafts';

const PUBLIC_ONLY: visibility.VisibilityContext = { previewDrafts: false, now: new Date() };
const CONTEXT: visibility.VisibilityContext = { ...PUBLIC_ONLY, previewDrafts: PREVIEW_DRAFTS };

/** Whether visitors have any way to reach the business (form or email). */
export const CAN_CONTACT: boolean =
  site.contact.form.provider !== 'none' || Boolean(site.contact.general ?? site.contact.business ?? site.contact.support);

/* ───────────────────────────── view models ───────────────────────────── */

export type BusinessStatus = keyof typeof BUSINESS_STATUSES;

export interface Line {
  id: string;
  name: string;
  tagline: string;
  description: string;
  status: BusinessStatus;
  statusLabel: string;
  hue: number;
  glyph: CollectionEntry<'businesses'>['data']['glyph'];
  art: CollectionEntry<'businesses'>['data']['art'];
  examples: string[];
  audience: string | undefined;
  disclaimer: string | undefined;
  order: number;
  url: string;
  seo: CollectionEntry<'businesses'>['data']['seo'];
  /** Visible only because of draft preview mode. */
  isPreview: boolean;
}

export interface Offer extends OfferInput {
  display: PriceDisplay;
  action: CheckoutAction;
}

export type ProductEntry = CollectionEntry<'products'>;

export interface Product {
  id: string;
  name: string;
  url: string;
  line: Line;
  type: ProductEntry['data']['type'];
  typeLabel: string;
  summary: string;
  tagline: string | undefined;
  availability: ProductEntry['data']['availability'];
  availabilityLabel: string;
  featured: boolean;
  featuredOrder: number;
  releaseDate: Date | undefined;
  updatedDate: Date | undefined;
  version: string | undefined;
  offers: Offer[];
  priceSummary: string | null;
  pricingModel: string | null;
  /** The most relevant action for cards: first purchasable/downloadable offer, else the first offer's state. */
  primaryAction: CheckoutAction | null;
  isFree: boolean;
  /** Lowest positive price, for sorting. Infinity when unpriced; 0 when free. */
  sortPrice: number;
  data: ProductEntry['data'];
  entry: ProductEntry;
  isPreview: boolean;
}

export interface Solution {
  id: string;
  title: string;
  summary: string;
  problem: string;
  approach: string[];
  tasks: string[];
  icon: CollectionEntry<'solutions'>['data']['icon'];
  keywords: string[];
  order: number;
  url: string;
  lines: Line[];
  products: Product[];
  seo: CollectionEntry<'solutions'>['data']['seo'];
}

export type ResourceEntry = CollectionEntry<'resources'>;

export interface Resource {
  id: string;
  title: string;
  description: string;
  type: ResourceEntry['data']['type'];
  typeLabel: string;
  url: string;
  publishDate: Date;
  updatedDate: Date | undefined;
  line: Line | undefined;
  products: Product[];
  tags: string[];
  featured: boolean;
  readingMinutes: number;
  data: ResourceEntry['data'];
  entry: ResourceEntry;
  isPreview: boolean;
}

export interface Faq {
  id: string;
  question: string;
  paragraphs: string[];
  link: CollectionEntry<'faqs'>['data']['link'];
  category: CollectionEntry<'faqs'>['data']['category'];
}

export type LegalEntry = CollectionEntry<'legal'>;

export interface LegalPage {
  id: string;
  title: string;
  description: string;
  lastUpdated: Date;
  url: string;
  entry: LegalEntry;
  isPreview: boolean;
}

export interface Catalog {
  lines: Line[];
  linesById: Map<string, Line>;
  products: Product[];
  productsById: Map<string, Product>;
  solutions: Solution[];
  resources: Resource[];
  faqs: Faq[];
  legal: LegalPage[];
}

/* ───────────────────────────── loading ───────────────────────────── */

let cached: Promise<Catalog> | undefined;

/** Loads the public catalog. Cached for the duration of a production build. */
export function getCatalog(): Promise<Catalog> {
  if (import.meta.env.DEV) return buildCatalog();
  cached ??= buildCatalog();
  return cached;
}

class ContentError extends Error {
  constructor(message: string) {
    super(`[content] ${message}`);
    this.name = 'ContentError';
  }
}

async function buildCatalog(): Promise<Catalog> {
  const [businessEntries, productEntries, solutionEntries, resourceEntries, faqEntries, legalEntries] = await Promise.all([
    getCollection('businesses'),
    getCollection('products'),
    getCollection('solutions'),
    getCollection('resources'),
    getCollection('faqs'),
    getCollection('legal'),
  ]);

  const allBusinesses = new Map(businessEntries.map((entry) => [entry.data.id, entry.data]));
  const allProductIds = new Set(productEntries.map((entry) => entry.id));

  // Cross-reference validation (runs for drafts too, so mistakes surface early).
  for (const entry of productEntries) {
    if (!allBusinesses.has(entry.data.business)) {
      throw new ContentError(
        `Product "${entry.id}" refers to unknown product line "${entry.data.business}". Known lines: ${[...allBusinesses.keys()].join(', ')}`,
      );
    }
    for (const ref of [...entry.data.related, ...entry.data.bundleIncludes]) {
      if (!allProductIds.has(ref)) throw new ContentError(`Product "${entry.id}" refers to unknown product "${ref}".`);
    }
    if (entry.data.type === 'bundle' && entry.data.bundleIncludes.length === 0) {
      throw new ContentError(`Bundle "${entry.id}" must list the products it includes in "bundleIncludes".`);
    }
  }
  for (const entry of solutionEntries) {
    for (const id of entry.data.businesses) {
      if (!allBusinesses.has(id)) throw new ContentError(`Solution "${entry.data.id}" refers to unknown product line "${id}".`);
    }
    for (const id of entry.data.products) {
      if (!allProductIds.has(id)) throw new ContentError(`Solution "${entry.data.id}" refers to unknown product "${id}".`);
    }
  }
  for (const entry of resourceEntries) {
    if (entry.data.business && !allBusinesses.has(entry.data.business)) {
      throw new ContentError(`Resource "${entry.id}" refers to unknown product line "${entry.data.business}".`);
    }
    for (const id of entry.data.products) {
      if (!allProductIds.has(id)) throw new ContentError(`Resource "${entry.id}" refers to unknown product "${id}".`);
    }
  }
  for (const entry of faqEntries) {
    if (entry.data.business && !allBusinesses.has(entry.data.business)) {
      throw new ContentError(`FAQ "${entry.data.id}" refers to unknown product line "${entry.data.business}".`);
    }
  }

  // Product lines
  const lines = businessEntries
    .filter((entry) => visibility.isBusinessPublic(entry.data, CONTEXT))
    .map((entry): Line => {
      const data = entry.data;
      return {
        id: data.id,
        name: data.name,
        tagline: data.tagline,
        description: data.description,
        status: data.status,
        statusLabel: BUSINESS_STATUSES[data.status],
        hue: data.hue,
        glyph: data.glyph,
        art: data.art,
        examples: data.examples,
        audience: data.audience,
        disclaimer: data.disclaimer,
        order: data.order,
        url: routes.line(data.id),
        seo: data.seo,
        isPreview: !visibility.isBusinessPublic(data, PUBLIC_ONLY),
      };
    })
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name));
  const linesById = new Map(lines.map((line) => [line.id, line]));

  // Products
  const products = productEntries
    .filter((entry) => visibility.isProductPublic(entry.data, allBusinesses, CONTEXT))
    .map((entry): Product | null => {
      const line = linesById.get(entry.data.business);
      if (!line) return null;
      return toProduct(entry, line, visibility.isProductPublic(entry.data, allBusinesses, PUBLIC_ONLY));
    })
    .filter((product): product is Product => product !== null)
    .sort((a, b) => Number(b.featured) - Number(a.featured) || a.featuredOrder - b.featuredOrder || a.name.localeCompare(b.name));
  const productsById = new Map(products.map((product) => [product.id, product]));

  // Solutions
  const solutions = solutionEntries
    .filter((entry) => visibility.isSolutionPublic(entry.data, allBusinesses, CONTEXT))
    .map((entry): Solution => {
      const data = entry.data;
      const solutionLines = data.businesses.map((id) => linesById.get(id)).filter((line): line is Line => line !== undefined);
      const lineIds = new Set(solutionLines.map((line) => line.id));
      const explicit = data.products.map((id) => productsById.get(id)).filter((p): p is Product => p !== undefined);
      return {
        id: data.id,
        title: data.title,
        summary: data.summary,
        problem: data.problem,
        approach: data.approach,
        tasks: data.tasks,
        icon: data.icon,
        keywords: data.keywords,
        order: data.order,
        url: routes.solution(data.id),
        lines: solutionLines,
        products: explicit.length > 0 ? explicit : products.filter((product) => lineIds.has(product.line.id)),
        seo: data.seo,
      };
    })
    .sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

  // Resources
  const resources = resourceEntries
    .filter((entry) => visibility.isResourcePublic(entry.data, allBusinesses, CONTEXT))
    .map((entry): Resource => {
      const data = entry.data;
      const words = (entry.body ?? '').split(/\s+/).filter(Boolean).length;
      return {
        id: entry.id,
        title: data.title,
        description: data.description,
        type: data.type,
        typeLabel: RESOURCE_TYPES[data.type],
        url: routes.resource(entry.id),
        publishDate: data.publishDate,
        updatedDate: data.updatedDate,
        line: data.business ? linesById.get(data.business) : undefined,
        products: data.products.map((id) => productsById.get(id)).filter((p): p is Product => p !== undefined),
        tags: data.tags,
        featured: data.featured,
        readingMinutes: Math.max(1, Math.round(words / 230)),
        data,
        entry,
        isPreview: !visibility.isResourcePublic(data, allBusinesses, PUBLIC_ONLY),
      };
    })
    .sort((a, b) => b.publishDate.getTime() - a.publishDate.getTime() || a.title.localeCompare(b.title));

  // FAQs
  const faqs = faqEntries
    .filter((entry) => {
      if (PREVIEW_DRAFTS) return true;
      if (entry.data.status !== 'published') return false;
      return entry.data.business === undefined || linesById.has(entry.data.business);
    })
    .sort((a, b) => a.data.order - b.data.order)
    .map(
      (entry): Faq => ({
        id: entry.data.id,
        question: entry.data.question,
        paragraphs: entry.data.answer
          .split(/\n\s*\n/)
          .map((paragraph) => paragraph.replace(/\s+/g, ' ').trim())
          .filter(Boolean),
        link: entry.data.link,
        category: entry.data.category,
      }),
    );

  // Legal pages
  const legal = legalEntries
    .filter((entry) => visibility.isLegalPublic(entry.data, CONTEXT))
    .map(
      (entry): LegalPage => ({
        id: entry.id,
        title: entry.data.title,
        description: entry.data.description,
        lastUpdated: entry.data.lastUpdated,
        url: routes.legal(entry.id),
        entry,
        isPreview: !visibility.isLegalPublic(entry.data, PUBLIC_ONLY),
      }),
    );

  return { lines, linesById, products, productsById, solutions, resources, faqs, legal };
}

function toProduct(entry: ProductEntry, line: Line, isPublic: boolean): Product {
  const data = entry.data;
  const defaults = { currency: site.currency, locale: site.locale };
  const offers: Offer[] = data.offers.map((offer) => ({
    ...offer,
    display: displayOfferPrice(offer, defaults),
    action: resolveOfferAction(offer, {
      availability: data.availability,
      productId: entry.id,
      extraAllowedHosts: site.checkout.extraAllowedHosts,
      canContact: CAN_CONTACT,
    }),
  }));

  if (import.meta.env.PROD && isPublic && data.availability === 'available') {
    const broken = offers.filter((offer) => offer.action.kind === 'unavailable');
    if (offers.length === 0 || broken.length === offers.length) {
      console.warn(
        `[catalog] "${entry.id}" is public and "available" but has no working checkout or download link. It will show "${broken[0]?.action.label ?? 'no pricing'}".`,
      );
    }
  }

  const actionable = offers.find((offer) => offer.action.kind !== 'unavailable');
  const positive = data.offers.filter((offer) => offer.price !== null && offer.price > 0).map((offer) => offer.price as number);
  const isFree = data.offers.length > 0 && data.offers.every((offer) => offer.price === 0);

  return {
    id: entry.id,
    name: data.name,
    url: routes.product(line.id, entry.id),
    line,
    type: data.type,
    typeLabel: PRODUCT_TYPES[data.type],
    summary: data.summary,
    tagline: data.tagline,
    availability: data.availability,
    availabilityLabel: AVAILABILITY[data.availability],
    featured: data.featured,
    featuredOrder: data.featuredOrder,
    releaseDate: data.releaseDate,
    updatedDate: data.updatedDate,
    version: data.version,
    offers,
    priceSummary: summarizePricing(data.offers, defaults),
    pricingModel: pricingModelLabel(data.offers, data.type === 'bundle'),
    primaryAction: (actionable ?? offers[0])?.action ?? null,
    isFree,
    sortPrice: isFree ? 0 : positive.length > 0 ? Math.min(...positive) : Number.POSITIVE_INFINITY,
    data,
    entry,
    isPreview: !isPublic,
  };
}

/* ───────────────────────────── helpers ───────────────────────────── */

/**
 * Which optional sections have public content. Their index pages
 * (/products/, /solutions/, /resources/) are generated only when true, and
 * navigation, footer, search and 404 links follow the same flags — so a
 * single-product site never links to an empty catalog.
 */
export interface Sections {
  products: boolean;
  solutions: boolean;
  resources: boolean;
}

export async function getSections(): Promise<Sections> {
  const { lines, solutions, resources } = await getCatalog();
  return { products: lines.length > 0, solutions: solutions.length > 0, resources: resources.length > 0 };
}

export async function getRelatedProducts(product: Product, limit = 3): Promise<Product[]> {
  const { products, productsById } = await getCatalog();
  const explicit = product.data.related.map((id) => productsById.get(id)).filter((p): p is Product => p !== undefined);
  const sameLine = products.filter((p) => p.id !== product.id && p.line.id === product.line.id && !explicit.includes(p));
  return [...explicit, ...sameLine].slice(0, limit);
}

export async function getResourcesForProduct(product: Product, limit = 4): Promise<Resource[]> {
  const { resources } = await getCatalog();
  return resources
    .filter((resource) => resource.products.some((p) => p.id === product.id) || resource.line?.id === product.line.id)
    .sort((a, b) => Number(b.products.some((p) => p.id === product.id)) - Number(a.products.some((p) => p.id === product.id)))
    .slice(0, limit);
}

export function contactEmail(kind: 'general' | 'support' | 'business'): string | undefined {
  return site.contact[kind] ?? site.contact.general;
}

/**
 * Whether early-access requests can actually reach you: a form provider, or an
 * email address for the email fallback. Copy such as "Early access open" is
 * only shown while this is true.
 */
export function canRegister(): boolean {
  return site.contact.form.provider !== 'none' || Boolean(contactEmail('business'));
}

/** Legal links for the footer: external URLs from config win over internal pages. */
export async function getLegalLinks(): Promise<Array<{ label: string; href: string }>> {
  const { legal } = await getCatalog();
  const internal = new Map(legal.map((page) => [page.id, page]));
  const links: Array<{ label: string; href: string }> = [];
  const add = (label: string, id: string, external: string | undefined) => {
    if (external) links.push({ label, href: external });
    else if (internal.has(id)) links.push({ label, href: routes.legal(id) });
  };
  add('Privacy', 'privacy', site.legal.privacyUrl);
  add('Terms', 'terms', site.legal.termsUrl);
  add('Refunds', 'refunds', site.legal.refundsUrl);
  return links;
}
