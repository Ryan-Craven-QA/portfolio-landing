/**
 * Launch readiness report.
 *   npm run preflight             → report only
 *   npm run preflight -- --strict → exit 1 if anything blocks launch (use in CI before going live)
 *
 * Reads the same config, content and rules as the site build.
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import siteInput from '../src/config/site.ts';
import { verifyCheckoutUrl, isInternalDownloadPath } from '../src/lib/commerce.ts';
import { isPlaceholderUrl, parseSiteConfig } from '../src/lib/schemas/site.ts';
import { loadContent, projectRoot } from './lib/content.ts';

type Level = 'ok' | 'info' | 'warn' | 'block';
const ICON: Record<Level, string> = { ok: '✔', info: '·', warn: '⚠', block: '⛔' };
const sections: Array<{ title: string; items: Array<[Level, string]> }> = [];
const section = (title: string) => {
  const items: Array<[Level, string]> = [];
  sections.push({ title, items });
  return (level: Level, message: string) => items.push([level, message]);
};

async function main() {
  const site = parseSiteConfig(siteInput);
  const siteUrl = (process.env.SITE_URL ?? site.url).replace(/\/$/, '');
  const content = await loadContent(false);

  const publicProducts = content.products.filter((p) => p.isPublic);
  const purchasable = publicProducts.filter((p) => p.data.availability === 'available' || p.data.availability === 'early-access');
  const hasForm = site.contact.form.provider !== 'none';
  const hasEmail = Boolean(site.contact.general ?? site.contact.support ?? site.contact.business);
  const collectsData = hasForm || site.newsletter.provider !== 'none' || site.analytics.provider !== 'none';
  const legal = (id: string) => content.legal.find((page) => page.id === id)?.isPublic === true;

  // Brand
  const brand = section('Brand');
  if (site.name === 'Plainwork') brand('warn', '"Plainwork" is a working name — confirm trademark and domain availability, or change `name` in src/config/site.ts');
  else brand('ok', `Brand name: ${site.name}`);
  if (!site.legalName) brand('info', 'No `legalName` — the copyright line uses the brand name');
  brand('info', 'After changing the name or hero copy, run `npm run assets:og` (and `npm run assets:icons` if the mark changes)');

  // Domain
  const domain = section('Domain & indexing');
  if (isPlaceholderUrl(siteUrl)) {
    domain('block', `Site URL is a placeholder (${siteUrl}). Set SITE_URL in Cloudflare Pages (or \`url\` in site.ts). Until then every page is noindex.`);
  } else {
    domain('ok', `Canonical URL: ${siteUrl}`);
  }

  // Contact
  const contact = section('Contact');
  if (!hasForm && !hasEmail) contact('block', 'No way to contact you — set `contact.form` (Formspree/Web3Forms) and/or `contact.general`');
  else {
    if (hasForm) contact('ok', `Contact form via ${site.contact.form.provider} — send yourself a test message before launch`);
    if (hasEmail) contact('ok', `Email: ${[site.contact.general, site.contact.support, site.contact.business].filter(Boolean).join(', ')}`);
  }
  if (!site.contact.responseTime) contact('info', 'No `contact.responseTime` — only add one you will reliably meet');

  // Updates & analytics
  const updates = section('Updates & analytics');
  if (site.newsletter.provider === 'none') updates('info', 'No newsletter provider — the site offers the RSS feed instead (no emails collected)');
  else updates('ok', `Newsletter: ${site.newsletter.provider} — test a sign-up end to end`);
  if (site.analytics.provider === 'none') updates('info', 'Analytics off. Cloudflare Web Analytics is free and cookieless if you want it');
  else updates('ok', `Analytics: ${site.analytics.provider}`);

  // Legal
  const legalSection = section('Legal');
  const privacy = Boolean(site.legal.privacyUrl) || legal('privacy');
  const terms = Boolean(site.legal.termsUrl) || legal('terms');
  const refunds = Boolean(site.legal.refundsUrl) || legal('refunds');
  if (!privacy) legalSection(collectsData ? 'block' : 'warn', `Privacy policy not published${collectsData ? ' — required because the site collects data (form, newsletter or analytics)' : ''}`);
  else legalSection('ok', 'Privacy policy published');
  if (!terms) legalSection(purchasable.length > 0 ? 'block' : 'warn', 'Terms of service not published (needed before selling)');
  else legalSection('ok', 'Terms published');
  if (!refunds) legalSection(purchasable.length > 0 ? 'block' : 'warn', 'Refund policy not published (needed before selling)');
  else legalSection('ok', 'Refund policy published');

  // Catalog
  const catalog = section('Catalog');
  const visibleLines = content.lines.filter((line) => line.isPublic);
  catalog(visibleLines.length > 0 ? 'ok' : 'block', `${visibleLines.length} of ${content.lines.length} product lines visible`);
  for (const line of visibleLines) catalog('info', `  ${line.name}: status "${String(line.data.status ?? 'in-development')}"`);
  catalog('info', `${publicProducts.length} public products, ${content.products.length - publicProducts.length} drafts or hidden`);
  for (const product of purchasable) {
    const offers = (Array.isArray(product.data.offers) ? product.data.offers : []) as Array<Record<string, unknown>>;
    const working = offers.filter((offer) => {
      if (offer.price === null) return hasForm || hasEmail;
      if (offer.price === 0) {
        const href = (offer.downloadUrl ?? offer.checkoutUrl) as string | undefined;
        if (href && isInternalDownloadPath(href)) return existsSync(join(projectRoot, 'public', href));
        return verifyCheckoutUrl(href, site.checkout.extraAllowedHosts) !== null;
      }
      return verifyCheckoutUrl(offer.checkoutUrl as string | undefined, site.checkout.extraAllowedHosts) !== null;
    });
    if (offers.length === 0) catalog('block', `"${product.name}" is available but has no pricing options`);
    else if (working.length < offers.length) catalog('block', `"${product.name}": ${offers.length - working.length} offer(s) without a working checkout or download`);
    else catalog('ok', `"${product.name}": ${offers.length} working offer(s) — make a test purchase`);
    if (!product.data.links || !(product.data.links as Record<string, unknown>).documentation) catalog('warn', `"${product.name}" has no documentation link`);
  }

  // Content
  const contentSection = section('Content');
  const publishedResources = content.resources.filter((r) => r.isPublic);
  contentSection('info', `${publishedResources.length} published resources, ${content.resources.length - publishedResources.length} drafts/scheduled`);
  contentSection('warn', 'Review the starter guides in src/content/resources/ — edit or unpublish anything that does not fit your voice');
  const draftFaqs = content.faqs.filter((faq) => faq.data.status !== 'published');
  if (draftFaqs.length > 0) contentSection('info', `${draftFaqs.length} draft FAQ answers to write: ${draftFaqs.map((f) => f.id).join(', ')}`);
  if (!site.founder) contentSection('info', 'No founder profile on the About page (optional)');

  // Assets
  const assets = section('Assets');
  for (const file of ['og/default.png', 'favicon.svg', 'favicon.ico', 'apple-touch-icon.png', 'icon-192.png', 'icon-512.png']) {
    assets(existsSync(join(projectRoot, 'public', file)) ? 'ok' : 'block', `public/${file}`);
  }

  // Output
  let blockers = 0;
  let warnings = 0;
  console.log(`\nLaunch readiness — ${site.name}\n${'─'.repeat(40)}`);
  for (const { title, items } of sections) {
    console.log(`\n${title}`);
    for (const [level, message] of items) {
      if (level === 'block') blockers++;
      if (level === 'warn') warnings++;
      console.log(`  ${ICON[level]} ${message}`);
    }
  }
  console.log(`\n${blockers} blocker${blockers === 1 ? '' : 's'}, ${warnings} warning${warnings === 1 ? '' : 's'}. See LAUNCH_CHECKLIST.md for the full list.\n`);
  if (blockers > 0 && process.argv.includes('--strict')) process.exit(1);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
