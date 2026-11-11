/**
 * Navigation for both homepage modes. Links to optional sections (products,
 * solutions, resources) only appear while those sections have public content.
 */
import type { Sections } from '../lib/catalog.ts';
import { routes } from '../lib/routes.ts';

export interface NavItem {
  label: string;
  href: string;
  /** "exact" for the home link; otherwise any page under `href` counts as active. */
  match?: 'exact' | 'prefix';
}

export interface Navigation {
  primary: NavItem[];
  cta: NavItem;
  /** Footer column describing the product (product mode) or explore links (portfolio mode). */
  footerProduct: NavItem[];
}

/** Anchors on the single-product landing page. */
export const landingAnchors = {
  howItWorks: '/#how-it-works',
  demo: '/#demo',
  features: '/#features',
  audience: '/#who-its-for',
  pricing: '/#pricing',
  faq: '/#faq',
  register: '/#register',
  contact: '/#contact',
} as const;

export function getNavigation(mode: 'product' | 'portfolio', sections: Sections): Navigation {
  if (mode === 'product') {
    return {
      primary: [
        { label: 'How it works', href: landingAnchors.howItWorks },
        { label: 'Demo', href: landingAnchors.demo },
        { label: 'Features', href: landingAnchors.features },
        { label: 'Pricing', href: landingAnchors.pricing },
        { label: 'FAQ', href: landingAnchors.faq },
        { label: 'Contact', href: routes.contact },
      ],
      cta: { label: 'Request early access', href: landingAnchors.register },
      footerProduct: [
        { label: 'How it works', href: landingAnchors.howItWorks },
        { label: 'Interactive demo', href: landingAnchors.demo },
        { label: 'Features', href: landingAnchors.features },
        { label: 'Who it’s for', href: landingAnchors.audience },
        { label: 'Planned pricing', href: landingAnchors.pricing },
        { label: 'FAQ', href: landingAnchors.faq },
      ],
    };
  }

  const optional: NavItem[] = [
    ...(sections.products ? [{ label: 'Products', href: routes.products }] : []),
    ...(sections.solutions ? [{ label: 'Solutions', href: routes.solutions }] : []),
    ...(sections.resources ? [{ label: 'Resources', href: routes.resources }] : []),
  ];
  return {
    primary: [{ label: 'Home', href: routes.home, match: 'exact' }, ...optional, { label: 'About', href: routes.about }, { label: 'Contact', href: routes.contact }],
    cta: sections.products ? { label: 'Explore products', href: routes.products } : { label: 'Get in touch', href: routes.contact },
    footerProduct: optional,
  };
}

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.href.includes('#')) return false;
  if (item.match === 'exact') return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href);
}
