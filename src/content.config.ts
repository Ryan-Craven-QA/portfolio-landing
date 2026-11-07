/**
 * Content collections. Schemas live in src/lib/schemas/content.ts.
 *
 * Files starting with "_" (e.g. products/_template.md) are ignored, so they can
 * hold copy-paste templates and notes.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import {
  businessSchema,
  faqSchema,
  legalSchema,
  productSchema,
  resourceSchema,
  solutionSchema,
} from './lib/schemas/content.ts';

// The e2e test build swaps in fixture content (see astro.fixtures.config.ts).
const root = process.env.SITE_FIXTURES === '1' ? './tests/fixtures/content' : './src/content';

export const collections = {
  businesses: defineCollection({
    loader: file(`${root}/businesses.yaml`),
    schema: businessSchema,
  }),
  products: defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: `${root}/products` }),
    schema: ({ image }) => productSchema(image),
  }),
  solutions: defineCollection({
    loader: file(`${root}/solutions.yaml`),
    schema: solutionSchema,
  }),
  resources: defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: `${root}/resources` }),
    schema: ({ image }) => resourceSchema(image),
  }),
  faqs: defineCollection({
    loader: file(`${root}/faqs.yaml`),
    schema: faqSchema,
  }),
  legal: defineCollection({
    loader: glob({ pattern: '**/[^_]*.{md,mdx}', base: `${root}/legal` }),
    schema: legalSchema,
  }),
};
