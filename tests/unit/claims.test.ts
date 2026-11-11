import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { findClaimViolations, htmlToText } from '../../src/lib/claims.ts';

const rules = (text: string, forSale = false) => findClaimViolations(text, { forSale }).map((v) => v.rule);
const flags = (text: string, rule: string, forSale = false) => assert.ok(rules(text, forSale).includes(rule), `expected "${rule}" for: ${text}`);

describe('claims guard', () => {
  it('flags claims about verifying insurance, compliance or vendors', () => {
    assert.deepEqual(rules('RenewalTrail verifies insurance coverage for every vendor.'), ['verifies-insurance']);
    assert.deepEqual(rules('We validate your certificates of insurance.'), ['verifies-insurance']);
    assert.deepEqual(rules('It keeps you compliant all year.'), ['ensures-compliance']);
    assert.deepEqual(rules('Ensure compliance in minutes.'), ['ensures-compliance']);
    flags('Your vendors stay fully compliant.', 'ensures-compliance');
    assert.deepEqual(rules('Work only with certified vendors.'), ['certifies-vendors']);
    assert.deepEqual(rules('It certifies vendor eligibility.'), ['certifies-vendors']);
  });

  it('allows questions and negated statements, so FAQs and disclaimers can say what it does not do', () => {
    assert.deepEqual(rules('Does RenewalTrail verify insurance certificates or compliance?'), []);
    assert.deepEqual(rules('It does not verify insurance coverage, determine legal compliance, or certify vendor eligibility.'), []);
    assert.deepEqual(rules('RenewalTrail doesn’t verify insurance.'), []);
    assert.deepEqual(rules('It never claims to verify insurance or determine compliance.'), []);
    assert.deepEqual(rules('Not the right fit if you need insurance verification, compliance decisions or vendor certification.'), []);
  });

  it('a negation in one sentence does not excuse a claim in the next', () => {
    assert.deepEqual(rules('No setup fees. RenewalTrail verifies insurance for you.'), ['verifies-insurance']);
  });

  it('flags features that are not built and invented social proof', () => {
    assert.deepEqual(rules('Sign in to your dashboard.'), ['sign-in']);
    assert.deepEqual(rules('AI-powered document extraction.'), ['automation']);
    assert.deepEqual(rules('It automatically sends reminders to vendors.'), ['automation']);
    assert.deepEqual(rules('Trusted by 500 property managers.'), ['social-proof']);
    flags('Rated 4.9/5 by our customers.', 'social-proof');
    assert.deepEqual(rules('A seamless experience.'), ['hype']);
  });

  it('flags "buy now" wording only while nothing is for sale', () => {
    assert.deepEqual(rules('Buy now and save.'), ['for-sale']);
    assert.deepEqual(rules('The Starter Kit is now available.'), ['for-sale']);
    assert.deepEqual(rules('Start your free trial.'), ['for-sale']);
    assert.deepEqual(rules('Buy now and save.', true), []);
    assert.deepEqual(rules('Is RenewalTrail available now?'), []);
    assert.deepEqual(rules('RenewalTrail is not available yet.'), []);
    assert.deepEqual(rules('Planned prices. Not available to buy yet.'), []);
  });

  it('reports the sentence for context', () => {
    const [violation] = findClaimViolations('Intro.\nWe guarantee compliance for every vendor.', { forSale: false });
    assert.equal(violation?.excerpt, 'We guarantee compliance for every vendor.');
  });
});

describe('htmlToText', () => {
  it('keeps visible text and meta descriptions, drops scripts and styles, decodes entities', () => {
    const text = htmlToText(
      '<html><head><title>Hi</title><meta name="description" content="Desc &amp; more"><style>.a{}</style></head><body><p>Tom&rsquo;s <b>list</b></p><script>var verifiesInsurance = 1</script><li>One</li><li>Two</li></body></html>',
    );
    assert.match(text, /Desc & more/);
    assert.match(text, /Tom’s list/);
    assert.doesNotMatch(text, /verifiesInsurance|\.a\{\}/);
    assert.match(text, /One\s*\n\s*Two/);
  });
});
