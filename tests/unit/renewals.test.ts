import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { demoDocuments, demoPeople, personById } from '../../src/config/demo.ts';
import { escapeHtml, renderCards, renderNextUp, renderTableRows } from '../../src/lib/renewal-demo-view.ts';
import {
  ACTION_LABELS,
  DEFAULT_SETTINGS,
  applyAction,
  countByView,
  evaluate,
  nextToExpire,
  sortDocuments,
  urgencyRank,
  type TrackedDocument,
} from '../../src/lib/renewals.ts';

const doc = (overrides: Partial<TrackedDocument>): TrackedDocument => ({
  id: 'x',
  vendor: 'Example Vendor',
  trade: 'Trade',
  document: 'Certificate of insurance',
  expiresIn: 100,
  state: 'on-file',
  owner: 'dana',
  ...overrides,
});

describe('renewal statuses', () => {
  it('derives statuses for documents on file from the expiration date', () => {
    assert.equal(evaluate(doc({ expiresIn: -1 })).status, 'expired');
    assert.equal(evaluate(doc({ expiresIn: 0 })).status, 'due-soon');
    assert.equal(evaluate(doc({ expiresIn: 0 })).detail, 'Expires today');
    assert.equal(evaluate(doc({ expiresIn: DEFAULT_SETTINGS.dueSoonDays })).status, 'due-soon');
    assert.equal(evaluate(doc({ expiresIn: DEFAULT_SETTINGS.dueSoonDays + 1 })).status, 'upcoming');
    assert.equal(evaluate(doc({ expiresIn: DEFAULT_SETTINGS.upcomingDays })).status, 'upcoming');
    assert.equal(evaluate(doc({ expiresIn: DEFAULT_SETTINGS.upcomingDays + 1 })).status, 'current');
    assert.equal(evaluate(doc({ expiresIn: null })).label, 'On file');
  });

  it('describes dates in plain words', () => {
    assert.equal(evaluate(doc({ expiresIn: -1 })).detail, 'Expired 1 day ago');
    assert.equal(evaluate(doc({ expiresIn: -4 })).detail, 'Expired 4 days ago');
    assert.equal(evaluate(doc({ expiresIn: 1 })).detail, 'Expires in 1 day');
    assert.equal(evaluate(doc({ expiresIn: null })).detail, 'No expiration date');
  });

  it('gives every item one next action', () => {
    assert.equal(evaluate(doc({ expiresIn: -3 })).nextAction, 'Send a renewal request');
    assert.equal(evaluate(doc({ expiresIn: 45 })).nextAction, 'Send a renewal request in 15 days');
    assert.equal(evaluate(doc({ state: 'missing', expiresIn: null })).nextAction, 'Request the document');
    assert.equal(evaluate(doc({ expiresIn: 200 })).nextAction, 'No action needed');
    assert.equal(evaluate(doc({ expiresIn: 200 })).action, null);
  });

  it('flags a follow-up once a request has waited long enough', () => {
    const waiting = evaluate(doc({ state: 'requested', requestedAgo: DEFAULT_SETTINGS.followUpAfterDays - 1 }));
    assert.equal(waiting.status, 'requested');
    assert.equal(waiting.view, 'waiting');
    assert.equal(waiting.nextAction, 'Follow up in 1 day if there is no reply');
    const overdue = evaluate(doc({ state: 'requested', requestedAgo: DEFAULT_SETTINGS.followUpAfterDays }));
    assert.equal(overdue.status, 'follow-up');
    assert.equal(overdue.view, 'action');
    assert.equal(overdue.note, 'Requested 7 days ago');
    assert.equal(evaluate(doc({ state: 'requested', requestedAgo: 0 })).note, 'Requested today');
  });

  it('asks for the new date once a renewed document is received', () => {
    const received = evaluate(doc({ state: 'received', expiresIn: 12 }));
    assert.equal(received.status, 'received');
    assert.equal(received.action, 'record');
    assert.match(received.nextAction, /record the new expiration date/);
  });

  it('respects custom thresholds', () => {
    const settings = { dueSoonDays: 45, upcomingDays: 90, followUpAfterDays: 3 };
    assert.equal(evaluate(doc({ expiresIn: 40 }), settings).status, 'due-soon');
    assert.equal(evaluate(doc({ state: 'requested', requestedAgo: 3 }), settings).status, 'follow-up');
  });

  it('never uses wording that implies verification or compliance', () => {
    const states = [
      doc({ expiresIn: -5 }),
      doc({ expiresIn: 5 }),
      doc({ expiresIn: 50 }),
      doc({ expiresIn: 500 }),
      doc({ expiresIn: null }),
      doc({ state: 'missing', expiresIn: null }),
      doc({ state: 'requested', requestedAgo: 2 }),
      doc({ state: 'requested', requestedAgo: 9 }),
      doc({ state: 'received' }),
    ];
    for (const result of states.map((d) => evaluate(d))) {
      const words = [result.label, result.detail, result.note ?? '', result.nextAction].join(' ');
      assert.doesNotMatch(words, /verif|complian|certif|valid|approved|eligib/i, words);
    }
  });
});

