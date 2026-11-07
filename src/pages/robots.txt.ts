import type { APIRoute } from 'astro';
import { shouldNoIndex } from '../config/load.ts';
import { site } from '../lib/catalog.ts';

/**
 * robots.txt. Blocks everything while the canonical URL is a placeholder,
 * on Cloudflare preview branches, or when SITE_NOINDEX=true.
 */
export const GET: APIRoute = ({ site: astroSite }) => {
  const siteUrl = (astroSite?.href ?? site.url).replace(/\/$/, '');
  const body = shouldNoIndex(siteUrl)
    ? '# This build is not meant to be indexed (placeholder site URL, preview branch, or SITE_NOINDEX).\nUser-agent: *\nDisallow: /\n'
    : `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap-index.xml\n`;
  return new Response(body, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
