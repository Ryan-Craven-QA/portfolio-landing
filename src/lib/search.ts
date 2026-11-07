/**
 * Tiny client-side search used by the ⌘K dialog, the homepage task finder and
 * the catalog/resource filters. Pure module, unit tested.
 *
 * Every term must match (AND); matches in titles outrank keywords and
 * descriptions. Accents and punctuation are ignored.
 */

export type SearchKind = 'page' | 'line' | 'product' | 'solution' | 'resource' | 'task';

/** Compact index record served from /search.json. */
export interface SearchRecord {
  /** title */ t: string;
  /** description / context */ d: string;
  /** url */ u: string;
  /** kind */ k: SearchKind;
  /** keywords */ g?: string;
  /** product-line hue */ h?: number;
}

export interface PreparedRecord extends SearchRecord {
  title: string;
  words: string[];
  keywords: string;
  description: string;
}

export function normalize(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

export function tokenize(query: string): string[] {
  return normalize(query).split(' ').filter((term) => term.length > 0);
}

export function prepare(record: SearchRecord): PreparedRecord {
  const title = normalize(record.t);
  return {
    ...record,
    title,
    words: title.split(' '),
    keywords: normalize(record.g ?? ''),
    description: normalize(record.d),
  };
}

const KIND_BOOST: Record<SearchKind, number> = {
  product: 3,
  line: 2.5,
  solution: 2,
  task: 1.5,
  resource: 1,
  page: 0.5,
};

/** Score a record against query terms; 0 means "no match". */
export function score(record: PreparedRecord, terms: readonly string[]): number {
  if (terms.length === 0) return 0;
  let total = 0;
  for (const term of terms) {
    let best = 0;
    if (record.title.startsWith(term)) best = 12;
    else if (record.words.some((word) => word.startsWith(term))) best = 8;
    else if (record.title.includes(term)) best = 5;
    else if (record.keywords.includes(term)) best = 4;
    else if (record.description.includes(term)) best = 2;
    if (best === 0) return 0;
    total += best;
  }
  return total + KIND_BOOST[record.k];
}

export function search(records: readonly PreparedRecord[], query: string, limit = 12): PreparedRecord[] {
  const terms = tokenize(query);
  if (terms.length === 0) return [];
  return records
    .map((record) => ({ record, value: score(record, terms) }))
    .filter((entry) => entry.value > 0)
    .sort((a, b) => b.value - a.value || a.record.t.localeCompare(b.record.t))
    .slice(0, limit)
    .map((entry) => entry.record);
}

/** Simple "does this text match every term" check for list filtering. */
export function matchesAll(haystack: string, query: string): boolean {
  const terms = tokenize(query);
  if (terms.length === 0) return true;
  const text = normalize(haystack);
  return terms.every((term) => text.includes(term));
}
