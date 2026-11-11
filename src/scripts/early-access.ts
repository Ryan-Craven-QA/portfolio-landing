/**
 * Early-access form: links marked data-intent-link="interview" (pricing
 * cards, hero) preselect the matching option; the subject line and button
 * label follow the choice; submission happens in place (async-form.ts).
 */
import { sendFormInPlace } from './async-form.ts';

const BUTTON_LABELS: Record<string, string> = {
  'early-access': 'Request early access',
  interview: 'Request an interview',
  both: 'Send my request',
};

export function initEarlyAccessForm(form: HTMLFormElement) {
  const root = form.closest<HTMLElement>('[data-early-access-root]');
  const subject = form.querySelector<HTMLInputElement>('[data-subject]');
  const label = form.querySelector<HTMLElement>('[data-submit-label]');
  const siteName = form.dataset.siteName ?? '';

  const sync = () => {
    const checked = form.querySelector<HTMLInputElement>('input[name="interest"]:checked');
    const value = checked?.value ?? 'early-access';
    if (subject) subject.value = `${checked?.dataset.intentLabel ?? 'Early access'} — ${siteName}`;
    if (label) label.textContent = BUTTON_LABELS[value] ?? BUTTON_LABELS['early-access'] ?? 'Send';
  };

  const choose = (value: string | null) => {
    if (!value) return;
    const radio = [...form.querySelectorAll<HTMLInputElement>('input[name="interest"]')].find((input) => input.value === value);
    if (radio) {
      radio.checked = true;
      sync();
    }
  };

  // Intent from the URL (?interest=interview#register) or from in-page links.
  choose(new URL(window.location.href).searchParams.get('interest'));
  document.addEventListener('click', (event) => {
    const link = (event.target as Element | null)?.closest<HTMLElement>('[data-intent-link]');
    if (link) choose(link.dataset.intentLink ?? null);
  });

  form.addEventListener('change', sync);
  sync();

  sendFormInPlace(form, {
    success: root?.querySelector<HTMLElement>('[data-form-success]') ?? null,
    status: form.querySelector<HTMLElement>('[data-form-status]'),
    submit: form.querySelector<HTMLButtonElement>('[data-submit]'),
    fallbackEmail: form.dataset.fallbackEmail,
  });
}
