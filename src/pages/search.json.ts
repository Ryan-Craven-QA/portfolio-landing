/**
 * Search index for the ⌘K dialog. Built from the public catalog only, so
 * drafts and hidden product lines can never appear in search.
 */
import type { APIRoute } from 'astro';
import { getCatalog } from '../lib/catalog.ts';
import { routes } from '../lib/routes.ts';
import type { SearchRecord } from '../lib/search.ts';

export const GET: APIRoute = async () => {
  const { lines, products, solutions, resources } = await getCatalog();

  const records: SearchRecord[] = [
    { k: 'page', t: 'Products', d: 'The full catalog', u: routes.products, g: 'catalog shop buy store' },
    { k: 'page', t: 'Solutions', d: 'Products organized by problem', u: routes.solutions, g: 'problems use cases' },
    { k: 'page', t: 'Resources', d: 'Guides, tutorials, downloads, and docs', u: routes.resources, g: 'guides docs documentation free downloads' },
    { k: 'page', t: 'Support', d: 'Help, FAQ, and documentation', u: routes.support, g: 'help faq questions' },
    { k: 'page', t: 'Contact', d: 'General, support, and business inquiries', u: routes.contact, g: 'email message licensing agency' },
    { k: 'page', t: 'About', d: 'About the studio', u: routes.about, g: 'company studio founder' },
    ...lines.map((line) => ({ k: 'line' as const, t: line.name, d: line.tagline, u: line.url, g: line.examples.join(' '), h: line.hue })),
    ...products.map((product) => ({
      k: 'product' as const,
      t: product.name,
      d: `${product.typeLabel} · ${product.priceSummary ?? product.availabilityLabel}`,
      u: product.url,
      g: [product.summary, product.line.name, ...product.data.tags].join(' '),
      h: product.line.hue,
    })),
    ...solutions.map((solution) => ({
      k: 'solution' as const,
      t: solution.title,
      d: solution.summary,
      u: solution.url,
      g: [...solution.keywords, ...solution.tasks].join(' '),
      h: solution.lines[0]?.hue ?? 50,
    })),
    ...solutions.flatMap((solution) =>
      solution.tasks.map((task) => ({ k: 'task' as const, t: task, d: solution.title, u: solution.url, g: solution.keywords.join(' '), h: solution.lines[0]?.hue ?? 50 })),
    ),
    ...resources.map((resource) => ({
      k: 'resource' as const,
      t: resource.title,
      d: `${resource.typeLabel} · ${resource.description}`,
      u: resource.url,
      g: resource.tags.join(' '),
      ...(resource.line ? { h: resource.line.hue } : {}),
    })),
  ];

  return new Response(JSON.stringify(records), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
