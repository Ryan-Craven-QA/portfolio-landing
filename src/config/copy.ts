/**
 * Editable copy for the About and Contact pages and the optional portfolio homepage.
 * The single-product landing page copy lives in src/config/landing.ts.
 * {brand} is replaced with `name` from src/config/site.ts.
 *
 * Keep it honest: describe how you work and what you aim for. Avoid claims
 * about results, customers or numbers you cannot back up.
 */
import type { IconName } from '../lib/icons.ts';

export interface Principle {
  icon: IconName;
  title: string;
  body: string;
}

export const principles: Principle[] = [
  {
    icon: 'tool',
    title: 'Clearly scoped',
    body: '{brand} tracks dates, requests and owners. It does not review documents or decide whether a vendor meets your requirements.',
  },
  {
    icon: 'lock',
    title: 'Your data stays yours',
    body: 'The Starter Kit is a spreadsheet in your own Excel file or Google account. Nothing is uploaded to us.',
  },
  {
    icon: 'tag',
    title: 'Plain pricing',
    body: 'Planned prices are published up front, and early-access participants are offered a founding price.',
  },
  {
    icon: 'message',
    title: 'Built with property managers',
    body: 'We are interviewing independent property managers before building, and the product will follow what we learn.',
  },
  {
    icon: 'clock',
    title: 'Fewer steps, not more',
    body: 'Designed around a short weekly review — not another system that needs its own administrator.',
  },
  {
    icon: 'eye',
    title: 'Accessible by default',
    body: 'Readable, keyboard-friendly, and respectful of the hardware and bandwidth you actually have.',
  },
];

export const home = {
  lines: {
    eyebrow: 'Product lines',
    title: 'Specific tools for specific work.',
    description:
      'Each product line focuses on one kind of everyday work. Status badges show exactly where each one stands.',
  },
  releases: {
    eyebrow: 'Releases',
    title: 'Featured products',
    emptyTitle: 'First releases are on the workbench.',
    emptyBody: [
      "We would rather ship something genuinely useful than fill this space with placeholders.",
      'Products will appear here as they become available, with pricing and documentation on each page.',
    ],
  },
  solutions: {
    eyebrow: 'Solutions',
    title: 'Start from the problem.',
    description: 'Not sure which product line fits? Pick the job you need done.',
  },
  resources: {
    eyebrow: 'Library',
    title: 'Free guides and downloads.',
    description: 'Practical, plain-language resources — useful on their own, whether or not you ever buy anything.',
  },
  principles: {
    eyebrow: 'Principles',
    title: 'How we build.',
    description: 'A short list of standards every product is held to.',
  },
  updates: {
    eyebrow: 'Updates',
    title: 'Hear when something ships.',
    description: 'Occasional emails about new releases and free resources.',
    rssTitle: 'Follow along.',
    rssDescription:
      'New releases and resources are published to the RSS feed — add it to any feed reader to hear about them first.',
  },
};

export const about = {
  eyebrow: 'About',
  title: 'Why we’re building {brand}.',
  description:
    'A focused tool for one unglamorous job: knowing which vendor documents expire next, and who is following up.',
  statement: 'Small property-management teams deserve a simple, dependable way to keep vendor paperwork current.',
  intro: [
    'Independent property-management companies rely on dozens of vendors — plumbers, electricians, landscapers, cleaners — and each one comes with paperwork that expires: certificates of insurance, licenses, agreements. Tracking it is rarely anyone’s main job, so dates slip and follow-ups stall.',
    '{brand} is our attempt to make that routine simple. We are starting small: talking with property managers first, then building a spreadsheet Starter Kit, and only building software if early users clearly need it.',
  ],
  principlesEyebrow: 'Principles',
  principlesTitle: 'How we are building it.',
  principlesDescription: 'The standards {brand} is held to, from the first spreadsheet onwards.',
  ctaTitle: 'Want to help shape {brand}?',
  howWeWork: [
    {
      title: 'Validate first',
      body: 'We talk with property managers before building, and publish what is planned rather than what we hope to sell.',
    },
    {
      title: 'Spreadsheet before software',
      body: 'The first release is a tracker you can run in Excel or Google Sheets, with no accounts and no uploads.',
    },
    {
      title: 'Honest scope',
      body: '{brand} supports administrative tracking only. It never claims to verify insurance or determine compliance.',
    },
  ],
};

export interface ContactChannel {
  /** Which configured address to show (`contact.general` / `support` / `business`). */
  topic?: 'general' | 'support' | 'business';
  icon: IconName;
  title: string;
  body: string;
  /** A link instead of (or as well as) an email address, e.g. the early-access form. */
  link?: { label: string; href: string };
  /** Also show the interview booking link (or an interview request link when none is set). */
  showBooking?: boolean;
}

