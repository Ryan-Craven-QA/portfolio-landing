/**
 * RSS feed of public resources and product releases. Doubles as the working
 * "follow updates" option while no newsletter provider is configured.
 */
import type { APIRoute } from 'astro';
import { getCatalog, site } from '../lib/catalog.ts';

const escapeXml = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');

export const GET: APIRoute = async ({ site: astroSite }) => {
  const siteUrl = (astroSite?.href ?? site.url).replace(/\/$/, '');
  const abs = (path: string) => new URL(path, `${siteUrl}/`).href;
  const { products, resources } = await getCatalog();

  const items = [
    ...resources.map((resource) => ({
      title: resource.title,
      link: abs(resource.url),
      description: resource.description,
      date: resource.updatedDate ?? resource.publishDate,
      category: resource.typeLabel,
    })),
    ...products
      .filter((product) => (product.releaseDate ?? product.updatedDate) !== undefined)
      .map((product) => ({
        title: `${product.name} (${product.availabilityLabel.toLowerCase()})`,
        link: abs(product.url),
        description: product.summary,
        date: (product.releaseDate ?? product.updatedDate) as Date,
        category: product.line.name,
      })),
  ]
    .sort((a, b) => b.date.getTime() - a.date.getTime())
    .slice(0, 50);

  const lastBuild = items[0]?.date ?? new Date();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(`${site.name} — updates`)}</title>
    <link>${siteUrl}/</link>
    <description>${escapeXml(site.description)}</description>
    <language>${escapeXml(site.locale)}</language>
    <lastBuildDate>${lastBuild.toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
${items
  .map(
    (item) => `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${item.link}</link>
      <guid isPermaLink="true">${item.link}</guid>
      <description>${escapeXml(item.description)}</description>
      <category>${escapeXml(item.category)}</category>
      <pubDate>${item.date.toUTCString()}</pubDate>
    </item>`,
  )
  .join('\n')}
  </channel>
</rss>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
};
