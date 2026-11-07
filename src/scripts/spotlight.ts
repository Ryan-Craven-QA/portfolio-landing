/** Pointer-following glow for `.spotlight` cards (fine pointers only). */
export function initSpotlight() {
  if (!matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  let frame = 0;
  let target: HTMLElement | null = null;
  let x = 0;
  let y = 0;
  document.addEventListener(
    'pointermove',
    (event) => {
      const el = (event.target as Element | null)?.closest?.<HTMLElement>('.spotlight') ?? null;
      if (!el) return;
      target = el;
      x = event.clientX;
      y = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (!target) return;
        const rect = target.getBoundingClientRect();
        target.style.setProperty('--mx', `${x - rect.left}px`);
        target.style.setProperty('--my', `${y - rect.top}px`);
      });
    },
    { passive: true },
  );
}
