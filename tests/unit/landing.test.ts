import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { loadContent } from '../../scripts/lib/content.ts';
import { about, contactPage, principles, supportPage } from '../../src/config/copy.ts';
import { landing } from '../../src/config/landing.ts';
import { getNavigation, isActive, landingAnchors } from '../../src/config/navigation.ts';
import siteInput from '../../src/config/site.ts';
import { brandify } from '../../src/lib/brand.ts';
import { findClaimViolations } from '../../src/lib/claims.ts';
import { parseSiteConfig } from '../../src/lib/schemas/site.ts';

const site = parseSiteConfig(siteInput);

/** Every string inside a (nested) config object. */
function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (Array.isArray(value)) return value.flatMap(strings);
  if (value && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('brand', () => {
  it('replaces every {brand} token', () => {
    assert.equal(brandify('Help shape {brand}. {brand} is new.', 'Acme'), 'Help shape Acme. Acme is new.');
  });

  it('ships as a working name in single-product mode, with the scope disclaimer', () => {
    assert.equal(site.name, 'RenewalTrail');
    assert.equal(site.nameCleared, false, 'only set nameCleared once trademark and domain clearance is done');
    assert.equal(site.homepage, 'product');
    assert.match(site.disclaimer ?? '', /does not verify insurance coverage, determine legal compliance, or certify vendor eligibility/);
  });

  it('copy for the landing page never hard-codes the brand name', () => {
    for (const text of strings(landing)) assert.doesNotMatch(text, /RenewalTrail/, `use {brand} instead: "${text}"`);
  });
});

describe('public copy passes the claims guard', () => {
  const check = (label: string, texts: string[]) => {
    for (const text of texts) {
      const violations = findClaimViolations(brandify(text, site.name), { forSale: false });
      assert.deepEqual(violations, [], `${label}: ${JSON.stringify(violations)}`);
    }
  };

  it('landing page, About, Contact and Help copy', () => {
    check('landing.ts', strings(landing));
    check('copy.ts principles', strings(principles));
    check('copy.ts about', strings(about));
    check('copy.ts contactPage', strings(contactPage.product));
    check('copy.ts supportPage', strings(supportPage.product));
    check('site.ts', [site.description, site.tagline, site.hero.eyebrow, site.hero.title, site.hero.description, site.disclaimer ?? '']);
  });

  it('published FAQs', async () => {
    const { faqs } = await loadContent(false);
    const published = faqs.filter((faq) => faq.isPublic);
    assert.ok(published.length >= 8, 'the landing page FAQ is populated');
    check('faqs.yaml', published.flatMap((faq) => strings(faq.data)));
  });
});

describe('planned pricing', () => {
  it('labels every paid plan as not yet available and never links to a checkout', () => {
    for (const plan of landing.pricing.plans) {
      assert.doesNotMatch(JSON.stringify(plan), /https?:\/\//, `${plan.id} must not contain links`);
      if (plan.billing !== 'free') assert.match(plan.stage, /development|not yet built|exploring|planned/i, `${plan.id} stage is honest`);
    }
    assert.match(landing.pricing.description, /Nothing is for sale yet/);
  });

  it('offers the interview for free and shows a founding price only as planned', () => {
    const [interview, kit] = landing.pricing.plans;
    assert.equal(interview?.billing, 'free');
    assert.equal(interview?.stageWhenClosed, 'Opening soon');
    assert.match(kit?.founding?.label ?? '', /^Planned/);
  });
});

describe('navigation', () => {
  const none = { products: false, solutions: false, resources: false };
  const all = { products: true, solutions: true, resources: true };

  it('product mode links to landing sections only — never to unrelated product lines', () => {
    for (const sections of [none, all]) {
      const nav = getNavigation('product', sections);
      assert.deepEqual(
        nav.primary.map((item) => item.label),
        ['How it works', 'Demo', 'Features', 'Pricing', 'FAQ', 'Contact'],
      );
      assert.deepEqual(nav.cta, { label: 'Request early access', href: landingAnchors.register });
      assert.ok(nav.primary.every((item) => !/products|solutions|resources/.test(item.href)));
    }
  });

  it('portfolio mode only links sections that have public content', () => {
    assert.deepEqual(getNavigation('portfolio', none).primary.map((item) => item.label), ['Home', 'About', 'Contact']);
    assert.deepEqual(getNavigation('portfolio', all).primary.map((item) => item.label), ['Home', 'Products', 'Solutions', 'Resources', 'About', 'Contact']);
    assert.equal(getNavigation('portfolio', none).cta.href, '/contact/');
  });

  it('never marks same-page anchors as the current page', () => {
    assert.equal(isActive({ label: 'Pricing', href: '/#pricing' }, '/'), false);
    assert.equal(isActive({ label: 'Contact', href: '/contact/' }, '/contact/'), true);
    assert.equal(isActive({ label: 'Home', href: '/', match: 'exact' }, '/about/'), false);
  });
});
