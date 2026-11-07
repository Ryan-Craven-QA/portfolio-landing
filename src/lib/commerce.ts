/**
 * Commerce rules: checkout-link verification, price formatting and the
 * decision of what a product's call-to-action is allowed to say.
 *
 * Pure module (no Astro imports) — shared with /scripts and unit tests.
 *
 * Core rule: a "Buy" / "Subscribe" button is rendered ONLY when the product is
 * purchasable AND the offer has a checkout URL on a verified https host.
 * Anything else degrades to an honest, non-purchase state.
 */

export type Billing = 'one-time' | 'monthly' | 'yearly';
export type Availability = 'available' | 'early-access' | 'coming-soon' | 'unavailable';
export type License = 'personal' | 'commercial' | 'team' | 'organization' | 'agency';

export interface OfferInput {
  id: string;
  label: string;
  /** Major currency units (49 = $49). `null` means "contact us for pricing". */
  price: number | null;
  currency?: string | undefined;
  billing: Billing;
  license?: License | undefined;
  /** e.g. "Up to 5 sites" or "Unlimited employees". */
  scope?: string | undefined;
  checkoutUrl?: string | undefined;
  /** Free offers: a file in /public/downloads (e.g. "/downloads/x.pdf") or a verified external URL. */
  downloadUrl?: string | undefined;
  ctaLabel?: string | undefined;
  recommended: boolean;
  features: string[];
  note?: string | undefined;
}

export interface CheckoutProvider {
  id: string;
  /** Shown to visitors, e.g. "Secure checkout on Gumroad". */
  label: string;
}

interface ProviderRule extends CheckoutProvider {
  matches(host: string): boolean;
}

const endsWithDomain = (host: string, domain: string) => host === domain || host.endsWith(`.${domain}`);

/**
 * Hosted checkout providers that are trusted out of the box. Only https URLs
 * on these hosts (or hosts added in site config `checkout.extraAllowedHosts`)
 * can become a purchase button.
 */
export const CHECKOUT_PROVIDERS: readonly ProviderRule[] = [
  { id: 'gumroad', label: 'Gumroad', matches: (h) => endsWithDomain(h, 'gumroad.com') },
  {
    id: 'stripe',
    label: 'Stripe',
    matches: (h) => h === 'buy.stripe.com' || h === 'checkout.stripe.com' || h === 'billing.stripe.com',
  },
  { id: 'lemonsqueezy', label: 'Lemon Squeezy', matches: (h) => h.endsWith('.lemonsqueezy.com') },
  { id: 'paddle', label: 'Paddle', matches: (h) => h === 'buy.paddle.com' || h === 'pay.paddle.io' },
  { id: 'polar', label: 'Polar', matches: (h) => h === 'polar.sh' || h === 'buy.polar.sh' },
  { id: 'payhip', label: 'Payhip', matches: (h) => h === 'payhip.com' },
];

/** Returns the provider for a verified https checkout URL, or null. */
export function verifyCheckoutUrl(url: string | undefined, extraAllowedHosts: readonly string[] = []): CheckoutProvider | null {
  if (!url) return null;
  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }
  if (parsed.protocol !== 'https:' || parsed.username || parsed.password || parsed.port) return null;
  const host = parsed.hostname.toLowerCase();
  const known = CHECKOUT_PROVIDERS.find((provider) => provider.matches(host));
  if (known) return { id: known.id, label: known.label };
  if (extraAllowedHosts.some((allowed) => host === allowed.toLowerCase())) return { id: 'custom', label: host };
  return null;
}

/** Internal download paths must point into /public/downloads. */
export function isInternalDownloadPath(path: string): boolean {
  return /^\/downloads\/[A-Za-z0-9._\-/]+$/.test(path) && !path.includes('..');
}

export function formatMoney(amount: number, currency: string, locale: string): string {
  const whole = Number.isInteger(amount);
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: whole ? 0 : 2,
    maximumFractionDigits: whole ? 0 : 2,
  }).format(amount);
}

export interface PriceDisplay {
  /** "$49", "Free" or "Custom". */
  amount: string;
  /** "one-time", "/ month", "/ year" or "pricing". */
  suffix: string;
  /** Screen-reader friendly full sentence, e.g. "$9 per month". */
  spoken: string;
}

export function displayOfferPrice(offer: OfferInput, defaults: { currency: string; locale: string }): PriceDisplay {
  if (offer.price === null) return { amount: 'Custom', suffix: 'pricing', spoken: 'Custom pricing' };
  if (offer.price === 0) return { amount: 'Free', suffix: '', spoken: 'Free' };
  const amount = formatMoney(offer.price, offer.currency ?? defaults.currency, defaults.locale);
  switch (offer.billing) {
    case 'monthly':
      return { amount, suffix: '/ month', spoken: `${amount} per month` };
    case 'yearly':
      return { amount, suffix: '/ year', spoken: `${amount} per year` };
    default:
      return { amount, suffix: 'one-time', spoken: `${amount}, one-time payment` };
  }
}

