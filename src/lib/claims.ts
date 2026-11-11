/**
 * Claims guard: wording the public site must never use.
 *
 * - Scope: the product supports administrative tracking only. It must never
 *   claim to verify insurance, determine compliance or certify vendors, and
 *   never describe features that are not built (sign-in, automatic emails,
 *   AI extraction).
 * - Honesty: no invented social proof or hype words.
 * - Sales: while nothing is for sale, no "buy now", "in stock", trials, …
 *
 * `scripts/verify-build.ts` runs this over the text of every built page and
 * fails the build on a match. Questions ("Does it verify insurance?") and
 * negated sentences ("It does not verify insurance") are allowed, so FAQs and
 * disclaimers can say what the product does NOT do.
 *
 * Pure module — unit tested in tests/unit/claims.test.ts.
 */

export interface ClaimRule {
  id: string;
  pattern: RegExp;
  reason: string;
}

export interface ClaimViolation {
  rule: string;
  reason: string;
  excerpt: string;
}

const DOCS = String.raw`(?:insurance|coverage|polic(?:y|ies)|certificates?\s+of\s+insurance|COIs?)`;
const OWNERS = String.raw`(?:(?:that|your|the|each|every|their|all|vendor|vendors|vendor['’]s|vendors['’])\s+)*`;

/** Always enforced. */
export const SCOPE_RULES: ClaimRule[] = [
  {
    id: 'verifies-insurance',
    pattern: new RegExp(String.raw`\b(?:verif(?:y|ies|ied|ying)|validat(?:e|es|ed|ing)|confirm(?:s|ed|ing)?|audit(?:s|ed|ing)?)\s+${OWNERS}${DOCS}\b`, 'i'),
    reason: 'claims to verify insurance or coverage',
  },
  {
    id: 'ensures-compliance',
    pattern:
      /\b(?:ensur(?:e|es|ing)|guarantee(?:s|d|ing)?|assur(?:e|es|ing)|keep(?:s|ing)?\s+(?:you|your\s+\w+)|mak(?:e|es|ing)\s+(?:you|your\s+\w+)|stay(?:s|ing)?|remain(?:s|ing)?)\s+(?:fully\s+|legally\s+)?complian(?:t|ce)\b/i,
    reason: 'claims to ensure compliance',
  },
  { id: 'compliance-guaranteed', pattern: /\b(?:fully|100\s?%|always|legally)\s+compliant\b|\bcompliance\s+(?:guaranteed|assured|certified)\b/i, reason: 'claims compliance' },
  {
    id: 'certifies-vendors',
    pattern: /\bcertif(?:y|ies|ied|ying)\s+(?:that\s+)?(?:your\s+|the\s+|each\s+|every\s+)?(?:vendors?|contractors?|vendor\s+eligibility|eligibility)\b|\b(?:certified|vetted|approved|pre-?qualified)\s+(?:vendors?|contractors?)\b/i,
    reason: 'claims to certify or vet vendors',
  },
  { id: 'sign-in', pattern: /\b(?:sign|log)\s+in\b|\bcreate\s+(?:an?\s+|your\s+)?account\b/i, reason: 'mentions sign-in, which is not built' },
  {
    id: 'automation',
    pattern: /\bAI[- ](?:powered|driven|extraction)\b|\bautomatically\s+(?:sends?|emails?|chases?|extracts?|reads?|reminds?)\b|\bauto-?(?:sends?|reminders?)\b/i,
    reason: 'describes automation or AI that is not built',
  },
  {
    id: 'social-proof',
    pattern:
      /\btrusted\s+by\b|\b(?:our|happy|satisfied)\s+customers\b|\bcustomers\s+(?:love|say)\b|\btestimonials?\b|★|\b\d(?:\.\d)?\s*(?:\/\s*5|out\s+of\s+5)\b|\bas\s+seen\s+(?:on|in)\b|\baward[- ]winning\b|\bindustry[- ]leading\b|\bthousands\s+of\s+(?:customers|companies|teams|users|property\s+managers)\b/i,
    reason: 'social proof that does not exist',
  },
  { id: 'hype', pattern: /\b(?:revolutioni[sz]e\w*|supercharg\w*|seamless(?:ly)?|cutting[- ]edge|game[- ]chang\w*)\b/i, reason: 'hype wording (see CLAUDE.md copy rules)' },
];

/** Enforced while no product is for sale. */
export const SALES_RULES: ClaimRule[] = [
  {
    id: 'for-sale',
    pattern:
      /\b(?:buy|order|shop|purchase|subscribe)\s+now\b|\badd\s+to\s+(?:cart|basket)\b|\bin\s+stock\b|\b(?:now|currently)\s+available\b|\bavailable\s+(?:today|now)\b|\b(?:start\s+(?:your\s+)?)?free\s+trial\b|\bpre-?order\s+(?:now|today)\b/i,
    reason: 'implies something can be bought now',
  },
];

const NEGATION = /(?:\b(?:not|never|no|nor|without|cannot|neither)\b|n['’]t\b)/i;
const BOUNDARY = /[.!?\n]/;

/** The sentence around a match, and the part of it before the match. */
function sentenceAround(text: string, index: number, length: number) {
  let start = index;
  while (start > 0 && !BOUNDARY.test(text.charAt(start - 1))) start--;
  let end = index + length;
  while (end < text.length && !BOUNDARY.test(text.charAt(end))) end++;
  return { sentence: text.slice(start, end + 1).trim(), before: text.slice(start, index) };
}

export function findClaimViolations(text: string, options: { forSale: boolean }): ClaimViolation[] {
  const rules = options.forSale ? SCOPE_RULES : [...SCOPE_RULES, ...SALES_RULES];
  const violations: ClaimViolation[] = [];
  for (const rule of rules) {
    const global = new RegExp(rule.pattern.source, `${rule.pattern.flags.replace('g', '')}g`);
    for (const match of text.matchAll(global)) {
      const index = match.index ?? 0;
      const { sentence, before } = sentenceAround(text, index, match[0].length);
      // Questions don't assert anything; negations say what the product does not do.
      if (sentence.endsWith('?') || NEGATION.test(before)) continue;
      violations.push({ rule: rule.id, reason: rule.reason, excerpt: sentence.replace(/\s+/g, ' ').slice(0, 160) });
    }
  }
  return violations;
}

const ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  rsquo: '’',
  lsquo: '‘',
  rdquo: '”',
  ldquo: '“',
  mdash: '—',
  ndash: '–',
  hellip: '…',
};

/** Readable text of an HTML document: visible text plus title and meta descriptions, one block per line. */
export function htmlToText(html: string): string {
  const meta = [...html.matchAll(/<meta\s+(?:name|property)="(?:description|og:description|og:title|twitter:description)"\s+content="([^"]*)"/gi)].map((m) => m[1] ?? '');
  const body = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<(?:br|hr)\b[^>]*>|<\/(?:p|li|h[1-6]|div|td|th|tr|dt|dd|summary|title|figcaption|caption|label|legend|button|option)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ');
  return [...meta, body]
    .join('\n')
    .replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (entity, code: string) => {
      if (code.startsWith('#x') || code.startsWith('#X')) return String.fromCodePoint(Number.parseInt(code.slice(2), 16));
      if (code.startsWith('#')) return String.fromCodePoint(Number.parseInt(code.slice(1), 10));
      return ENTITIES[code.toLowerCase()] ?? entity;
    })
    .replace(/[ \t\f\v]+/g, ' ');
}
