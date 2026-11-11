/**
 * Interactive behaviour for the RenewalTrail demo. Works on a local copy of
 * the FICTIONAL data: filtering, sorting and demo actions only change what is
 * on screen. Nothing is stored, sent or requested over the network.
 */
import { demoDocuments, personById } from '../config/demo.ts';
import { renderCards, renderNextUp, renderTableRows } from '../lib/renewal-demo-view.ts';
import {
  ACTION_RESULTS,
  applyAction,
  countByView,
  evaluate,
  sortDocuments,
  type ActionKind,
  type RenewalView,
  type SortKey,
  type TrackedDocument,
} from '../lib/renewals.ts';
import { matchesAll } from '../lib/search.ts';

const VIEW_NAMES: Record<RenewalView, string> = {
  action: 'Needs action',
  waiting: 'Waiting on vendor',
  upcoming: 'Coming up',
  current: 'Current',
  all: 'All',
};

const clone = (docs: readonly TrackedDocument[]) => docs.map((doc) => ({ ...doc }));

export function initRenewalDemo(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-demo-controls]');
  const rows = root.querySelector<HTMLElement>('[data-demo-rows]');
  const cards = root.querySelector<HTMLElement>('[data-demo-cards]');
  const next = root.querySelector<HTMLElement>('[data-demo-next]');
  const empty = root.querySelector<HTMLElement>('[data-demo-empty]');
  const status = root.querySelector<HTMLElement>('[data-demo-status]');
  const log = root.querySelector<HTMLOListElement>('[data-demo-log]');
  const logWrap = root.querySelector<HTMLElement>('[data-demo-log-wrap]');
  if (!form || !rows || !cards || !next || !empty || !status || !log || !logWrap) return;

  const locale = root.dataset.locale ?? 'en-US';
  const today = new Date();
  let docs = clone(demoDocuments);

  const readState = () => {
    const data = new FormData(form);
    return {
      view: (data.get('view') as RenewalView | null) ?? 'action',
      owner: String(data.get('owner') ?? ''),
      query: String(data.get('q') ?? '').trim(),
      sort: (data.get('sort') as SortKey | null) ?? 'urgency',
    };
  };

  const render = () => {
    const { view, owner, query, sort } = readState();
    const counts = countByView(docs);
    for (const [key, value] of Object.entries(counts)) {
      const badge = form.querySelector(`[data-count="${key}"]`);
      if (badge) badge.textContent = String(value);
    }
    const visible = sortDocuments(
      docs.filter(
        (doc) =>
          (view === 'all' || evaluate(doc).view === view) &&
          (owner === '' || doc.owner === owner) &&
          matchesAll(`${doc.vendor} ${doc.document} ${doc.trade} ${personById(doc.owner).name}`, query),
      ),
      sort,
      (id) => personById(id).name,
    );
    rows.innerHTML = renderTableRows(visible, personById, today, locale);
    cards.innerHTML = renderCards(visible, personById, today, locale);
    next.innerHTML = renderNextUp(docs, personById, today, locale);
    empty.classList.toggle('hidden', visible.length > 0);
    return { visible, view };
  };

  const announce = (message: string) => {
    status.textContent = message;
  };

  const addLog = (message: string) => {
    const item = document.createElement('li');
    item.textContent = message;
    log.prepend(item);
    while (log.children.length > 4) log.lastElementChild?.remove();
    logWrap.classList.remove('hidden');
  };

  form.addEventListener('submit', (event) => event.preventDefault());
  form.addEventListener('input', () => {
    const { visible, view } = render();
    announce(`${VIEW_NAMES[view]}: showing ${visible.length} of ${docs.length} documents`);
  });

  root.addEventListener('click', (event) => {
    const target = event.target as Element;

    const button = target.closest<HTMLButtonElement>('button[data-action]');
    if (button) {
      const id = button.dataset.id ?? '';
      const action = button.dataset.action as ActionKind;
      const doc = docs.find((item) => item.id === id);
      if (!doc) return;
      const container = cards.contains(button) ? cards : rows;
      const position = [...container.querySelectorAll('button[data-action]')].indexOf(button);
      docs = docs.map((item) => (item.id === id ? applyAction(item, action) : item));
      const updated = docs.find((item) => item.id === id);
      const message = `${ACTION_RESULTS[action]} — ${doc.vendor}, ${doc.document}.`;
      addLog(message);
      render();
      // Keep keyboard focus on the same row if it is still visible; otherwise
      // move to the action that took its place (or "Show everything").
      const again = container.querySelector<HTMLButtonElement>(`button[data-id="${CSS.escape(id)}"]`);
      const where = updated ? VIEW_NAMES[evaluate(updated).view] : '';
      if (again) {
        again.focus();
        announce(`${message} Demo only — nothing was sent.`);
      } else {
        announce(`${message} It moved to “${where}”. Demo only — nothing was sent.`);
        const remaining = [...container.querySelectorAll<HTMLButtonElement>('button[data-action]')];
        const clear = empty.classList.contains('hidden') ? null : empty.querySelector<HTMLButtonElement>('[data-demo-clear]');
        (remaining[Math.min(Math.max(position, 0), remaining.length - 1)] ?? clear ?? status).focus();
      }
      return;
    }

    if (target.closest('[data-demo-reset]')) {
      docs = clone(demoDocuments);
      form.reset();
      log.replaceChildren();
      logWrap.classList.add('hidden');
      render();
      announce('Demo reset to the original sample data.');
      return;
    }

    if (target.closest('[data-demo-clear]')) {
      form.reset();
      const all = form.querySelector<HTMLInputElement>('input[name="view"][value="all"]');
      if (all) all.checked = true;
      render();
      announce(`Showing all ${docs.length} documents.`);
    }
  });

  render();
}
