/**
 * Editable marketing copy that isn't tied to a product line, product or
 * resource. Change wording here without touching components.
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
    title: 'Practical first',
    body: 'Every product starts from a specific, recurring task — and is judged by whether it makes that task easier.',
  },
  {
    icon: 'tag',
    title: 'Straightforward pricing',
    body: 'Prices are shown up front on each product page, with no tiers you need a spreadsheet to decode.',
  },
  {
    icon: 'bolt',
    title: 'Easy to pick up',
    body: 'Sensible defaults and plain language, so you can get started without a long setup.',
  },
  {
    icon: 'clock',
    title: 'Fewer steps, not more',
    body: 'We design to remove steps from your routine. If something adds work, it gets rethought.',
  },
  {
    icon: 'book',
    title: 'Documented properly',
    body: 'Clear written documentation is part of the product, not an afterthought.',
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
  title: 'An independent studio for practical software.',
  description:
    'We design, build, and support focused digital products for the everyday work that keeps businesses and households running.',
  statement: 'Good tools for ordinary work are rarer than they should be.',
  intro: [
    'Most of the work that keeps things running is not glamorous: paperwork, website upkeep, recurring deadlines, keeping the family safe online. It is also where good tools are often missing — too complex, too generic, or priced for much larger organizations.',
    'This studio exists to make that work easier. We build small, focused products — software, plugins, templates, toolkits, and guides — each designed around a specific job, priced plainly, and documented properly.',
  ],
  howWeWork: [
    {
      title: 'Independent',
      body: 'A small, independent studio. Decisions are made by the people who build and support the products.',
    },
    {
      title: 'Focused',
      body: 'Each product does one job well rather than trying to be everything to everyone.',
    },
    {
      title: 'In the open',
      body: 'Every product line shows its real status. If something is still in development, the site says so.',
    },
  ],
};
