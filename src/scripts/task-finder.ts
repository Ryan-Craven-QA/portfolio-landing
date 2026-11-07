/**
 * Homepage task finder behaviour:
 * - typing filters the task list; Enter opens the first match
 * - hovering/focusing a task previews its solution
 * - an idle "ghost typing" demo shows what to type. It only highlights rows
 *   (never hides them), runs only while visible, never under reduced motion,
 *   and stops for good as soon as the visitor interacts.
 */
import { matchesAll } from '../lib/search.ts';

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function initTaskFinder(root: HTMLElement) {
  const form = root.querySelector<HTMLFormElement>('[data-task-form]');
  const input = root.querySelector<HTMLInputElement>('[data-task-input]');
  const ghost = root.querySelector<HTMLElement>('[data-ghost]');
  const ghostText = root.querySelector<HTMLElement>('[data-ghost-text]');
  const empty = root.querySelector<HTMLElement>('[data-task-empty]');
  const status = root.querySelector<HTMLElement>('[data-task-status]');
  const items = [...root.querySelectorAll<HTMLElement>('[data-task]')];
  const previews = [...root.querySelectorAll<HTMLElement>('[data-preview]')];
  if (!form || !input || !ghost || !ghostText || !empty || !status) return;

  const showPreview = (solutionId: string | undefined) => {
    if (!solutionId) return;
    for (const preview of previews) preview.hidden = preview.dataset.preview !== solutionId;
  };

  const visibleItems = () => items.filter((item) => !item.hidden);

  const filter = () => {
    const query = input.value.trim();
    let shown = 0;
    for (const item of items) {
      const match = matchesAll(item.dataset.search ?? '', query);
      item.hidden = !match;
      if (match) shown++;
    }
    empty.classList.toggle('hidden', shown > 0);
    status.textContent = query ? `${shown} matching task${shown === 1 ? '' : 's'}` : '';
    showPreview(visibleItems()[0]?.dataset.solution);
  };

  // ── Demo ──────────────────────────────────────────────────────────────
  const demoQueries: string[] = (() => {
    try {
      return JSON.parse(root.dataset.demo ?? '[]') as string[];
    } catch {
      return [];
    }
  })();
  let demoStopped = matchMedia('(prefers-reduced-motion: reduce)').matches || demoQueries.length === 0;
  let inView = false;
  let running = false;

  const clearDemo = () => {
    root.removeAttribute('data-demo-active');
    ghost.classList.add('hidden');
    ghost.classList.remove('flex');
    ghostText.textContent = '';
    items.forEach((item) => item.removeAttribute('data-match'));
  };

  const stopDemo = () => {
    demoStopped = true;
    clearDemo();
  };

  const highlight = (query: string) => {
    let first: HTMLElement | undefined;
    for (const item of items) {
      const match = query.length > 1 && matchesAll(item.dataset.search ?? '', query);
      item.toggleAttribute('data-match', match);
      if (match && !first) first = item;
    }
    if (first) {
      showPreview(first.dataset.solution);
      const list = first.parentElement;
      if (list) list.scrollTo({ top: Math.max(0, first.offsetTop - list.offsetTop - 8), behavior: 'smooth' });
    }
  };

  const runDemo = async () => {
    if (running) return;
    running = true;
    await sleep(1400);
    let index = 0;
    while (!demoStopped && inView && document.visibilityState === 'visible') {
      const query = demoQueries[index % demoQueries.length] ?? '';
      root.setAttribute('data-demo-active', '');
      ghost.classList.remove('hidden');
      ghost.classList.add('flex');
      for (let i = 1; i <= query.length && !demoStopped; i++) {
        ghostText.textContent = query.slice(0, i);
        highlight(query.slice(0, i));
        await sleep(85);
      }
      await sleep(2000);
      for (let i = query.length; i >= 0 && !demoStopped; i--) {
        ghostText.textContent = query.slice(0, i);
        await sleep(30);
      }
      items.forEach((item) => item.removeAttribute('data-match'));
      await sleep(600);
      index++;
    }
    if (!demoStopped) clearDemo();
    running = false;
  };

  if (!demoStopped && 'IntersectionObserver' in window) {
    new IntersectionObserver(
      ([entry]) => {
        inView = Boolean(entry?.isIntersecting);
        if (inView && !demoStopped) void runDemo();
      },
      { threshold: 0.5 },
    ).observe(root);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible' && inView && !demoStopped) void runDemo();
    });
  }

  // ── Interaction ───────────────────────────────────────────────────────
  root.addEventListener('pointerenter', stopDemo, { once: true });
  root.addEventListener('focusin', stopDemo, { once: true });
  input.addEventListener('input', filter);

  root.addEventListener('pointerover', (event) => {
    const item = (event.target as Element).closest<HTMLElement>('[data-task]');
    if (item) showPreview(item.dataset.solution);
  });
  root.addEventListener('focusin', (event) => {
    const item = (event.target as Element).closest<HTMLElement>('[data-task]');
    if (item) showPreview(item.dataset.solution);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const href = visibleItems()[0]?.querySelector('a')?.href;
    if (href) window.location.assign(href);
  });

  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      const first = visibleItems()[0]?.querySelector('a');
      if (first) {
        event.preventDefault();
        first.focus();
      }
    }
  });
  root.querySelector('[data-task-list]')?.addEventListener('keydown', (event) => {
    const e = event as KeyboardEvent;
    if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
    const links = visibleItems()
      .map((item) => item.querySelector('a'))
      .filter((a): a is HTMLAnchorElement => a !== null);
    const index = links.indexOf(document.activeElement as HTMLAnchorElement);
    if (index === -1) return;
    e.preventDefault();
    if (e.key === 'ArrowUp' && index === 0) input.focus();
    else links[Math.min(links.length - 1, Math.max(0, index + (e.key === 'ArrowDown' ? 1 : -1)))]?.focus();
  });
}
