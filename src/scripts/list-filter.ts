/**
 * Client-side filtering for server-rendered lists (product catalog, resource
 * library). Everything is rendered in the HTML first; this only shows, hides
 * and reorders items, so the page is complete without JavaScript.
 *
 * Markup contract
 *   <form data-filter-form data-filter-target="#grid" data-default-sort="featured:asc">
 *     <input name="q">                          free-text search (data-search on items)
 *     <input type="radio" name="line" value=""> facet radios; "" means "all"
 *     <select name="sort">                      values like "price:asc" → data-sort-price
 *   </form>
 *   [data-filter-item] items with data-<facet> and data-sort-<key> attributes
 *   [data-filter-count] polite live region, [data-filter-empty] no-results block,
 *   [data-filter-reset] buttons that clear everything.
 * Filter state is mirrored to the URL (?line=…&q=…) so views can be shared.
 */
import { matchesAll } from '../lib/search.ts';

type State = Record<string, string>;

function compare(a: string | undefined, b: string | undefined, dir: number): number {
  const emptyA = a === undefined || a === '';
  const emptyB = b === undefined || b === '';
  if (emptyA || emptyB) return emptyA === emptyB ? 0 : emptyA ? 1 : -1; // empties last
  const na = Number(a);
  const nb = Number(b);
  if (!Number.isNaN(na) && !Number.isNaN(nb)) return (na - nb) * dir;
  return a.localeCompare(b) * dir;
}

export function initListFilter(form: HTMLFormElement) {
  const target = document.querySelector<HTMLElement>(form.dataset.filterTarget ?? '');
  if (!target) return;
  const items = [...target.querySelectorAll<HTMLElement>('[data-filter-item]')];
  const scope = form.dataset.filterScope ?? '';
  const count = document.querySelector<HTMLElement>(`[data-filter-count="${scope}"]`);
  const empty = document.querySelector<HTMLElement>(`[data-filter-empty="${scope}"]`);
  const defaultSort = form.dataset.defaultSort ?? '';
  const noun = form.dataset.noun ?? 'item';
  const nouns = form.dataset.nounPlural ?? `${noun}s`;
  const original = new Map(items.map((item, index) => [item, index]));

  const controls = () => [...form.elements, ...document.querySelectorAll(`[form="${form.id}"]`)] as Array<HTMLInputElement | HTMLSelectElement>;

  const readState = (): State => {
    const state: State = {};
    for (const control of controls()) {
      if (!control.name) continue;
      if (control instanceof HTMLInputElement && control.type === 'radio') {
        if (control.checked) state[control.name] = control.value;
      } else {
        state[control.name] = control.value.trim();
      }
    }
    return state;
  };

  const writeUrl = (state: State) => {
    const url = new URL(window.location.href);
    for (const [key, value] of Object.entries(state)) {
      if (value && !(key === 'sort' && value === defaultSort)) url.searchParams.set(key, value);
      else url.searchParams.delete(key);
    }
    window.history.replaceState(window.history.state, '', url);
  };

  const apply = ({ updateUrl = true } = {}) => {
    const state = readState();
    const query = state.q ?? '';
    let shown = 0;
    for (const item of items) {
      let visible = matchesAll(item.dataset.search ?? '', query);
      for (const [key, value] of Object.entries(state)) {
        if (!visible || key === 'q' || key === 'sort' || value === '') continue;
        if ((item.dataset[key] ?? '') !== value) visible = false;
      }
      item.hidden = !visible;
      if (visible) shown++;
    }

    const [sortKey = '', sortDir = 'asc'] = (state.sort || defaultSort).split(':');
    const dir = sortDir === 'desc' ? -1 : 1;
    const attr = `sort${sortKey.charAt(0).toUpperCase()}${sortKey.slice(1)}`;
    const ordered = [...items].sort((a, b) => {
      const result = sortKey ? compare(a.dataset[attr], b.dataset[attr], dir) : 0;
      return result || (original.get(a) ?? 0) - (original.get(b) ?? 0);
    });
    target.append(...ordered);

    if (count) count.textContent = shown === items.length ? `${items.length} ${items.length === 1 ? noun : nouns}` : `${shown} of ${items.length} ${nouns}`;
    if (empty) empty.hidden = shown !== 0;
    form.toggleAttribute('data-filtered', Object.entries(state).some(([key, value]) => value !== '' && !(key === 'sort' && value === defaultSort)));
    if (updateUrl) writeUrl(state);
  };

  // Restore state from the URL.
  const params = new URL(window.location.href).searchParams;
  for (const control of controls()) {
    const value = params.get(control.name);
    if (value === null) continue;
    if (control instanceof HTMLInputElement && control.type === 'radio') control.checked = control.value === value;
    else control.value = value;
  }

  let timer = 0;
  form.addEventListener('input', (event) => {
    const isText = event.target instanceof HTMLInputElement && event.target.type === 'search';
    window.clearTimeout(timer);
    timer = window.setTimeout(() => apply(), isText ? 120 : 0);
  });
  form.addEventListener('change', () => apply());
  document.querySelectorAll(`[form="${form.id}"]`).forEach((el) => el.addEventListener('change', () => apply()));
  form.addEventListener('submit', (event) => event.preventDefault());
  document.querySelectorAll<HTMLElement>(`[data-filter-reset="${scope}"]`).forEach((button) =>
    button.addEventListener('click', () => {
      form.reset();
      for (const control of controls()) if (control instanceof HTMLSelectElement && control.name === 'sort') control.value = defaultSort;
      apply();
    }),
  );

  apply({ updateUrl: false });
}
