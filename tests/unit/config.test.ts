import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import siteInput from '../../src/config/site.ts';
import { thirdPartyHosts } from '../../src/lib/csp.ts';
import { newsletterTarget } from '../../src/lib/newsletter.ts';
import { businessSchema, offerSchema, productSchema } from '../../src/lib/schemas/content.ts';
import { isPlaceholderUrl, parseSiteConfig, type SiteConfigInput } from '../../src/lib/schemas/site.ts';
import { z } from 'astro/zod';
import fixtureInput from '../fixtures/site.config.ts';

const base = parseSiteConfig(siteInput);
const withOverrides = (overrides: Partial<SiteConfigInput>) => parseSiteConfig({ ...siteInput, ...overrides });

describe('site configuration', () => {
  it('the shipped config and the fixture config are valid', () => {
    assert.equal(base.name.length > 0, true);
    assert.equal(parseSiteConfig(fixtureInput).contact.form.provider, 'formspree');
  });

  it('ships with nothing third-party enabled', () => {
    assert.equal(base.contact.form.provider, 'none');
    assert.equal(base.newsletter.provider, 'none');
    assert.equal(base.analytics.provider, 'none');
    assert.deepEqual(thirdPartyHosts(base), { script: [], connect: [], form: [] });
  });

  it('rejects invalid values with a readable message', () => {
    assert.throws(() => withOverrides({ contact: { general: 'not-an-email' } }), /contact\.general/);
    assert.throws(() => withOverrides({ social: [{ label: 'X', url: 'http://insecure.example.com' }] }), /social/);
    assert.throws(() => withOverrides({ newsletter: { provider: 'kit', formId: 'abc' } }), /newsletter/);
  });

  it('detects placeholder URLs', () => {
    assert.equal(isPlaceholderUrl('https://www.example.com'), true);
    assert.equal(isPlaceholderUrl('https://example.org'), true);
    assert.equal(isPlaceholderUrl('https://plainwork.studio'), false);
  });
});

describe('content security policy hosts', () => {
  it('adds exactly the hosts of configured integrations', () => {
    const configured = withOverrides({
      contact: { form: { provider: 'formspree', formId: 'abcd1234' } },
      newsletter: { provider: 'buttondown', username: 'studio' },
      analytics: { provider: 'cloudflare' },
    });
    const hosts = thirdPartyHosts(configured);
    assert.deepEqual(hosts.form.sort(), ['https://buttondown.com', 'https://formspree.io']);
    assert.deepEqual(hosts.connect.sort(), ['https://cloudflareinsights.com', 'https://formspree.io']);
    assert.deepEqual(hosts.script, ['https://static.cloudflareinsights.com']);
  });

  it('resolves newsletter form targets', () => {
    assert.equal(newsletterTarget(base), null);
    const kit = newsletterTarget(withOverrides({ newsletter: { provider: 'kit', formId: '42' } }));
    assert.deepEqual([kit?.action, kit?.emailField], ['https://app.kit.com/forms/42/subscriptions', 'email_address']);
  });
});

describe('content schemas', () => {
  const product = productSchema(() => z.string());
  const minimal = { name: 'Thing', business: 'line', type: 'template', summary: 'A sufficiently long summary for the schema.' };

  it('defaults products to draft and coming soon (safe by default)', () => {
    const parsed = product.parse(minimal);
    assert.equal(parsed.visibility, 'draft');
    assert.equal(parsed.availability, 'coming-soon');
    assert.deepEqual(parsed.offers, []);
  });

  it('defaults product lines to hidden', () => {
    const line = businessSchema.parse({ id: 'x', name: 'X', tagline: 'T', description: 'D', hue: 10, glyph: 'grid', art: 'file-stack', examples: ['e'] });
    assert.equal(line.visible, false);
  });

  it('rejects insecure or malformed checkout and download URLs', () => {
    assert.equal(offerSchema.safeParse({ id: 'a', label: 'A', price: 9, checkoutUrl: 'http://buy.stripe.com/x' }).success, false);
    assert.equal(offerSchema.safeParse({ id: 'a', label: 'A', price: 0, downloadUrl: '/elsewhere/x.pdf' }).success, false);
    assert.equal(offerSchema.safeParse({ id: 'a', label: 'A', price: 0, downloadUrl: '/downloads/x.pdf' }).success, true);
    assert.equal(product.safeParse({ ...minimal, unknownField: true }).success, false);
  });
});
