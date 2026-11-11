/**
 * Generates the default social sharing image (public/og/default.png, 1200×630)
 * from the site config, using the real brand fonts.
 *   npm run assets:og
 * Requires a Playwright Chromium (`npx playwright install chromium` once).
 * Re-run after changing the brand name or hero copy.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import siteInput from '../src/config/site.ts';
import { isPlaceholderUrl, parseSiteConfig } from '../src/lib/schemas/site.ts';

const site = parseSiteConfig(siteInput);
// Show the domain only once a real one is configured.
const domain = isPlaceholderUrl(process.env.SITE_URL ?? site.url) ? '' : new URL(process.env.SITE_URL ?? site.url).hostname.replace(/^www\./, '');
const root = new URL('../', import.meta.url);
const out = fileURLToPath(new URL('public/og/default.png', root));

const font = async (path: string) => (await readFile(fileURLToPath(new URL(`node_modules/${path}`, root)))).toString('base64');
const escapeHtml = (value: string) => value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

const FRAME =
  'M3 8.5v-4A1.5 1.5 0 0 1 4.5 3h4M15.5 3h4A1.5 1.5 0 0 1 21 4.5v4M21 15.5v4a1.5 1.5 0 0 1-1.5 1.5h-4M8.5 21h-4A1.5 1.5 0 0 1 3 19.5v-4';

async function main() {
  const [mona, geist] = await Promise.all([
    font('@fontsource-variable/mona-sans/files/mona-sans-latin-wght-normal.woff2'),
    font('@fontsource-variable/geist-mono/files/geist-mono-latin-wght-normal.woff2'),
  ]);

  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    @font-face { font-family: Mona; src: url(data:font/woff2;base64,${mona}) format('woff2'); font-weight: 200 900; }
    @font-face { font-family: Geist; src: url(data:font/woff2;base64,${geist}) format('woff2'); font-weight: 100 900; }
    * { box-sizing: border-box; margin: 0; }
    body { width: 1200px; height: 630px; background: #0d0c0b; color: #f2f0eb; font-family: Mona, sans-serif; position: relative; overflow: hidden; }
    .dots { position: absolute; inset: 0; background-image: radial-gradient(circle, rgba(242,240,235,.13) 1.2px, transparent 1.6px); background-size: 26px 26px;
      -webkit-mask-image: radial-gradient(ellipse 80% 70% at 75% 30%, #000 20%, transparent 75%); }
    .glow { position: absolute; inset: 0; background: radial-gradient(45% 55% at 85% 0%, rgba(251,132,53,.18), transparent 70%); }
    .frame { position: absolute; inset: 40px; border: 1px dashed rgba(242,240,235,.12); border-radius: 18px; }
    .content { position: absolute; inset: 88px 96px; display: flex; flex-direction: column; justify-content: space-between; }
    .brand { display: flex; align-items: center; gap: 16px; font-size: 34px; font-weight: 650; letter-spacing: -0.035em; }
    h1 { font-size: 78px; line-height: 0.98; font-weight: 640; letter-spacing: -0.042em; max-width: 900px; }
    .foot { display: flex; justify-content: space-between; align-items: center; font-family: Geist, monospace; font-size: 20px; letter-spacing: .06em; text-transform: uppercase; color: rgba(242,240,235,.6); }
    .dot { display: inline-block; width: 10px; height: 10px; border-radius: 50%; background: #fb8435; margin-right: 14px; }
  </style></head><body>
    <div class="dots"></div><div class="glow"></div><div class="frame"></div>
    <div class="content">
      <div class="brand">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="${FRAME}" stroke="#f2f0eb" stroke-width="2" stroke-linecap="round"/><rect x="7.75" y="7.75" width="8.5" height="8.5" rx="1.75" fill="#fb8435"/></svg>
        ${escapeHtml(site.name)}
      </div>
      <h1>${escapeHtml(site.hero.title)}</h1>
      <div class="foot"><span><span class="dot"></span>${escapeHtml(site.hero.eyebrow)}</span><span>${escapeHtml(domain)}</span></div>
    </div>
  </body></html>`;

  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await page.setContent(html, { waitUntil: 'load' });
  await page.evaluate(async () => {
    await document.fonts.ready;
  });
  await page.screenshot({ path: out, type: 'png' });
  await browser.close();
  console.log(`Wrote ${out}`);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
