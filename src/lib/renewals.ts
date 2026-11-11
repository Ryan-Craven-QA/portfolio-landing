/**
 * Renewal tracking rules used by the RenewalTrail demo (and specified for the
 * Starter Kit spreadsheet in STARTER_KIT_SPEC.md).
 *
 * Administrative tracking only: statuses describe dates and follow-up state.
 * Nothing here says whether a document is valid, a policy is adequate, or a
 * vendor is compliant — never add statuses that imply that.
 *
 * Pure module (no DOM, no Astro) — unit tested in tests/unit/renewals.test.ts.
 */

/** Where the document stands in your own workflow. */
export type DocumentState = 'on-file' | 'missing' | 'requested' | 'received';

export interface TrackedDocument {
  id: string;
  vendor: string;
  trade: string;
  document: string;
  /** Days until the expiration date on file (negative = already passed). null = no expiration date. */
  expiresIn: number | null;
  state: DocumentState;
  /** For requested documents: days since the request was sent. */
  requestedAgo?: number | undefined;
  /** Person id responsible for the next step. */
  owner: string;
}

export type RenewalStatus = 'expired' | 'missing' | 'due-soon' | 'received' | 'follow-up' | 'requested' | 'upcoming' | 'current';

/** Views used by the demo filters (and the Starter Kit dashboard). */
export type RenewalView = 'action' | 'waiting' | 'upcoming' | 'current' | 'all';

export interface RenewalSettings {
  /** Expiring within this many days → "Due soon". */
  dueSoonDays: number;
  /** Expiring within this many days → "Coming up". */
  upcomingDays: number;
  /** Follow up on a request after this many days without a reply. */
  followUpAfterDays: number;
}

export const DEFAULT_SETTINGS: RenewalSettings = { dueSoonDays: 30, upcomingDays: 60, followUpAfterDays: 7 };

export type ActionKind = 'request' | 'follow-up' | 'receive' | 'record';

export interface Evaluation {
  status: RenewalStatus;
  /** Short status label, e.g. "Due soon". */
  label: string;
  /** Date context, e.g. "Expires in 6 days". */
  detail: string;
  /** Workflow context, e.g. "Requested 9 days ago". */
  note?: string | undefined;
  /** The single next step, e.g. "Send a renewal request". */
  nextAction: string;
  view: Exclude<RenewalView, 'all'>;
  /** The demo action that moves this item along, if any. */
  action: ActionKind | null;
  /** Lower = more urgent. Used for "soonest first" sorting. */
  urgency: number;
}

const plural = (n: number, unit: string) => `${n} ${unit}${n === 1 ? '' : 's'}`;

/**
 * "Most urgent first" order: lapsed documents, then missing ones, overdue
 * follow-ups, renewals due soon, copies waiting to be recorded, open requests,
 * upcoming renewals and finally current documents. Within a tier, the
 * earliest date comes first.
 */
const TIER: Record<RenewalStatus, number> = {
  expired: 0,
  missing: 1,
  'follow-up': 2,
  'due-soon': 3,
  received: 4,
  requested: 5,
  upcoming: 6,
  current: 7,
};

export function urgencyRank(status: RenewalStatus, expiresIn: number | null): number {
  const days = Math.max(-49_999, Math.min(49_999, expiresIn ?? 49_999));
  return TIER[status] * 100_000 + days;
}

function dateDetail(expiresIn: number | null): string {
  if (expiresIn === null) return 'No expiration date';
  if (expiresIn < 0) return `Expired ${plural(-expiresIn, 'day')} ago`;
  if (expiresIn === 0) return 'Expires today';
  return `Expires in ${plural(expiresIn, 'day')}`;
}