describe('renewal actions', () => {
  it('moves a document through request → received → recorded without mutating it', () => {
    const original = doc({ expiresIn: -4 });
    const requested = applyAction(original, 'request');
    assert.equal(requested.state, 'requested');
    assert.equal(requested.requestedAgo, 0);
    assert.equal(original.state, 'on-file');
    const received = applyAction(requested, 'receive');
    assert.equal(received.state, 'received');
    const recorded = applyAction(received, 'record');
    assert.equal(recorded.state, 'on-file');
    assert.equal(recorded.expiresIn, 365);
    assert.equal(evaluate(recorded).status, 'current');
  });

  it('logging a follow-up restarts the wait', () => {
    const followUp = doc({ state: 'requested', requestedAgo: 10 });
    assert.equal(evaluate(followUp).action, 'follow-up');
    const logged = applyAction(followUp, 'follow-up');
    assert.equal(logged.requestedAgo, 0);
    assert.equal(evaluate(logged).status, 'requested');
  });

  it('labels every action', () => {
    assert.deepEqual(Object.keys(ACTION_LABELS).sort(), ['follow-up', 'receive', 'record', 'request']);
  });
});

describe('sorting and views', () => {
  it('sorts the most urgent first: expired, missing, follow-up, due soon, received, waiting, upcoming, current', () => {
    const docs = [
      doc({ id: 'current', expiresIn: 300 }),
      doc({ id: 'upcoming', expiresIn: 50 }),
      doc({ id: 'waiting', state: 'requested', requestedAgo: 1, expiresIn: 10 }),
      doc({ id: 'received', state: 'received', expiresIn: 3 }),
      doc({ id: 'due-soon', expiresIn: 20 }),
      doc({ id: 'follow-up', state: 'requested', requestedAgo: 9, expiresIn: 15 }),
      doc({ id: 'missing', state: 'missing', expiresIn: null }),
      doc({ id: 'expired', expiresIn: -2 }),
      doc({ id: 'expired-longer', expiresIn: -20 }),
    ];
    const order = sortDocuments(docs, 'urgency', () => '').map((d) => d.id);
    assert.deepEqual(order, ['expired-longer', 'expired', 'missing', 'follow-up', 'due-soon', 'received', 'waiting', 'upcoming', 'current']);
  });

  it('ranks statuses in tiers regardless of how far away the date is', () => {
    assert.ok(urgencyRank('expired', -1) < urgencyRank('missing', null));
    assert.ok(urgencyRank('due-soon', 30) < urgencyRank('received', -400));
    assert.ok(urgencyRank('current', 10_000) < urgencyRank('current', null));
  });

  it('sorts by vendor or owner on request', () => {
    const names: Record<string, string> = { a: 'Zoe', b: 'Adam' };
    const docs = [doc({ id: '1', vendor: 'Beta', owner: 'a' }), doc({ id: '2', vendor: 'Alpha', owner: 'b' })];
    assert.deepEqual(sortDocuments(docs, 'vendor', (id) => names[id] ?? '').map((d) => d.id), ['2', '1']);
    assert.deepEqual(sortDocuments(docs, 'owner', (id) => names[id] ?? '').map((d) => d.id), ['2', '1']);
  });

  it('finds the next document to expire, skipping expired and missing ones', () => {
    const docs = [doc({ id: 'gone', expiresIn: -1 }), doc({ id: 'later', expiresIn: 40 }), doc({ id: 'soon', expiresIn: 3 }), doc({ id: 'none', state: 'missing', expiresIn: null })];
    assert.equal(nextToExpire(docs)?.id, 'soon');
    assert.equal(nextToExpire([doc({ expiresIn: -3 })]), undefined);
  });
});

describe('demo data', () => {
  it('is internally consistent', () => {
    const ids = new Set(demoDocuments.map((d) => d.id));
    assert.equal(ids.size, demoDocuments.length, 'document ids are unique');
    for (const d of demoDocuments) assert.ok(demoPeople.some((p) => p.id === d.owner), `${d.id} has a known owner`);
    assert.equal(personById('nobody').name.length > 0, true, 'unknown owners fall back gracefully');
  });

  it('covers every status the demo explains', () => {
    const statuses = new Set(demoDocuments.map((d) => evaluate(d).status));
    for (const status of ['expired', 'missing', 'due-soon', 'received', 'follow-up', 'requested', 'upcoming', 'current']) {
      assert.ok(statuses.has(status as never), `demo shows "${status}"`);
    }
  });

  it('has the counts the landing page was designed around', () => {
    assert.deepEqual(countByView(demoDocuments), { action: 7, waiting: 1, upcoming: 2, current: 4, all: 14 });
  });
});

describe('demo rendering', () => {
  const today = new Date(2026, 0, 15);

  it('escapes HTML', () => {
    assert.equal(escapeHtml(`<b class="x">Tom & Jerry's</b>`), '&lt;b class=&quot;x&quot;&gt;Tom &amp; Jerry&#39;s&lt;/b&gt;');
  });

  it('renders accessible rows with a labelled action button', () => {
    const html = renderTableRows([doc({ vendor: 'Acme <Pipes>', expiresIn: 5 })], personById, today, 'en-US');
    assert.match(html, /<th scope="row"/);
    assert.match(html, /Acme &lt;Pipes&gt;/);
    assert.match(html, /Jan 20, 2026/);
    assert.match(html, /<button type="button"[^>]*data-action="request"[^>]*aria-label="Mark request sent: Acme &lt;Pipes&gt;, Certificate of insurance"/);
  });

  it('renders mobile cards and the next-up summary', () => {
    const cards = renderCards([doc({ expiresIn: 5 })], personById, today, 'en-US');
    assert.match(cards, /^<li/);
    const next = renderNextUp([doc({ vendor: 'Soonest', expiresIn: 2 }), doc({ vendor: 'Later', expiresIn: 9 })], personById, today, 'en-US');
    assert.match(next, /Soonest/);
    assert.doesNotMatch(next, /Later/);
  });
});
