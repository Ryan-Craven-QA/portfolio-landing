/**
 * Post-build verification of the generated site. Runs after every build:
 *   npm run build            → checks dist/
 *   npm run build:fixtures   → checks dist-fixtures/ (adds fixture-specific leak checks)
 *
 * Fails (exit 1) on:
 *  - pages missing a title, description, canonical URL, Open Graph tags,
 *    a single <h1>, a lang attribute, or the CSP meta tag
 *  - broken internal links/assets and same-page anchors
 *  - images without alt text, insecure http:// links
 *  - any trace of draft or hidden content (URLs, files, search index, sitemap, RSS)
 *  - dev-only notices or draft-preview banners in the output
 */
import { existsSync } from 'node:fs';
import { readdir, readFile, stat } from 'node:fs/promises';
import { join, relative, sep } from 'node:path';
import { gzipSync } from 'node:zlib';
import { loadContent, projectRoot } from './lib/content.ts';

const fixtures = process.argv.includes('--fixtures');
const dist = join(projectRoot, fixtures ? 'dist-fixtures' : 'dist');
const errors: string[] = [];
const warnings: string[] = [];
const fail = (message: string) => errors.push(message);
const warn = (message: string) => warnings.push(message);

async function walk(dir: string): Promise<string[]> {
  const out: string[] = [];
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await walk(full)));
    else out.push(full);
  }
  return out;
}

const toUrlPath = (file: string) => {
  const rel = relative(dist, file).split(sep).join('/');
  if (rel === 'index.html') return '/';
  if (rel === '404.html') return '/404';
  return `/${rel.replace(/index\.html$/, '')}`;
};

function resolveInternal(href: string): string | null {
  const clean = decodeURI(href.split('#')[0]?.split('?')[0] ?? '');
  if (clean === '') return null;
  if (clean.endsWith('/')) return join(dist, clean, 'index.html');
  return join(dist, clean);
}

const attr = (tag: string, name: string) => new RegExp(`\\s${name}=(?:"([^"]*)"|'([^']*)')`, 'i').exec(tag)?.slice(1).find((v) => v !== undefined);

