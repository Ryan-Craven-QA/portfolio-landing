/**
 * Primary navigation. Product lines, solutions and legal links are added
 * automatically from content, so only fixed pages are listed here.
 */
import { routes } from '../lib/routes.ts';

export interface NavItem {
  label: string;
  href: string;
  /** "exact" for the home link; otherwise any page under `href` counts as active. */
  match?: 'exact' | 'prefix';
}

export const primaryNav: NavItem[] = [
  { label: 'Home', href: routes.home, match: 'exact' },
  { label: 'Products', href: routes.products },
  { label: 'Solutions', href: routes.solutions },
  { label: 'Resources', href: routes.resources },
  { label: 'About', href: routes.about },
  { label: 'Contact', href: routes.contact },
];

export const primaryCta = { label: 'Explore products', href: routes.products };

export function isActive(item: NavItem, pathname: string): boolean {
  if (item.match === 'exact') return pathname === item.href;
  return pathname === item.href || pathname.startsWith(item.href);
}
