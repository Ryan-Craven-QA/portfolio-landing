import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  displayOfferPrice,
  formatMoney,
  isInternalDownloadPath,
  pricingModelLabel,
  resolveOfferAction,
  summarizePricing,
  verifyCheckoutUrl,
  type ActionContext,
  type OfferInput,
} from '../../src/lib/commerce.ts';

const offer = (overrides: Partial<OfferInput> = {}): OfferInput => ({
  id: 'standard',
  label: 'Standard',
  price: 49,
  billing: 'one-time',
  recommended: false,
  features: [],
  ...overrides,
});

const ctx = (overrides: Partial<ActionContext> = {}): ActionContext => ({
  availability: 'available',
  productId: 'example',
  extraAllowedHosts: [],
  canContact: true,
  ...overrides,
});

const money = { currency: 'USD', locale: 'en-US' };

describe('verifyCheckoutUrl', () => {
  it('accepts https URLs on well-known checkout providers', () => {
    assert.equal(verifyCheckoutUrl('https://example.gumroad.com/l/abc')?.id, 'gumroad');
    assert.equal(verifyCheckoutUrl('https://gumroad.com/l/abc')?.id, 'gumroad');
    assert.equal(verifyCheckoutUrl('https://buy.stripe.com/test_123')?.id, 'stripe');
    assert.equal(verifyCheckoutUrl('https://shop.lemonsqueezy.com/checkout/buy/1')?.id, 'lemonsqueezy');
    assert.equal(verifyCheckoutUrl('https://pay.paddle.io/checkout/hsc_1')?.id, 'paddle');
    assert.equal(verifyCheckoutUrl('https://polar.sh/checkout/x')?.id, 'polar');
    assert.equal(verifyCheckoutUrl('https://payhip.com/b/ABC')?.id, 'payhip');
  });

  it('rejects plain http, unknown hosts, lookalikes, credentials and ports', () => {
    assert.equal(verifyCheckoutUrl('http://buy.stripe.com/test_123'), null);
    assert.equal(verifyCheckoutUrl('https://checkout.example.com/pay'), null);
    assert.equal(verifyCheckoutUrl('https://gumroad.com.evil.example/l/x'), null);
    assert.equal(verifyCheckoutUrl('https://evilgumroad.com/l/x'), null);
    assert.equal(verifyCheckoutUrl('https://user:pass@buy.stripe.com/x'), null);
    assert.equal(verifyCheckoutUrl('https://buy.stripe.com:8443/x'), null);
    assert.equal(verifyCheckoutUrl('javascript:alert(1)'), null);
    assert.equal(verifyCheckoutUrl('not a url'), null);
    assert.equal(verifyCheckoutUrl(undefined), null);
  });

  it('accepts hosts explicitly allowed in site config', () => {
    assert.equal(verifyCheckoutUrl('https://store.example.com/buy', ['store.example.com'])?.id, 'custom');
    assert.equal(verifyCheckoutUrl('https://other.example.com/buy', ['store.example.com']), null);
  });
});

describe('isInternalDownloadPath', () => {
  it('only allows files under /downloads/', () => {
    assert.equal(isInternalDownloadPath('/downloads/guide.pdf'), true);
    assert.equal(isInternalDownloadPath('/downloads/sub/guide.pdf'), true);
    assert.equal(isInternalDownloadPath('/downloads/../secret.txt'), false);
    assert.equal(isInternalDownloadPath('/other/guide.pdf'), false);
    assert.equal(isInternalDownloadPath('https://example.com/downloads/x.pdf'), false);
  });
});

