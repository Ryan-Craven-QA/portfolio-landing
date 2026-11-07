/**
 * Resolves the newsletter provider config into a plain HTML form target.
 * Submissions go straight from the visitor's browser to the provider — this
 * site never receives or stores email addresses. Pure module.
 */
import type { SiteConfig } from './schemas/site.ts';

export interface NewsletterTarget {
  providerName: string;
  action: string;
  emailField: string;
  hiddenFields: Record<string, string>;
}

export function newsletterTarget(site: SiteConfig): NewsletterTarget | null {
  const config = site.newsletter;
  switch (config.provider) {
    case 'buttondown':
      return {
        providerName: 'Buttondown',
        action: `https://buttondown.com/api/emails/embed-subscribe/${encodeURIComponent(config.username)}`,
        emailField: 'email',
        hiddenFields: { embed: '1' },
      };
    case 'kit':
      return {
        providerName: 'Kit',
        action: `https://app.kit.com/forms/${encodeURIComponent(config.formId)}/subscriptions`,
        emailField: 'email_address',
        hiddenFields: {},
      };
    case 'custom':
      return { providerName: config.name, action: config.action, emailField: config.emailField, hiddenFields: config.hiddenFields };
    case 'none':
      return null;
  }
}