export function evaluate(doc: TrackedDocument, settings: RenewalSettings = DEFAULT_SETTINGS): Evaluation {
  const expires = doc.expiresIn;

  if (doc.state === 'missing') {
    return { status: 'missing', label: 'Missing', detail: 'Not on file', nextAction: 'Request the document', view: 'action', action: 'request', urgency: urgencyRank('missing', expires) };
  }

  if (doc.state === 'received') {
    return {
      status: 'received',
      label: 'Received',
      detail: expires === null ? 'Date not yet recorded' : dateDetail(expires),
      note: 'New copy received',
      nextAction: 'Review it and record the new expiration date',
      view: 'action',
      action: 'record',
      urgency: urgencyRank('received', expires),
    };
  }

  if (doc.state === 'requested') {
    const ago = doc.requestedAgo ?? 0;
    const wait = settings.followUpAfterDays - ago;
    const sent = ago === 0 ? 'Requested today' : `Requested ${plural(ago, 'day')} ago`;
    if (wait <= 0) {
      return {
        status: 'follow-up',
        label: 'Follow up',
        detail: expires === null ? 'Not on file' : dateDetail(expires),
        note: sent,
        nextAction: 'Follow up with the vendor',
        view: 'action',
        action: 'follow-up',
        urgency: urgencyRank('follow-up', expires),
      };
    }
    return {
      status: 'requested',
      label: 'Requested',
      detail: expires === null ? 'Not on file' : dateDetail(expires),
      note: sent,
      nextAction: `Follow up in ${plural(wait, 'day')} if there is no reply`,
      view: 'waiting',
      action: 'receive',
      urgency: urgencyRank('requested', expires),
    };
  }

  // On file
  if (expires === null) {
    return { status: 'current', label: 'On file', detail: dateDetail(null), nextAction: 'No action needed', view: 'current', action: null, urgency: urgencyRank('current', null) };
  }
  if (expires < 0) {
    return { status: 'expired', label: 'Expired', detail: dateDetail(expires), nextAction: 'Send a renewal request', view: 'action', action: 'request', urgency: urgencyRank('expired', expires) };
  }
  if (expires <= settings.dueSoonDays) {
    return { status: 'due-soon', label: 'Due soon', detail: dateDetail(expires), nextAction: 'Send a renewal request', view: 'action', action: 'request', urgency: urgencyRank('due-soon', expires) };
  }
  if (expires <= settings.upcomingDays) {
    const sendIn = expires - settings.dueSoonDays;
    return {
      status: 'upcoming',
      label: 'Coming up',
      detail: dateDetail(expires),
      nextAction: `Send a renewal request in ${plural(sendIn, 'day')}`,
      view: 'upcoming',
      action: 'request',
      urgency: urgencyRank('upcoming', expires),
    };
  }
  return { status: 'current', label: 'Current', detail: dateDetail(expires), nextAction: 'No action needed', view: 'current', action: null, urgency: urgencyRank('current', expires) };
}

/** Applies a demo action and returns the updated document (never mutates the input). */
export function applyAction(doc: TrackedDocument, action: ActionKind, renewalTermDays = 365): TrackedDocument {
  switch (action) {
    case 'request':
    case 'follow-up':
      return { ...doc, state: 'requested', requestedAgo: 0 };
    case 'receive':
      return { ...doc, state: 'received', requestedAgo: undefined };
    case 'record':
      return { ...doc, state: 'on-file', expiresIn: renewalTermDays, requestedAgo: undefined };
  }
}

export const ACTION_LABELS: Record<ActionKind, string> = {
  request: 'Mark request sent',
  'follow-up': 'Log follow-up',
  receive: 'Mark received',
  record: 'Record new date',
};

/** Past-tense message announced after an action. */
export const ACTION_RESULTS: Record<ActionKind, string> = {
  request: 'Renewal request marked as sent',
  'follow-up': 'Follow-up logged',
  receive: 'Marked as received',
  record: 'New expiration date recorded (one year out)',
};

export function countByView(docs: readonly TrackedDocument[], settings: RenewalSettings = DEFAULT_SETTINGS): Record<RenewalView, number> {
  const counts: Record<RenewalView, number> = { action: 0, waiting: 0, upcoming: 0, current: 0, all: docs.length };
  for (const doc of docs) counts[evaluate(doc, settings).view]++;
  return counts;
}

/** The next document to expire that is still on file or awaiting a reply (not already expired). */
export function nextToExpire(docs: readonly TrackedDocument[]): TrackedDocument | undefined {
  return docs
    .filter((doc) => doc.expiresIn !== null && doc.expiresIn >= 0 && (doc.state === 'on-file' || doc.state === 'requested'))
    .sort((a, b) => (a.expiresIn ?? 0) - (b.expiresIn ?? 0))[0];
}

export type SortKey = 'urgency' | 'vendor' | 'owner';

export function sortDocuments(docs: readonly TrackedDocument[], key: SortKey, ownerName: (id: string) => string): TrackedDocument[] {
  const copy = [...docs];
  if (key === 'vendor') return copy.sort((a, b) => a.vendor.localeCompare(b.vendor) || a.document.localeCompare(b.document));
  if (key === 'owner') return copy.sort((a, b) => ownerName(a.owner).localeCompare(ownerName(b.owner)) || evaluate(a).urgency - evaluate(b).urgency);
  return copy.sort((a, b) => evaluate(a).urgency - evaluate(b).urgency || a.vendor.localeCompare(b.vendor));
}
