/**
 * ─────────────────────────────────────────────────────────────────────────────
 *  PRODUCT LANDING PAGE COPY (homepage when `homepage: 'product'`)
 *  {brand} is replaced with `name` from src/config/site.ts.
 *
 *  Ground rules for this copy:
 *  - Nothing is for sale yet: never say "available", "buy" or "in stock".
 *  - Administrative tracking only: never claim the product verifies
 *    insurance, determines compliance or certifies vendors.
 *  - No invented customers, quotes or numbers.
 * ─────────────────────────────────────────────────────────────────────────────
 */
import type { IconName } from '../lib/icons.ts';

export interface PricingPlan {
  id: string;
  name: string;
  stage: string;
  /** Stage shown instead while early-access registration is not set up yet. */
  stageWhenClosed?: string;
  /** Planned price in major units. Use priceRange for a range, or neither for "Free". */
  price?: number;
  priceRange?: [number, number];
  billing: 'one-time' | 'monthly' | 'free';
  founding?: { price: number; label: string };
  description: string;
  includes: string[];
  cta: { label: string; intent: 'early-access' | 'interview' | 'both' };
  highlight?: boolean;
}

export const landing = {
  status: 'Not available yet — the first planned release is a spreadsheet Starter Kit.',
  /** Appended to the hero eyebrow only while registration can actually receive requests. */
  earlyAccessOpen: 'Early access open',

  problem: {
    eyebrow: 'The problem',
    title: 'Vendor paperwork expires quietly.',
    description:
      'An independent property-management company can work with dozens of vendors, each with certificates, licenses and agreements that expire on different dates. Keeping track usually falls to whoever has a spare minute.',
    points: [
      {
        icon: 'calendar' as IconName,
        title: 'Dates live everywhere',
        body: 'Expiration dates are scattered across email attachments, shared folders, an old spreadsheet and notes in your property-management software.',
      },
      {
        icon: 'user' as IconName,
        title: 'Nobody owns the follow-up',
        body: 'Renewal requests go out late, twice, or not at all, because no one is clearly responsible for the next step with each vendor.',
      },
      {
        icon: 'alert' as IconName,
        title: 'Gaps surface at the worst time',
        body: 'A lapsed document on file tends to be noticed when the vendor is already scheduled, or when an owner asks for paperwork.',
      },
    ],
  },

  solution: {
    eyebrow: 'The idea',
    title: 'One list. Clear dates. A named owner for every next step.',
    description:
      '{brand} would keep every vendor document, its expiration date and its follow-up in one place, so the weekly check is a quick review instead of an afternoon of searching.',
    points: [
      'A single list of vendors and the documents you collect from them',
      'Statuses that follow the dates: current, due soon, expired, requested, received',
      'An owner and one clear next action on every item',
      'A follow-up log, so you know when you last asked',
      'Templates for renewal requests that you send yourself',
    ],
    scope:
      '{brand} tracks dates and follow-ups. It does not review documents, verify insurance coverage, determine legal compliance or certify vendor eligibility — your team and your advisers stay in charge of those decisions.',
  },

  demo: {
    eyebrow: 'Interactive demo',
    title: 'Try the workflow with sample data.',
    description:
      'A working preview of the tracking workflow, filled with fictional vendors and people. Filter by view or owner, then move a renewal along. Nothing is saved or sent.',
    caption:
      'Fictional demo data. This preview runs entirely in your browser to show the planned workflow — {brand} is not available yet, and the first release will be a spreadsheet.',
  },

  features: {
    eyebrow: 'Features',
    title: 'Built around one weekly question.',
    description: 'What expires next — and who is following up? Everything planned for the first release exists to answer it.',
    items: [
      { icon: 'calendar' as IconName, title: 'Expiration timeline', body: 'See what is already expired and what expires in the next 30 and 60 days.' },
      { icon: 'tag' as IconName, title: 'Date-driven statuses', body: 'Current, due soon, expired, requested and received — calculated from the dates you enter.' },
      { icon: 'user' as IconName, title: 'Owners and next actions', body: 'Assign each follow-up to a person and record the single next step.' },
      { icon: 'clock' as IconName, title: 'Follow-up log', body: 'Record when you asked and when to chase, so requests do not stall silently.' },
      { icon: 'mail' as IconName, title: 'Renewal request templates', body: 'Clear, editable emails for first requests, reminders and new-vendor paperwork. You send them yourself.' },
      { icon: 'lock' as IconName, title: 'Your data stays yours', body: 'The Starter Kit is your own Excel file or Google Sheet. Nothing is uploaded to us.' },
    ],
    note: 'Planned for the Starter Kit. Features may change based on what we learn from early users.',
  },

  howItWorks: {
    eyebrow: 'How it works',
    title: 'Set up once. Review weekly.',
    description: 'The planned routine fits around the work you already do.',
    steps: [
      { title: 'List your vendors', body: 'Paste in your vendor list — many systems can export one — and add the documents you collect from each.' },
      { title: 'Add dates and owners', body: 'Enter each expiration date and choose who follows up. Statuses update from the dates.' },
      { title: 'Review once a week', body: 'Open the “needs action” view. It lists what is expired, due soon, missing or waiting too long for a reply.' },
      { title: 'Request and log', body: 'Send renewal requests with the templates, then record when you asked and when to follow up.' },
      { title: 'Record the new date', body: 'When a new document arrives, your team reviews it and records the new expiration date.' },
    ],
  },

  audience: {
    eyebrow: 'Who it’s for',
    title: 'Independent property managers with 10–100 vendors.',
    description: 'Small teams where vendor paperwork is everyone’s side job.',
    fit: [
      'You manage residential or small commercial properties and work with roughly 10 to 100 vendors',
      'Vendor documents live in inboxes, folders or a spreadsheet nobody fully trusts',
      'An owner, office manager or property manager handles renewals alongside everything else',
      'You want a dependable weekly routine, not another system to administer',
    ],
    notFit: [
      'You need insurance verification, compliance decisions or vendor certification',
      'You need automatic reminders, a vendor portal or document storage',
      'You work with hundreds of vendors and have a dedicated compliance team',
    ],
    roles: [
      { title: 'Owners and principals', body: 'See where vendor paperwork stands without asking around.' },
      { title: 'Property managers', body: 'Know which of your vendors need a renewal request this week.' },
      { title: 'Office managers', body: 'Run the weekly check and keep a record of every request.' },
    ],
  },

  pricing: {
    eyebrow: 'Planned pricing',
    title: 'Simple prices, published early.',
    description:
      'Nothing is for sale yet. These are planned prices, shared now so early conversations can be concrete. They may change before launch.',
    plans: [
      {
        id: 'interview',
        name: 'Research interview',
        stage: 'Open now',
        stageWhenClosed: 'Opening soon',
        billing: 'free',
        description: 'A 20-minute call about how you track vendor documents today. No obligation.',
        includes: ['Help shape the first release', 'See the demo walkthrough', 'Founding price offer for participants'],
        cta: { label: 'Request an interview', intent: 'interview' },
      },
      {
        id: 'starter-kit',
        name: 'Starter Kit',
        stage: 'First release · in development',
        price: 79,
        billing: 'one-time',
        founding: { price: 49, label: 'Planned founding price for early-access participants' },
        description: 'The spreadsheet tracker for Excel and Google Sheets, renewal request templates and a setup guide.',
        includes: ['Tracker workbook (Excel and Google Sheets)', 'Renewal request and follow-up templates', 'Setup guide and weekly checklist', 'Use within one company'],
        cta: { label: 'Request early access', intent: 'early-access' },
        highlight: true,
      },
      {
        id: 'software',
        name: '{brand} software',
        stage: 'Exploring · not yet built',
        priceRange: [29, 59],
        billing: 'monthly',
        description: 'A hosted version for teams — built only if early users need it. Features and price would be shaped by interviews.',
        includes: ['The Starter Kit workflow as a shared web app', 'Shaped by early users', 'Only built with clear demand'],
        cta: { label: 'Tell us what you’d need', intent: 'interview' },
      },
    ] satisfies PricingPlan[],
    footnote: 'Planned prices in US dollars. Applicable taxes would be shown at checkout once a product is on sale.',
  },

  faq: {
    eyebrow: 'FAQ',
    title: 'Questions, answered plainly.',
  },

  register: {
    eyebrow: 'Early access',
    title: 'Help shape {brand}.',
    description:
      'We are talking with independent property managers before building. Ask for early access to the Starter Kit, a 20-minute interview, or both.',
    next: [
      'We reply by email, usually to suggest a time for a short call',
      'Interviews are about your current process — no preparation needed',
      'Early-access participants hear first when the Starter Kit is ready, at the founding price',
    ],
    intents: [
      { value: 'early-access', label: 'Early access to the Starter Kit' },
      { value: 'interview', label: 'A 20-minute interview' },
      { value: 'both', label: 'Both' },
    ],
    vendorRanges: ['Fewer than 10', '10–25', '26–50', '51–100', 'More than 100'],
    roles: ['Owner or principal', 'Property manager', 'Office or operations manager', 'Other'],
    methods: [
      'Spreadsheet',
      'Property-management software',
      'Email folders or paper files',
      'A separate tracking service',
      'Not tracked consistently',
      'Other',
    ],
    consent: 'You can contact me about {brand} early access and research interviews.',
    success: {
      title: 'Thanks — you’re on the list.',
      body: 'We’ll reply by email. If you asked for an interview, we’ll suggest a few times for a 20-minute call.',
    },
  },

  contact: {
    eyebrow: 'Contact',
    title: 'Questions first?',
    description: 'Ask anything about {brand}, the Starter Kit or the research interviews.',
  },
};