export interface ContactCopy {
  description: string;
  metaDescription: string;
  channels: ContactChannel[];
  /** Topics offered on the contact form. Values are sent with the message. */
  topics: Array<{ value: string; label: string }>;
  formIntro: string;
  messageHint: string;
}

/** Contact page copy for each homepage mode. */
export const contactPage: Record<'product' | 'portfolio', ContactCopy> = {
  product: {
    description: 'Questions about {brand}, early access, or a business inquiry — here’s how to reach us.',
    metaDescription: 'Contact {brand} with questions about the product, early access, customer interviews, or business inquiries.',
    channels: [
      {
        topic: 'general',
        icon: 'message',
        title: 'Questions about {brand}',
        body: 'What it will track, what it won’t, and whether it would fit the way your office works today.',
      },
      {
        icon: 'calendar',
        title: 'Early access and interviews',
        body: 'Join the early-access list, or offer 20 minutes on how you track vendor documents today.',
        link: { label: 'Request early access', href: '/?interest=early-access#register' },
        showBooking: true,
      },
      {
        topic: 'business',
        icon: 'building',
        title: 'Business inquiries',
        body: 'Property-management associations, consultants, and press.',
      },
    ],
    topics: [
      { value: 'general', label: 'Question about {brand}' },
      { value: 'feedback', label: 'Feedback or an idea' },
      { value: 'business', label: 'Business inquiry' },
    ],
    formIntro: 'Choose a topic so your message reaches the right place. To join early access or offer an interview, the early-access form is quicker.',
    messageHint: 'Please don’t include vendor documents, policy numbers, or personal details about tenants.',
  },
  portfolio: {
    description: 'A question about a product, help with something you’re using, or a business inquiry — here’s how to reach us.',
    metaDescription: 'Contact {brand} for general questions, product support, or business and licensing inquiries.',
    channels: [
      { topic: 'general', icon: 'message', title: 'General inquiries', body: 'Questions about the studio, a product line, or anything else.' },
      { topic: 'support', icon: 'lifebuoy', title: 'Product support', body: 'Help with a product you use — setup, problems, or how to do something.' },
      { topic: 'business', icon: 'building', title: 'Business inquiries', body: 'Organization and agency licensing, partnerships, and custom requests.' },
    ],
    topics: [
      { value: 'general', label: 'General inquiry' },
      { value: 'support', label: 'Product support' },
      { value: 'business', label: 'Business inquiry' },
    ],
    formIntro: 'Choose a topic so your message reaches the right place. For support, mention the product you’re using.',
    messageHint: 'For product support, include what you were trying to do and what happened instead.',
  },
};

export interface SupportCopy {
  /** Browser-tab / SEO title. */
  pageTitle: string;
  eyebrow: string;
  title: string;
  description: string;
  metaDescription: string;
  /** FAQ group headings, in display order (see `category` in src/content/faqs.yaml). */
  groups: Array<{ id: 'general' | 'products' | 'purchasing' | 'support'; title: string }>;
  stillStuckTitle: string;
  stillStuckBody: string;
  stillStuckCta: string;
}

/** Help / support page copy for each homepage mode. */
export const supportPage: Record<'product' | 'portfolio', SupportCopy> = {
  product: {
    pageTitle: 'Help and FAQ',
    eyebrow: 'Help',
    title: 'Help and answers.',
    description: 'Common questions about {brand}: what it will do, what it won’t, pricing, and early access.',
    metaDescription: 'Answers to common questions about {brand}: scope, data, planned pricing, and early access.',
    groups: [
      { id: 'general', title: 'General' },
      { id: 'products', title: 'What {brand} does' },
      { id: 'purchasing', title: 'Pricing' },
      { id: 'support', title: 'Getting in touch' },
    ],
    stillStuckTitle: 'Still have a question?',
    stillStuckBody: 'Ask us directly.',
    stillStuckCta: 'Contact us',
  },
  portfolio: {
    pageTitle: 'Support',
    eyebrow: 'Support',
    title: 'Help and answers.',
    description: 'Start with the documentation and common questions. If you’re still stuck, contact support.',
    metaDescription: 'Help, answers, and documentation for {brand} products — plus how to contact support.',
    groups: [
      { id: 'purchasing', title: 'Buying and licensing' },
      { id: 'products', title: 'Products' },
      { id: 'support', title: 'Getting help' },
      { id: 'general', title: 'General' },
    ],
    stillStuckTitle: 'Still stuck?',
    stillStuckBody: 'Tell us what you were trying to do and what happened instead.',
    stillStuckCta: 'Contact support',
  },
};
