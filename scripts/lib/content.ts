/**
 * Reads raw content files for the Node tooling (verify-build, preflight) and
 * classifies every entry with the SAME visibility rules the site uses.
 */
import { readdir, readFile } from 'node:fs/promises';
import { basename, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parse } from 'yaml';
import { routes } from '../../src/lib/routes.ts';
import {
  isBusinessPublic,
  isLegalPublic,
  isProductPublic,
  isResourcePublic,
  isSolutionPublic,
  type BusinessLike,
  type VisibilityContext,
} from '../../src/lib/visibility.ts';

export const projectRoot = fileURLToPath(new URL('../../', import.meta.url));

type Data = Record<string, unknown>;

export interface Classified {
  id: string;
  name: string;
  url: string;
  isPublic: boolean;
  data: Data;
}

export interface ContentSnapshot {
  lines: Classified[];
  products: Classified[];
  solutions: Classified[];
  resources: Classified[];
  legal: Classified[];
  faqs: Classified[];
}

const frontmatter = (source: string): Data => {
  const match = /^---\r?\n([\s\S]*?)\r?\n---/.exec(source);
  return match ? ((parse(match[1] ?? '') as Data | null) ?? {}) : {};
};

async function markdownEntries(dir: string): Promise<Array<{ id: string; data: Data }>> {
  let files: string[] = [];
  try {
    files = await readdir(dir);
  } catch {
    return [];
  }
  const entries = [];
  for (const file of files.sort()) {
    if (file.startsWith('_') || !['.md', '.mdx'].includes(extname(file))) continue;
    entries.push({ id: basename(file, extname(file)), data: frontmatter(await readFile(join(dir, file), 'utf8')) });
  }
  return entries;
}

async function yamlList(file: string): Promise<Data[]> {
  try {
    return (parse(await readFile(file, 'utf8')) as Data[] | null) ?? [];
  } catch {
    return [];
  }
}

const str = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback);

export async function loadContent(fixtures: boolean, now = new Date()): Promise<ContentSnapshot> {
  const root = join(projectRoot, fixtures ? 'tests/fixtures/content' : 'src/content');
  const ctx: VisibilityContext = { previewDrafts: false, now };

  const lineData = await yamlList(join(root, 'businesses.yaml'));
  const businesses = new Map<string, BusinessLike>(lineData.map((d) => [str(d.id), { id: str(d.id), visible: d.visible === true }]));

  const lines = lineData.map((d) => {
    const id = str(d.id);
    return { id, name: str(d.name), url: routes.line(id), isPublic: isBusinessPublic({ id, visible: d.visible === true }, ctx), data: d };
  });

  const products = (await markdownEntries(join(root, 'products'))).map(({ id, data }) => {
    const business = str(data.business);
    const visibility = data.visibility === 'public' ? 'public' : 'draft';
    return { id, name: str(data.name), url: routes.product(business, id), isPublic: isProductPublic({ visibility, business }, businesses, ctx), data };
  });

  const solutions = (await yamlList(join(root, 'solutions.yaml'))).map((d) => {
    const id = str(d.id);
    const lineIds = Array.isArray(d.businesses) ? d.businesses.map((b) => str(b)) : [];
    return { id, name: str(d.title), url: routes.solution(id), isPublic: isSolutionPublic({ businesses: lineIds }, businesses, ctx), data: d };
  });

  const resources = (await markdownEntries(join(root, 'resources'))).map(({ id, data }) => {
    const status = data.status === 'published' ? 'published' : 'draft';
    const publishDate = new Date(str(data.publishDate) || String(data.publishDate ?? '2100-01-01'));
    const business = typeof data.business === 'string' ? data.business : undefined;
    return { id, name: str(data.title), url: routes.resource(id), isPublic: isResourcePublic({ status, publishDate, business }, businesses, ctx), data };
  });

  const legal = (await markdownEntries(join(root, 'legal'))).map(({ id, data }) => ({
    id,
    name: str(data.title),
    url: routes.legal(id),
    isPublic: isLegalPublic({ status: data.status === 'published' ? 'published' : 'draft' }, ctx),
    data,
  }));

  const faqs = (await yamlList(join(root, 'faqs.yaml'))).map((d) => {
    const business = typeof d.business === 'string' ? d.business : undefined;
    const lineVisible = business === undefined || businesses.get(business)?.visible === true;
    return { id: str(d.id), name: str(d.question), url: routes.support, isPublic: d.status === 'published' && lineVisible, data: d };
  });

  return { lines, products, solutions, resources, legal, faqs };
}
