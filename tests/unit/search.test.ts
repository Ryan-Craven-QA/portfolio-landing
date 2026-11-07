import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { matchesAll, normalize, prepare, search, tokenize, type SearchRecord } from '../../src/lib/search.ts';

const records: SearchRecord[] = [
  { k: 'product', t: 'Document Inventory', d: 'WordPress plugin', u: '/a/', g: 'pdf media' },
  { k: 'resource', t: 'Recognize scam messages', d: 'Family guide', u: '/b/', g: 'phishing fraud' },
  { k: 'page', t: 'Contact', d: 'Get in touch', u: '/c/' },
  { k: 'task', t: 'Find every PDF on a site', d: 'Keep websites in good shape', u: '/d/' },
];
const prepared = records.map(prepare);

describe('normalize/tokenize', () => {
  it('lowercases, strips accents and punctuation', () => {
    assert.equal(normalize('Café — Déjà-vu!'), 'cafe deja vu');
    assert.equal(normalize('Templates & Tools'), 'templates and tools');
    assert.deepEqual(tokenize('  WordPress   plugins '), ['wordpress', 'plugins']);
  });
});

describe('search', () => {
  it('requires every term to match', () => {
    assert.deepEqual(
      search(prepared, 'pdf plugin').map((r) => r.u),
      ['/a/'],
    );
    assert.equal(search(prepared, 'pdf banana').length, 0);
  });

  it('ranks title matches above keyword and description matches', () => {
    const results = search(prepared, 'pdf').map((r) => r.u);
    assert.equal(results[0], '/d/'); // "PDF" in the title beats "pdf" in keywords
    assert.ok(results.includes('/a/'));
  });

  it('matches keywords and returns nothing for an empty query', () => {
    assert.deepEqual(
      search(prepared, 'phishing').map((r) => r.u),
      ['/b/'],
    );
    assert.equal(search(prepared, '   ').length, 0);
  });

  it('supports simple list filtering', () => {
    assert.equal(matchesAll('Family Tech Safety guide', 'family guide'), true);
    assert.equal(matchesAll('Family Tech Safety guide', 'family plugin'), false);
    assert.equal(matchesAll('anything', ''), true);
  });
});
