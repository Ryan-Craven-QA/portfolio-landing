/**
 * Contact form enhancement: prefills topic/product from the URL and sends the
 * message in place (see async-form.ts). Without JavaScript the form still
 * posts normally.
 */
import { sendFormInPlace } from './async-form.ts';

export function initContactForm(form: HTMLFormElement) {
  const root = form.closest<HTMLElement>('[data-contact-root]');
  const status = form.querySelector<HTMLElement>('[data-form-status]');
  const submit = form.querySelector<HTMLButtonElement>('[data-submit]');
  const subject = form.querySelector<HTMLInputElement>('[data-subject]');
  const success = root?.querySelector<HTMLElement>('[data-form-success]');
  const siteName = form.dataset.siteName ?? '';
  const fallbackEmail = form.dataset.fallbackEmail;

  const setTopic = (value: string | null) => {
    if (!value) return;
    const radio = [...form.querySelectorAll<HTMLInputElement>('input[name="topic"]')].find((input) => input.value === value);
    if (radio) radio.checked = true;
  };

  const updateSubject = () => {
    const checked = form.querySelector<HTMLInputElement>('input[name="topic"]:checked');
    if (subject && checked) subject.value = `${checked.dataset.topicLabel ?? 'Message'} — ${siteName}`;
  };

  // Prefill from ?topic=…&product=…
  const params = new URL(window.location.href).searchParams;
  setTopic(params.get('topic'));
  const product = params.get('product');
  const select = form.querySelector<HTMLSelectElement>('select[name="product"]');
  if (product && select && [...select.options].some((option) => option.value === product)) select.value = product;
  updateSubject();
  form.addEventListener('change', updateSubject);

  // Channel links on the same page set the topic without a reload.
  document.querySelectorAll<HTMLAnchorElement>('a[data-topic-link]').forEach((link) =>
    link.addEventListener('click', (event) => {
      event.preventDefault();
      setTopic(link.dataset.topicLink ?? null);
      updateSubject();
      form.scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
      form.querySelector<HTMLInputElement>('#contact-name')?.focus({ preventScroll: true });
      const url = new URL(window.location.href);
      url.searchParams.set('topic', link.dataset.topicLink ?? 'general');
      window.history.replaceState(window.history.state, '', url);
    }),
  );

  sendFormInPlace(form, { success: success ?? null, status, submit, fallbackEmail });
}
