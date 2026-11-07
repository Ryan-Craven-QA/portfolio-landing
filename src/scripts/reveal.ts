/**
 * Scroll reveal. Elements with `.reveal` fade up once when they enter the
 * viewport. CSS only hides them while `html.reveal-ready` is set, and shows
 * them anyway after 2.5s unless this script marks itself active.
 */
export function initReveal() {
  const root = document.documentElement;
  const elements = document.querySelectorAll<HTMLElement>('.reveal:not(.is-visible)');
  if (!('IntersectionObserver' in window)) {
    elements.forEach((el) => el.classList.add('is-visible'));
    return;
  }
  const observer = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      }
    },
    { rootMargin: '0px 0px -6% 0px', threshold: 0.06 },
  );
  elements.forEach((el) => observer.observe(el));
  root.classList.add('reveal-on');
}
