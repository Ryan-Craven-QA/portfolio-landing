/** Site-wide behaviour, loaded once per page as a bundled module. */
import { initNav } from './nav.ts';
import { initReveal } from './reveal.ts';
import { initSearchDialog } from './search-dialog.ts';
import { initSpotlight } from './spotlight.ts';
import { initTheme } from './theme.ts';

initTheme();
initNav();
initReveal();
initSpotlight();
initSearchDialog();

// Keyboard hints: show "Ctrl" instead of "⌘" outside Apple platforms.
const platform = (navigator as Navigator & { userAgentData?: { platform?: string } }).userAgentData?.platform ?? navigator.platform ?? navigator.userAgent;
if (!/mac|iphone|ipad|ipod/i.test(platform)) {
  document.querySelectorAll('[data-mod-key]').forEach((el) => {
    el.textContent = 'Ctrl';
  });
}
