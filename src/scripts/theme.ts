/**
 * Theme toggle. The initial theme is applied before first paint by the inline
 * script in Head.astro (dark by default); this module handles switching.
 */
type Theme = 'dark' | 'light';

const STORAGE_KEY = 'theme';
const THEME_COLOR: Record<Theme, string> = { dark: '#0d0c0b', light: '#faf9f6' };

const current = (): Theme => (document.documentElement.dataset.theme === 'light' ? 'light' : 'dark');

function syncControls(theme: Theme) {
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[theme]);
  for (const button of document.querySelectorAll<HTMLElement>('[data-theme-toggle]')) {
    button.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  }
}

function apply(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Storage can be unavailable (private mode); the choice then lasts for this page only.
  }
  syncControls(theme);
}

export function initTheme() {
  syncControls(current());
  document.addEventListener('click', (event) => {
    const button = (event.target as Element | null)?.closest('[data-theme-toggle]');
    if (!button) return;
    const next: Theme = current() === 'dark' ? 'light' : 'dark';
    const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if ('startViewTransition' in document && !reduceMotion) {
      document.startViewTransition(() => apply(next));
    } else {
      apply(next);
    }
  });
}