describe('resolveOfferAction', () => {
  it('never offers checkout for coming-soon or unavailable products', () => {
    const verified = offer({ checkoutUrl: 'https://buy.stripe.com/x' });
    assert.equal(resolveOfferAction(verified, ctx({ availability: 'coming-soon' })).kind, 'unavailable');
    assert.equal(resolveOfferAction(verified, ctx({ availability: 'unavailable' })).kind, 'unavailable');
  });

  it('degrades to an unavailable state when the checkout URL is missing or unverified', () => {
    const missing = resolveOfferAction(offer(), ctx());
    assert.equal(missing.kind, 'unavailable');
    assert.equal(missing.kind === 'unavailable' && missing.reason, 'no-checkout');
    assert.equal(resolveOfferAction(offer({ checkoutUrl: 'https://random-shop.example/pay' }), ctx()).kind, 'unavailable');
  });

  it('returns a purchase action with a billing-appropriate label for verified checkouts', () => {
    const oneTime = resolveOfferAction(offer({ checkoutUrl: 'https://x.gumroad.com/l/a' }), ctx());
    assert.deepEqual(oneTime.kind === 'purchase' && [oneTime.label, oneTime.provider.label], ['Buy now', 'Gumroad']);
    const monthly = resolveOfferAction(offer({ billing: 'monthly', checkoutUrl: 'https://buy.stripe.com/a' }), ctx());
    assert.equal(monthly.kind === 'purchase' && monthly.label, 'Subscribe');
    const yearlyLicense = resolveOfferAction(offer({ billing: 'yearly', license: 'agency', checkoutUrl: 'https://buy.stripe.com/a' }), ctx());
    assert.equal(yearlyLicense.kind === 'purchase' && yearlyLicense.label, 'Buy annual license');
    const custom = resolveOfferAction(offer({ ctaLabel: 'Get it', checkoutUrl: 'https://buy.stripe.com/a' }), ctx());
    assert.equal(custom.kind === 'purchase' && custom.label, 'Get it');
  });

  it('allows early-access purchases when checkout is verified', () => {
    assert.equal(resolveOfferAction(offer({ checkoutUrl: 'https://buy.stripe.com/a' }), ctx({ availability: 'early-access' })).kind, 'purchase');
  });

  it('handles free offers: internal files, verified external delivery, or nothing', () => {
    const internal = resolveOfferAction(offer({ price: 0, downloadUrl: '/downloads/a.pdf' }), ctx());
    assert.deepEqual(internal.kind === 'download' && [internal.href, internal.external], ['/downloads/a.pdf', false]);
    const external = resolveOfferAction(offer({ price: 0, checkoutUrl: 'https://x.gumroad.com/l/free' }), ctx());
    assert.equal(external.kind === 'download' && external.external, true);
    assert.equal(resolveOfferAction(offer({ price: 0 }), ctx()).kind, 'unavailable');
    assert.equal(resolveOfferAction(offer({ price: 0, downloadUrl: 'https://files.example.com/a.pdf' }), ctx()).kind, 'unavailable');
  });

  it('turns custom pricing into a contact action only when a contact channel exists', () => {
    const contact = resolveOfferAction(offer({ price: null }), ctx());
    assert.equal(contact.kind, 'contact');
    assert.match(contact.kind === 'contact' ? contact.href : '', /topic=business&product=example/);
    assert.equal(resolveOfferAction(offer({ price: null }), ctx({ canContact: false })).kind, 'unavailable');
  });
});

describe('pricing display', () => {
  it('formats whole and fractional amounts', () => {
    assert.equal(formatMoney(49, 'USD', 'en-US'), '$49');
    assert.equal(formatMoney(9.5, 'USD', 'en-US'), '$9.50');
    assert.equal(formatMoney(20, 'EUR', 'en-US'), '€20');
  });

  it('describes offer prices with billing suffixes and spoken text', () => {
    assert.deepEqual(displayOfferPrice(offer({ price: 9, billing: 'monthly' }), money), { amount: '$9', suffix: '/ month', spoken: '$9 per month' });
    assert.equal(displayOfferPrice(offer({ price: 0 }), money).amount, 'Free');
    assert.equal(displayOfferPrice(offer({ price: null }), money).spoken, 'Custom pricing');
  });

  it('summarizes offers for cards', () => {
    assert.equal(summarizePricing([], money), null);
    assert.equal(summarizePricing([offer({ price: 0 })], money), 'Free');
    assert.equal(summarizePricing([offer({ price: 49 })], money), '$49');
    assert.equal(summarizePricing([offer({ price: 49 }), offer({ price: 29 })], money), 'From $29');
    assert.equal(summarizePricing([offer({ price: 9, billing: 'monthly' })], money), '$9 / month');
    assert.equal(summarizePricing([offer({ price: null })], money), 'Custom pricing');
    assert.equal(summarizePricing([offer({ price: 0 }), offer({ price: 19 })], money), 'Free + paid options');
  });

  it('labels the pricing model', () => {
    assert.equal(pricingModelLabel([], false), null);
    assert.equal(pricingModelLabel([offer()], true), 'Bundle');
    assert.equal(pricingModelLabel([offer({ price: 0 })], false), 'Free');
    assert.equal(pricingModelLabel([offer()], false), 'One-time purchase');
    assert.equal(pricingModelLabel([offer({ license: 'personal' })], false), 'One-time license');
    assert.equal(pricingModelLabel([offer({ billing: 'monthly' })], false), 'Subscription');
    assert.equal(pricingModelLabel([offer({ billing: 'yearly', license: 'agency' })], false), 'Annual license');
    assert.equal(pricingModelLabel([offer(), offer({ billing: 'monthly' })], false), 'One-time or subscription');
  });
});
