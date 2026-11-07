/**
 * Content-Security-Policy, derived from the site configuration.
 *
 * Astro hashes every script and stylesheet it emits and writes the policy into
 * a <meta http-equiv="content-security-policy"> tag on each page. Third-party
 * hosts are added ONLY for integrations that are actually configured, so the
 * default build allows nothing beyond this origin.
 *
 * Headers that cannot live in a meta tag (frame-ancestors, etc.) are set in
 * public/_headers.
 *
 * Pure module — shared with /scripts.
 */
import type { SiteConfig } from './schemas/site.ts';

export interface ThirdPartyHosts {
  script: string[];
  connect: string[];
  form: string[];
}

const origin = (url: string) => new URL(url).origin;

export function thirdPartyHosts(site: SiteConfig): ThirdPartyHosts {
  const script = new Set<string>();
  const connect = new Set<string>();
  const form = new Set<string>();

  switch (site.contact.form.provider) {
    case 'formspree':
      form.add('https://formspree.io');
      connect.add('https://formspree.io');
      break;
    case 'web3forms':
      form.add('https://api.web3forms.com');
      connect.add('https://api.web3forms.com');
      break;
    case 'none':
      break;
  }

  switch (site.newsletter.provider) {
    case 'buttondown':
      form.add('https://buttondown.com');
      break;
    case 'kit':
      // Kit embeds post to app.kit.com; older embeds (and redirects) use app.convertkit.com.
      form.add('https://app.kit.com');
      form.add('https://app.convertkit.com');
      break;
    case 'custom':
      form.add(origin(site.newsletter.action));
      break;
    case 'none':
      break;
  }

  switch (site.analytics.provider) {
    case 'cloudflare':
      script.add('https://static.cloudflareinsights.com');
      connect.add('https://cloudflareinsights.com');
      break;
    case 'plausible':
      script.add(origin(site.analytics.src));
      connect.add(origin(site.analytics.apiHost));
      break;
    case 'umami':
      script.add(origin(site.analytics.src));
      for (const host of site.analytics.connectHosts) connect.add(origin(host));
      break;
    case 'none':
      break;
  }

  return { script: [...script], connect: [...connect], form: [...form] };
}

const list = (hosts: readonly string[]) => (hosts.length > 0 ? ` ${hosts.join(' ')}` : '');

/** Directives for Astro's `security.csp` option. */
export function cspDirectives(site: SiteConfig) {
  const hosts = thirdPartyHosts(site);
  return {
    directives: [
      "default-src 'self'",
      "img-src 'self' data:",
      "font-src 'self'",
      `connect-src 'self'${list(hosts.connect)}`,
      `form-action 'self'${list(hosts.form)}`,
      "frame-src 'none'",
      "object-src 'none'",
      "base-uri 'self'",
      "manifest-src 'self'",
      "worker-src 'none'",
      'upgrade-insecure-requests',
    ],
    scriptResources: ["'self'", ...hosts.script],
  };
}
