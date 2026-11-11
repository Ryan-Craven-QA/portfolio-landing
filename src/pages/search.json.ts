/**
 * Search index for the ⌘K dialog. Built from the public catalog only, so
 * drafts and hidden product lines can never appear in search.
 */
import type { APIRoute } from 'astro';
import { landingAnchors } from '../config/navigation.ts';
import { getCatalog, getSections, site } from '../lib/catalog.ts';
import { routes } from '../lib/routes.ts';
import type { SearchRecord } from '../lib/search.ts';

export const GET: APIRoute = async () => {
  const { lines, products, solutions, resources } = await getCatalog();
  const sections = await getSections();
  const productMode = site.homepage === 'product';

  const records: SearchRecord[] = [
    ...(productMode
      ? [
          { k: 'page' as const, t: 'How it works', d: `How ${site.name} would fit your week`, u: landingAnchors.howItWorks, g: 'steps setup weekly check' },
          { k: 'page' as const, t: 'Interactive demo', d: 'Try it with fictional vendors', u: landingAnchors.demo, g: 'example sample preview try' },
          { k: 'page' as const, t: 'Planned pricing', d: 'Starter Kit and software plans under consideration', u: landingAnchors.pricing, g: 'price cost plans' },
          { k: 'page' as const, t: 'Early access', d: 'Join the list or request an interview', u: landingAnchors.register, g: 'sign up waitlist interview register' },
        ]
      : []),
    ...(sections.products ? [{ k: 'page' as const, t: 'Products', d: 'The full catalog', u: routes.products, g: 'catalog shop buy store' }] : []),
    ...(sections.solutions ? [{ k: 'page' as const, t: 'Solutions', d: 'Products organized by problem', u: routes.solutions, g: 'problems use cases' }] : []),
    ...(sections.resources
      ? [{ k: 'page' as const, t: 'Resources', d: 'Guides, tutorials, downloads, and docs', u: routes.resources, g: 'guides docs documentation free downloads' }]
      : []),
    { k: 'page', t: productMode ? 'Help and FAQ' : 'Support', d: productMode ? 'Common questions' : 'Help, FAQ, and documentation', u: routes.support, g: 'help faq questions' },
    { k: 'page', t: 'Contact', d: productMode ? 'Questions and business inquiries' : 'General, support, and business inquiries', u: routes.contact, g: 'email message' },
    { k: 'page', t: 'About', d: `About ${site.name}`, u: routes.about, g: 'company founder' },
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