/** Compact price summary for cards: "Free", "$49", "From $29", "$9 / month", "Custom pricing". */
export function summarizePricing(offers: readonly OfferInput[], defaults: { currency: string; locale: string }): string | null {
  if (offers.length === 0) return null;
  const priced = offers.filter((o): o is OfferInput & { price: number } => o.price !== null);
  if (priced.length === 0) return 'Custom pricing';
  if (priced.every((o) => o.price === 0)) return 'Free';
  const paid = priced.filter((o) => o.price > 0);
  const cheapest = paid.reduce((min, o) => (o.price < min.price ? o : min));
  const display = displayOfferPrice(cheapest, defaults);
  const recurring = cheapest.billing !== 'one-time' ? ` ${display.suffix}` : '';
  const hasFree = priced.some((o) => o.price === 0);
  if (hasFree) return 'Free + paid options';
  return paid.length > 1 ? `From ${display.amount}${recurring}` : `${display.amount}${recurring}`;
}

export function pricingModelLabel(offers: readonly OfferInput[], isBundle: boolean): string | null {
  if (offers.length === 0) return null;
  if (isBundle) return 'Bundle';
  if (offers.every((o) => o.price === 0)) return 'Free';
  if (offers.every((o) => o.price === null)) return 'Custom pricing';
  const paid = offers.filter((o) => o.price !== null && o.price > 0);
  const recurring = paid.filter((o) => o.billing !== 'one-time');
  const oneTime = paid.filter((o) => o.billing === 'one-time');
  if (recurring.length > 0 && oneTime.length > 0) return 'One-time or subscription';
  if (recurring.length > 0) {
    const allYearlyLicenses = recurring.every((o) => o.billing === 'yearly' && o.license !== undefined);
    return allYearlyLicenses ? 'Annual license' : 'Subscription';
  }
  return oneTime.some((o) => o.license !== undefined) ? 'One-time license' : 'One-time purchase';
}

export type CheckoutAction =
  | { kind: 'purchase'; href: string; label: string; provider: CheckoutProvider }
  | { kind: 'download'; href: string; label: string; external: boolean; provider: CheckoutProvider | null }
  | { kind: 'contact'; href: string; label: string }
  | { kind: 'unavailable'; label: string; reason: string };

export interface ActionContext {
  availability: Availability;
  productId: string;
  extraAllowedHosts: readonly string[];
  /** Whether a contact channel exists (form or email). Without one, "contact" degrades to unavailable. */
  canContact: boolean;
}

/**
 * Decide the call-to-action for one offer. Never returns a purchase action
 * unless the checkout destination is verified.
 */
export function resolveOfferAction(offer: OfferInput, ctx: ActionContext): CheckoutAction {
  if (ctx.availability === 'coming-soon') return { kind: 'unavailable', label: 'Coming soon', reason: 'not-released' };
  if (ctx.availability === 'unavailable') return { kind: 'unavailable', label: 'Currently unavailable', reason: 'unavailable' };

  const contactHref = `/contact/?topic=business&product=${encodeURIComponent(ctx.productId)}`;

  if (offer.price === null) {
    return ctx.canContact
      ? { kind: 'contact', href: contactHref, label: offer.ctaLabel ?? 'Contact us for pricing' }
      : { kind: 'unavailable', label: 'Pricing on request', reason: 'no-contact-channel' };
  }

  if (offer.price === 0) {
    if (offer.downloadUrl && isInternalDownloadPath(offer.downloadUrl)) {
      return { kind: 'download', href: offer.downloadUrl, label: offer.ctaLabel ?? 'Download free', external: false, provider: null };
    }
    const provider = verifyCheckoutUrl(offer.downloadUrl ?? offer.checkoutUrl, ctx.extraAllowedHosts);
    const href = offer.downloadUrl ?? offer.checkoutUrl;
    if (provider && href) return { kind: 'download', href, label: offer.ctaLabel ?? 'Get it free', external: true, provider };
    return { kind: 'unavailable', label: 'Download not yet available', reason: 'no-download' };
  }

  const provider = verifyCheckoutUrl(offer.checkoutUrl, ctx.extraAllowedHosts);
  if (!provider || !offer.checkoutUrl) {
    return { kind: 'unavailable', label: 'Checkout not yet available', reason: 'no-checkout' };
  }
  return { kind: 'purchase', href: offer.checkoutUrl, label: offer.ctaLabel ?? defaultPurchaseLabel(offer), provider };
}

function defaultPurchaseLabel(offer: OfferInput): string {
  switch (offer.billing) {
    case 'monthly':
      return 'Subscribe';
    case 'yearly':
      return offer.license ? 'Buy annual license' : 'Subscribe yearly';
    default:
      return offer.license ? 'Buy license' : 'Buy now';
  }
}

export const LICENSE_LABELS: Record<License, string> = {
  personal: 'Personal license',
  commercial: 'Commercial license',
  team: 'Team license',
  organization: 'Organization license',
  agency: 'Agency license',
};
