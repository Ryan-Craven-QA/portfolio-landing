/** Header scroll state and the mobile menu (a native modal <dialog>). */
export function initNav() {
  const header = document.querySelector<HTMLElement>('[data-site-header]');
  if (header) {
    let ticking = false;
    const update = () => {
      header.toggleAttribute('data-scrolled', window.scrollY > 8);
      ticking = false;
    };
    update();
    window.addEventListener(
      'scroll',
      () => {
        if (!ticking) {
          ticking = true;
          requestAnimationFrame(update);
        }
      },
      { passive: true },
    );
  }

  const menu = document.querySelector<HTMLDialogElement>('#mobile-menu');
  if (!menu) return;
  const openers = document.querySelectorAll<HTMLElement>('[data-menu-open]');

  const setExpanded = (open: boolean) => openers.forEach((el) => el.setAttribute('aria-expanded', String(open)));

  openers.forEach((opener) =>
    opener.addEventListener('click', () => {
      menu.showModal();
      setExpanded(true);
    }),
  );
  menu.addEventListener('close', () => setExpanded(false));
  menu.addEventListener('click', (event) => {
    const target = event.target as Element;
    // Backdrop click (the dialog element itself) or any close control / link.
    if (target === menu || target.closest('[data-menu-close]') || target.closest('a[href]')) menu.close();
  });
  matchMedia('(min-width: 64rem)').addEventListener('change', (event) => {
    if (event.matches && menu.open) menu.close();
  });
}
