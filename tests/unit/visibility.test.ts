import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  isBusinessPublic,
  isLegalPublic,
  isProductPublic,
  isResourcePublic,
  isSolutionPublic,
  type BusinessLike,
  type VisibilityContext,
} from '../../src/lib/visibility.ts';

const now = new Date('2026-11-07T12:00:00Z');
const live: VisibilityContext = { previewDrafts: false, now };
const preview: VisibilityContext = { previewDrafts: true, now };

const businesses = new Map<string, BusinessLike>([
  ['shown', { id: 'shown', visible: true }],
  ['hidden', { id: 'hidden', visible: false }],
]);

describe('product lines', () => {
  it('are public only when visible', () => {
    assert.equal(isBusinessPublic({ id: 'a', visible: true }, live), true);
    assert.equal(isBusinessPublic({ id: 'a', visible: false }, live), false);
    assert.equal(isBusinessPublic({ id: 'a', visible: false }, preview), true);
  });
});

describe('products', () => {
  it('need visibility "public" AND a visible product line', () => {
    assert.equal(isProductPublic({ visibility: 'public', business: 'shown' }, businesses, live), true);
    assert.equal(isProductPublic({ visibility: 'draft', business: 'shown' }, businesses, live), false);
    assert.equal(isProductPublic({ visibility: 'public', business: 'hidden' }, businesses, live), false);
    assert.equal(isProductPublic({ visibility: 'public', business: 'missing' }, businesses, live), false);
  });

  it('are all visible in draft preview', () => {
    assert.equal(isProductPublic({ visibility: 'draft', business: 'hidden' }, businesses, preview), true);
  });
});

describe('resources', () => {
  const base = { status: 'published' as const, publishDate: new Date('2026-01-01') };

  it('need to be published, past their publish date, and in a visible line (if any)', () => {
    assert.equal(isResourcePublic(base, businesses, live), true);
    assert.equal(isResourcePublic({ ...base, status: 'draft' }, businesses, live), false);
    assert.equal(isResourcePublic({ ...base, publishDate: new Date('2027-01-01') }, businesses, live), false);
    assert.equal(isResourcePublic({ ...base, business: 'shown' }, businesses, live), true);
    assert.equal(isResourcePublic({ ...base, business: 'hidden' }, businesses, live), false);
  });
});

describe('solutions and legal pages', () => {
  it('show a solution when at least one of its lines is visible', () => {
    assert.equal(isSolutionPublic({ businesses: ['hidden', 'shown'] }, businesses, live), true);
    assert.equal(isSolutionPublic({ businesses: ['hidden'] }, businesses, live), false);
    assert.equal(isSolutionPublic({ businesses: ['hidden'] }, businesses, preview), true);
  });

  it('publish legal pages only when marked published', () => {
    assert.equal(isLegalPublic({ status: 'published' }, live), true);
    assert.equal(isLegalPublic({ status: 'draft' }, live), false);
  });
});
