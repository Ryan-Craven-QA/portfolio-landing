/**
 * Structured data (JSON-LD) builders. Only factual fields are emitted:
 * no ratings, reviews or claims — and Product markup only for products that
 * are actually purchasable with a real price.
 */
import type { SiteConfig } from './schemas/site.ts';
import type { Product, Resource } from './catalog.ts';

type Json = Record<string, unknown>;

const abs = (path: string, siteUrl: string) => new URL(path, `${siteUrl}/`).href;

export function organizationLd(site: SiteConfig, siteUrl: string): Json {
  const org: Json = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: site.legalName ?? site.name,
    alternateName: site.legalName ? site.name : undefined,
    url: `${siteUrl}/`,
    logo: abs('/apple-touch-icon.png', siteUrl),
    description: site.description,
  };
  if (site.contact.general) org.email = site.contact.general;
  if (site.social.length > 0) org.sameAs = site.social.map((s) => s.url);
  return prune(org);
}

export function websiteLd(site: SiteConfig, siteUrl: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    name: site.name,
    url: `${siteUrl}/`,
    description: site.description,
    inLanguage: site.locale,
    publisher: { '@id': `${siteUrl}/#organization` },
  };
}

export function breadcrumbLd(items: Array<{ label: string; href?: string | undefined }>, siteUrl: string): Json {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => prune({
      '@type': 'ListItem',
      position: i + 1,
      name: item.label,
      item: item.href ? abs(item.href, siteUrl) : undefined,
    })),
  };
}

/** Product + Offer markup — only for available products with priced, purchasable offers. */
export function productLd(product: Product, site: SiteConfig, siteUrl: string, imageUrl: string | undefined): Json | null {
  if (product.availability !== 'available' && product.availability !== 'early-access') return null;
  const offers = product.offers
    .filter((offer) => offer.price !== null && (offer.action.kind === 'purchase' || offer.action.kind === 'download'))
    .map((offer) => ({
      '@type': 'Offer',
      name: offer.label,
      price: offer.price,
      priceCurrency: offer.currency ?? site.currency,
      availability: product.availability === 'available' ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      url: abs(product.url, siteUrl),
    }));
  if (offers.length === 0) return null;
  return prune({
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.summary,
    category: product.typeLabel,
    image: imageUrl,
    url: abs(product.url, siteUrl),
    brand: { '@type': 'Brand', name: site.name },
    offers,
  });
}

export function articleLd(resource: Resource, site: SiteConfig, siteUrl: string): Json {
  return prune({
    '@context': 'https://schema.org',
    '@type': resource.type === 'tutorial' || resource.type === 'guide' ? 'TechArticle' : 'Article',
    headline: resource.title,
    description: resource.description,
    datePublished: resource.publishDate.toISOString(),
    dateModified: (resource.updatedDate ?? resource.publishDate).toISOString(),
    mainEntityOfPage: abs(resource.url, siteUrl),
    author: { '@id': `${siteUrl}/#organization` },
    publisher: { '@id': `${siteUrl}/#organization` },
    inLanguage: site.locale,
    keywords: resource.tags.length > 0 ? resource.tags.join(', ') : undefined,
  });
}

function prune<T extends Json>(obj: T): T {
  for (const key of Object.keys(obj)) if (obj[key] === undefined) delete obj[key];
  return obj;
}