async function main() {
  if (!existsSync(dist)) {
    console.error(`No build output at ${dist}. Run the build first.`);
    process.exit(1);
  }

  const files = await walk(dist);
  const htmlFiles = files.filter((file) => file.endsWith('.html'));
  const content = await loadContent(fixtures);
  const siteOrigin = await (async () => {
    const index = await readFile(join(dist, 'index.html'), 'utf8');
    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(index)?.[1];
    return canonical ? new URL(canonical).origin : null;
  })();

  const titles = new Map<string, string>();
  let indexable = 0;

  for (const file of htmlFiles) {
    const html = await readFile(file, 'utf8');
    const path = toUrlPath(file);
    const where = `${path}`;
    const is404 = path === '/404';

    if (!/<html[^>]*\slang="[a-z]{2}/.test(html)) fail(`${where}: missing <html lang>`);
    const title = /<title>([^<]*)<\/title>/.exec(html)?.[1]?.trim();
    if (!title) fail(`${where}: missing <title>`);
    else if (titles.has(title) && !is404) fail(`${where}: duplicate <title> "${title}" (also on ${titles.get(title)})`);
    else titles.set(title, where);

    const description = /<meta name="description" content="([^"]*)"/.exec(html)?.[1];
    if (!description) fail(`${where}: missing meta description`);
    else if (description.length > 175) warn(`${where}: meta description is ${description.length} characters (aim for ≤ 160)`);

    const canonical = /<link rel="canonical" href="([^"]+)"/.exec(html)?.[1];
    if (!is404) {
      if (!canonical) fail(`${where}: missing canonical link`);
      else if (siteOrigin && canonical !== `${siteOrigin}${path}`) fail(`${where}: canonical ${canonical} does not match page URL`);
    }
    for (const property of ['og:title', 'og:description', 'og:image', 'og:url']) {
      if (!html.includes(`property="${property}"`)) fail(`${where}: missing ${property}`);
    }
    const ogImage = /<meta property="og:image" content="([^"]+)"/.exec(html)?.[1];
    if (ogImage && !/^https?:\/\//.test(ogImage)) fail(`${where}: og:image must be absolute`);
    if (ogImage && siteOrigin && ogImage.startsWith(siteOrigin)) {
      const local = resolveInternal(new URL(ogImage).pathname);
      if (local && !existsSync(local)) fail(`${where}: og:image ${ogImage} does not exist in the build`);
    }

    const h1Count = (html.match(/<h1[\s>]/g) ?? []).length;
    if (h1Count !== 1) fail(`${where}: expected exactly one <h1>, found ${h1Count}`);
    if (!html.includes('http-equiv="content-security-policy"')) fail(`${where}: missing Content-Security-Policy meta tag`);
    if (html.includes('data-config-notice')) fail(`${where}: dev-only configuration notice leaked into the build`);
    if (html.includes('Draft preview.')) fail(`${where}: draft preview banner leaked into the build`);

    const robots = /<meta name="robots" content="([^"]+)"/.exec(html)?.[1] ?? '';
    if (!robots.includes('noindex')) indexable++;

    // Links and assets
    const ids = new Set([...html.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
    for (const match of html.matchAll(/<(a|link|img|script|source)\b[^>]*>/gi)) {
      const tag = match[0];
      const name = (match[1] ?? '').toLowerCase();
      const values = [attr(tag, 'href'), attr(tag, 'src'), ...(attr(tag, 'srcset') ?? '').split(',').map((part) => part.trim().split(/\s+/)[0])].filter(
        (v): v is string => typeof v === 'string' && v.length > 0,
      );
      if (name === 'img' && attr(tag, 'alt') === undefined) fail(`${where}: <img> without alt attribute: ${tag.slice(0, 120)}`);
      if (name === 'a' && attr(tag, 'href') === '') fail(`${where}: empty href`);
      for (const value of values) {
        if (value.startsWith('http://')) fail(`${where}: insecure http link ${value}`);
        if (value === '#') fail(`${where}: placeholder href="#"`);
        if (value.startsWith('#') && value.length > 1 && !ids.has(value.slice(1)) && value !== '#top') {
          fail(`${where}: anchor ${value} has no matching id on the page`);
        }
        if (value.startsWith('/') && !value.startsWith('//')) {
          const local = resolveInternal(value);
          if (local && !existsSync(local)) fail(`${where}: broken internal link ${value}`);
        }
      }
    }

    if (/\b(lorem ipsum|TODO|TBD|FIXME)\b/.test(html.replace(/<script[\s\S]*?<\/script>/g, ''))) warn(`${where}: contains placeholder text (TODO/TBD/lorem ipsum)`);
  }

  // Sitemap
  const sitemapFile = join(dist, 'sitemap-0.xml');
  if (!existsSync(join(dist, 'sitemap-index.xml')) || !existsSync(sitemapFile)) fail('sitemap missing');
  const sitemap = existsSync(sitemapFile) ? await readFile(sitemapFile, 'utf8') : '';
  const sitemapPaths = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1] ?? '/').pathname);
  for (const path of sitemapPaths) {
    const local = resolveInternal(path);
    if (local && !existsSync(local)) fail(`sitemap lists ${path}, which was not built`);
  }
  if (indexable === 0) {
    warn('every page is marked noindex (placeholder site URL, preview branch, or SITE_NOINDEX) — expected until SITE_URL is set');
  } else if (sitemapPaths.length !== indexable) {
    warn(`sitemap has ${sitemapPaths.length} URLs but ${indexable} pages are indexable`);
  }

  // Search index, RSS, robots
  const searchIndex = JSON.parse(await readFile(join(dist, 'search.json'), 'utf8')) as Array<{ u: string }>;
  for (const record of searchIndex) {
    const local = resolveInternal(record.u);
    if (local && !existsSync(local)) fail(`search.json links to ${record.u}, which was not built`);
  }
  const rss = await readFile(join(dist, 'rss.xml'), 'utf8');
  if (!rss.includes('<rss')) fail('rss.xml is not an RSS document');
  const robotsTxt = await readFile(join(dist, 'robots.txt'), 'utf8');
  if (!/User-agent:/i.test(robotsTxt)) fail('robots.txt is malformed');
  if (!existsSync(join(dist, '_headers'))) fail('_headers is missing from the build');

  // Drafts and hidden content must leave no trace.
  const hidden = [...content.lines, ...content.products, ...content.solutions, ...content.resources, ...content.legal].filter((entry) => !entry.isPublic);
  const textFiles = files.filter((file) => /\.(html|xml|json|txt|webmanifest|js)$/.test(file));
  const corpus = (await Promise.all(textFiles.map(async (file) => [file, await readFile(file, 'utf8')] as const))).filter(([, text]) => text.length > 0);
  for (const entry of hidden) {
    const local = resolveInternal(entry.url);
    if (local && existsSync(local)) fail(`hidden entry "${entry.id}" was built at ${entry.url}`);
    for (const [file, text] of corpus) {
      if (text.includes(`${entry.url}`) || text.includes(`"${entry.id}"`)) fail(`hidden entry "${entry.id}" is referenced in ${relative(dist, file)}`);
      // Fixture names are unique, so their names must not appear anywhere either.
      if (fixtures && entry.name && text.includes(entry.name)) fail(`hidden entry name "${entry.name}" appears in ${relative(dist, file)}`);
    }
  }
  for (const faq of content.faqs.filter((f) => !f.isPublic)) {
    for (const [file, text] of corpus) if (faq.name && text.includes(faq.name)) fail(`unpublished FAQ "${faq.id}" appears in ${relative(dist, file)}`);
  }

  // Weight report
  const assets = files.filter((file) => /\/_astro\/.*\.(js|css)$/.test(file.split(sep).join('/')));
  let jsGzip = 0;
  let cssGzip = 0;
  for (const file of assets) {
    const size = gzipSync(await readFile(file)).length;
    if (file.endsWith('.js')) jsGzip += size;
    else cssGzip += size;
  }
  const fontBytes = (await Promise.all(files.filter((f) => f.endsWith('.woff2')).map(async (f) => (await stat(f)).size))).reduce((a, b) => a + b, 0);
  if (jsGzip > 60_000) warn(`total JavaScript is ${(jsGzip / 1024).toFixed(1)} KB gzipped (budget 60 KB)`);
  if (cssGzip > 40_000) warn(`total CSS is ${(cssGzip / 1024).toFixed(1)} KB gzipped (budget 40 KB)`);

  console.log(`\nverify-build (${fixtures ? 'fixtures' : 'production'}): ${htmlFiles.length} pages, ${sitemapPaths.length} sitemap URLs, ${searchIndex.length} search records`);
  console.log(`  JS ${(jsGzip / 1024).toFixed(1)} KB gz · CSS ${(cssGzip / 1024).toFixed(1)} KB gz · fonts ${(fontBytes / 1024).toFixed(1)} KB`);
  console.log(`  hidden/draft entries checked: ${hidden.length}`);
  for (const message of warnings) console.log(`  ⚠ ${message}`);
  if (errors.length > 0) {
    console.error(`\n✖ ${errors.length} problem${errors.length === 1 ? '' : 's'}:`);
    for (const message of errors) console.error(`  ✖ ${message}`);
    process.exit(1);
  }
  console.log('  ✔ all checks passed\n');
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
