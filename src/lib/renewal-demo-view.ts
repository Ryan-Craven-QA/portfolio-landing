/**
 * HTML rendering for the RenewalTrail demo. Shared by the server render (so
 * the demo is readable without JavaScript) and the client script (which
 * re-renders after each interaction). Pure: returns escaped HTML strings.
 */
import { ACTION_LABELS, evaluate, nextToExpire, type RenewalStatus, type TrackedDocument } from './renewals.ts';

export interface Person {
  id: string;
  name: string;
  role: string;
  hue: number;
}

const ESCAPES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const escapeHtml = (value: string) => value.replace(/[&<>"']/g, (char) => ESCAPES[char] ?? char);

const STATUS_CLASS: Record<RenewalStatus, string> = {
  expired: 'text-danger border-[color-mix(in_oklch,var(--danger)_45%,transparent)] bg-[color-mix(in_oklch,var(--danger)_9%,transparent)]',
  missing: 'text-danger border-[color-mix(in_oklch,var(--danger)_45%,transparent)] bg-[color-mix(in_oklch,var(--danger)_9%,transparent)]',
  'due-soon': 'text-caution border-[color-mix(in_oklch,var(--caution)_45%,transparent)] bg-[color-mix(in_oklch,var(--caution)_8%,transparent)]',
  'follow-up': 'text-caution border-[color-mix(in_oklch,var(--caution)_45%,transparent)] bg-[color-mix(in_oklch,var(--caution)_8%,transparent)]',
  received: 'text-tone border-[var(--tone-line)] bg-[var(--tone-soft)]',
  requested: 'text-ink-2',
  upcoming: 'text-ink-2',
  current: 'text-ok border-[color-mix(in_oklch,var(--ok)_40%,transparent)]',
};

export function dueDate(expiresIn: number | null, today: Date, locale: string): string {
  if (expiresIn === null) return '—';
  const date = new Date(today.getFullYear(), today.getMonth(), today.getDate() + expiresIn);
  return new Intl.DateTimeFormat(locale, { month: 'short', day: 'numeric', year: 'numeric' }).format(date);
}

const badge = (status: RenewalStatus, label: string) =>
  `<span class="badge whitespace-nowrap ${STATUS_CLASS[status]}"${status === 'received' ? ' style="--tone-h: 250"' : ''}><span class="badge-dot" aria-hidden="true"></span>${escapeHtml(label)}</span>`;

const avatar = (person: Person) =>
  `<span class="inline-grid size-6 shrink-0 place-items-center rounded-full border border-[var(--tone-line)] bg-[var(--tone-soft)] text-[0.6875rem] font-semibold text-tone" style="--tone-h: ${person.hue}" aria-hidden="true">${escapeHtml(person.name.charAt(0))}</span>`;

function actionButton(doc: TrackedDocument, size: 'sm' | 'md'): string {
  const { action } = evaluate(doc);
  if (!action) return '';
  const label = ACTION_LABELS[action];
  const context = `${doc.vendor}, ${doc.document}`;
  const sizing = size === 'sm' ? 'mt-2 px-2.5 py-1 text-xs' : 'mt-3 w-full justify-center px-3 py-2 text-sm';
  return `<button type="button" class="demo-action inline-flex items-center gap-1.5 rounded-md border border-line-strong bg-surface-2 font-medium text-ink transition-colors hover:border-ink-3 hover:bg-surface-3 ${sizing}" data-action="${action}" data-id="${escapeHtml(doc.id)}" aria-label="${escapeHtml(`${label}: ${context}`)}">${escapeHtml(label)}</button>`;
}

export function renderTableRows(docs: readonly TrackedDocument[], people: (id: string) => Person, today: Date, locale: string): string {
  return docs
    .map((doc) => {
      const result = evaluate(doc);
      const person = people(doc.owner);
      return `<tr class="border-t border-line align-top" data-doc="${escapeHtml(doc.id)}">
  <th scope="row" class="py-3.5 pr-4 pl-5 text-left font-normal"><span class="block font-medium text-ink">${escapeHtml(doc.vendor)}</span><span class="block text-xs text-ink-3">${escapeHtml(doc.trade)}</span></th>
  <td class="py-3.5 pr-4 text-ink-2">${escapeHtml(doc.document)}</td>
  <td class="py-3.5 pr-4"><span class="tabular block whitespace-nowrap text-ink">${escapeHtml(dueDate(doc.expiresIn, today, locale))}</span><span class="block text-xs text-ink-3">${escapeHtml(result.detail)}</span></td>
  <td class="py-3.5 pr-4">${badge(result.status, result.label)}${result.note ? `<span class="mt-1.5 block text-xs text-ink-3">${escapeHtml(result.note)}</span>` : ''}</td>
  <td class="py-3.5 pr-4"><span class="inline-flex items-center gap-2 whitespace-nowrap text-ink-2">${avatar(person)}${escapeHtml(person.name)}</span></td>
  <td class="py-3.5 pr-5"><span class="block text-ink-2">${escapeHtml(result.nextAction)}</span>${actionButton(doc, 'sm')}</td>
</tr>`;
    })
    .join('');
}

export function renderCards(docs: readonly TrackedDocument[], people: (id: string) => Person, today: Date, locale: string): string {
  return docs
    .map((doc) => {
      const result = evaluate(doc);
      const person = people(doc.owner);
      return `<li class="rounded-[var(--radius-control)] border border-line bg-surface p-4" data-doc="${escapeHtml(doc.id)}">
  <div class="flex items-start justify-between gap-3"><div class="min-w-0"><p class="font-medium text-ink">${escapeHtml(doc.vendor)}</p><p class="text-sm text-ink-3">${escapeHtml(doc.document)}</p></div>${badge(result.status, result.label)}</div>
  <dl class="mt-3 grid grid-cols-2 gap-3 text-sm">
    <div><dt class="text-xs text-ink-3">Expires</dt><dd class="text-ink-2"><span class="tabular">${escapeHtml(dueDate(doc.expiresIn, today, locale))}</span><span class="block text-xs text-ink-3">${escapeHtml(result.detail)}</span></dd></div>
    <div><dt class="text-xs text-ink-3">Following up</dt><dd class="mt-0.5 flex items-center gap-2 text-ink-2">${avatar(person)}${escapeHtml(person.name)}</dd></div>
  </dl>
  <p class="mt-3 text-sm text-ink-2"><span class="text-ink-3">Next: </span>${escapeHtml(result.nextAction)}${result.note ? ` <span class="text-ink-3">(${escapeHtml(result.note)})</span>` : ''}</p>
  ${actionButton(doc, 'md')}
</li>`;
    })
    .join('');
}

/** "Next to expire" line shown above the table. */
export function renderNextUp(docs: readonly TrackedDocument[], people: (id: string) => Person, today: Date, locale: string): string {
  const next = nextToExpire(docs);
  if (!next) return '<span class="text-ink-2">Nothing is due to expire — every document on file is current.</span>';
  const person = people(next.owner);
  const when = next.expiresIn === 0 ? 'today' : `in ${next.expiresIn} day${next.expiresIn === 1 ? '' : 's'} (${dueDate(next.expiresIn, today, locale)})`;
  return `<span class="text-ink-3">Next to expire:</span> <strong class="font-semibold text-ink">${escapeHtml(next.vendor)}</strong> <span class="text-ink-2">— ${escapeHtml(next.document.toLowerCase())}, ${escapeHtml(when)}.</span> <span class="inline-flex items-center gap-1.5 whitespace-nowrap text-ink-2">${avatar(person)}${escapeHtml(person.name)} is following up.</span>`;
}
