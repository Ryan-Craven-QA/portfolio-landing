/**
 * Site search dialog (⌘K / Ctrl+K / "/").
 * Combobox pattern: focus stays in the input, arrow keys move the active
 * option (aria-activedescendant), Enter opens it. The index (/search.json)
 * contains public content only and is fetched on first open.
 */
import { prepare, search, type PreparedRecord, type SearchKind, type SearchRecord } from '../lib/search.ts';

const GROUPS: Array<{ kind: SearchKind; label: string }> = [
  { kind: 'product', label: 'Products' },
  { kind: 'line', label: 'Product lines' },
  { kind: 'solution', label: 'Solutions' },
  { kind: 'task', label: 'Tasks' },
  { kind: 'resource', label: 'Resources' },
  { kind: 'page', label: 'Pages' },
];

function isTypingTarget(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  return target.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
}

export function initSearchDialog() {
  const dialog = document.querySelector<HTMLDialogElement>('#search-dialog');
  if (!dialog) return;
  const input = dialog.querySelector<HTMLInputElement>('[data-search-input]');
  const listbox = dialog.querySelector<HTMLElement>('[data-search-results]');
  const status = dialog.querySelector<HTMLElement>('[data-search-status]');
  const suggestions = dialog.querySelector<HTMLElement>('[data-search-suggestions]');
  const noResults = dialog.querySelector<HTMLElement>('[data-search-empty]');
  if (!input || !listbox || !status || !suggestions || !noResults) return;

  const indexUrl = dialog.dataset.index ?? '/search.json';
  let records: PreparedRecord[] | null = null;
  let loading: Promise<void> | null = null;
  let options: HTMLAnchorElement[] = [];
  let active = -1;

  const load = () => {
    loading ??= fetch(indexUrl, { headers: { Accept: 'application/json' } })
      .then((response) => (response.ok ? (response.json() as Promise<SearchRecord[]>) : Promise.reject(new Error(String(response.status)))))
      .then((data) => {
        records = data.map(prepare);
      })
      .catch(() => {
        records = [];
        status.textContent = 'Search is unavailable right now.';
      });
    return loading;
  };

  const setActive = (index: number) => {
    active = options.length === 0 ? -1 : (index + options.length) % options.length;
    options.forEach((option, i) => option.setAttribute('aria-selected', String(i === active)));
    const current = options[active];
    if (current) {
      input.setAttribute('aria-activedescendant', current.id);
      current.scrollIntoView({ block: 'nearest' });
    } else {
      input.removeAttribute('aria-activedescendant');
    }
  };

  const render = () => {
    const query = input.value.trim();
    const results = query && records ? search(records, query, 24) : [];
    const fragment = document.createDocumentFragment();
    options = [];

    for (const group of GROUPS) {
      const items = results.filter((result) => result.k === group.kind);
      if (items.length === 0) continue;
      const section = document.createElement('div');
      section.setAttribute('role', 'group');
      const headingId = `search-group-${group.kind}`;
      section.setAttribute('aria-labelledby', headingId);
      const heading = document.createElement('div');
      heading.id = headingId;
      heading.className = 'eyebrow px-3 pt-4 pb-2';
      heading.textContent = group.label;
      section.append(heading);
      for (const item of items) {
        const option = document.createElement('a');
        option.href = item.u;
        option.id = `search-option-${options.length}`;
        option.setAttribute('role', 'option');
        option.setAttribute('aria-selected', 'false');
        option.tabIndex = -1;
        option.className =
          'search-option group flex items-center gap-3 rounded-lg px-3 py-2.5 text-ink-2 aria-selected:bg-surface-2 aria-selected:text-ink';
        if (item.h !== undefined) option.style.setProperty('--tone-h', String(item.h));
        const dot = document.createElement('span');
        dot.className = 'size-2 shrink-0 rounded-full';
        dot.style.background = item.h !== undefined ? `oklch(var(--tone-l) var(--tone-c) ${item.h})` : 'var(--ink-3)';
        const text = document.createElement('span');
        text.className = 'min-w-0 flex-1';
        const title = document.createElement('span');
        title.className = 'block truncate font-medium text-ink';
        title.textContent = item.t;
        const desc = document.createElement('span');
        desc.className = 'block truncate text-sm text-ink-3';
        desc.textContent = item.d;
        text.append(title, desc);
        option.append(dot, text);
        option.addEventListener('pointermove', () => {
          const index = options.indexOf(option);
          if (index !== active) setActive(index);
        });
        options.push(option);
        section.append(option);
      }
      fragment.append(section);
    }

    listbox.replaceChildren(fragment);
    suggestions.hidden = query.length > 0;
    noResults.hidden = !(query.length > 0 && records !== null && options.length === 0);
    input.setAttribute('aria-expanded', String(options.length > 0));
    status.textContent = query ? (records ? `${options.length} result${options.length === 1 ? '' : 's'}` : 'Loading…') : '';
    setActive(0);
  };

  const open = () => {
    if (!dialog.open) dialog.showModal();
    input.select();
    render();
    void load().then(render);
  };

  input.addEventListener('input', render);
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setActive(active + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActive(active - 1);
    } else if (event.key === 'Enter') {
      const current = options[active];
      if (current) {
        event.preventDefault();
        window.location.assign(current.href);
      }
    }
  });

  dialog.addEventListener('click', (event) => {
    const target = event.target as Element;
    if (target === dialog || target.closest('[data-search-close]')) dialog.close();
  });

  document.addEventListener('click', (event) => {
    if ((event.target as Element | null)?.closest('[data-search-open]')) {
      event.preventDefault();
      open();
    }
  });

  document.addEventListener('keydown', (event) => {
    const key = event.key.toLowerCase();
    if ((event.metaKey || event.ctrlKey) && key === 'k') {
      event.preventDefault();
      if (dialog.open) dialog.close();
      else open();
    } else if (key === '/' && !dialog.open && !isTypingTarget(event.target)) {
      event.preventDefault();
      open();
    }
  });

  // Warm the index when the visitor shows intent.
  document.addEventListener(
    'pointerover',
    (event) => {
      if ((event.target as Element | null)?.closest('[data-search-open]')) void load();
    },
    { passive: true },
  );
}
