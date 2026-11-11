/**
 * Shared in-place submission for provider-backed forms (Formspree, Web3Forms).
 * Both accept a fetch POST with `Accept: application/json` and answer with
 * JSON. Without JavaScript the form still posts normally and the provider shows
 * its own confirmation page.
 */
export interface AsyncFormParts {
  /** Shown (and focused) after success; the form is hidden. */
  success: HTMLElement | null;
  /** Receives "Sending…" and error messages (role="status"). */
  status: HTMLElement | null;
  submit: HTMLButtonElement | null;
  /** Offered in the error message, if configured. */
  fallbackEmail?: string | undefined;
}

export function sendFormInPlace(form: HTMLFormElement, parts: AsyncFormParts) {
  const { success, status, submit, fallbackEmail } = parts;
  form.addEventListener('submit', async (event) => {
    if (!form.checkValidity()) return;
    event.preventDefault();
    if (submit) submit.disabled = true;
    if (status) {
      status.className = 'text-sm text-ink-2';
      status.textContent = 'Sending…';
    }
    try {
      const response = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' },
      });
      const body = (await response.json().catch(() => ({}))) as {
        ok?: boolean;
        success?: boolean;
        message?: string;
        errors?: Array<{ message?: string }>;
      };
      if (!response.ok || body.ok === false || body.success === false) {
        throw new Error(body.errors?.map((e) => e.message).join(' ') || body.message || `Request failed (${response.status})`);
      }
      form.reset();
      form.classList.add('hidden');
      if (status) status.textContent = '';
      if (success) {
        success.classList.remove('hidden');
        success.classList.add('flex');
        success.querySelector<HTMLElement>('[data-success-heading]')?.focus();
      }
    } catch {
      if (status) {
        status.className = 'text-sm text-danger';
        status.textContent = `Your message could not be sent. Please try again${fallbackEmail ? `, or email ${fallbackEmail}` : ''}.`;
      }
    } finally {
      if (submit) submit.disabled = false;
    }
  });
}
