# Plainwork — studio website

The marketing site and product catalog for an independent studio that makes
practical software, WordPress plugins, templates, toolkits and plain-language
guides. It is a fast, static [Astro](https://astro.build) site designed to cost
nothing to run until there is something to sell.

> **"Plainwork" is a working name.** Change it in one place —
> `src/config/site.ts` — and the whole site follows.

## What's inside

- **Pages:** home, product catalog (search, filters, sorting), product line
  pages, product detail pages, solutions (organized by customer problem), a
  searchable resource library (Markdown/MDX), about, contact, support/FAQ,
  legal pages, RSS feed, sitemap, robots.txt and a custom 404.
- **Config-driven catalog:** product lines, products, solutions, resources and
  FAQs are content files validated at build time. Nothing is public until you
  say so: lines default to hidden, products and resources default to drafts.
- **Honest commerce:** purchase buttons appear only for available products
  whose checkout link is `https` on a verified provider (Gumroad, Stripe
  Payment Links, Lemon Squeezy, Paddle, Polar, Payhip, or a host you allow).
  Everything else shows a clear "not available" state.
- **No backend:** contact and newsletter forms post straight to Formspree /
  Web3Forms / Buttondown / Kit — and only appear once configured. Until then
  the site offers email links and an RSS feed instead.
- **Fast and private by default:** ~7 KB of JavaScript and ~14 KB of CSS
  (gzipped) site-wide, self-hosted fonts, no cookies, no analytics until you
  enable a privacy-friendly provider, and a strict Content-Security-Policy.
- **Quality gates:** type checks, unit tests, a build verifier (metadata,
  links, leaks of drafts), and Playwright end-to-end + axe accessibility tests
  on desktop and mobile, in both themes.

## Quick start

Requirements: **Node.js 22.23.4 or newer** (see `.node-version`) and npm.

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:4321>. To also see drafts and hidden product lines
(never possible in a build):

```bash
npm run dev:drafts
```

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run dev:drafts` | Dev server that also shows drafts and hidden lines (marked with a banner) |
| `npm run build` | Production build to `dist/`, then verifies the output |
| `npm run preview` | Serve the production build locally |
| `npm run check` | TypeScript + Astro diagnostics |
| `npm run test:unit` | Unit tests (Node's built-in test runner) |
| `npm run test:e2e` | Builds the fixture site and runs Playwright + axe tests |
| `npm run preview:fixtures` | Browse the fixture site (every product/pricing state) at :4322 |
| `npm run preflight` | Launch-readiness report (add `-- --strict` to fail on blockers) |
| `npm run assets:og` | Regenerate the social sharing image from the site config |
| `npm run assets:icons` | Regenerate favicons and app icons |
| `npm run verify` | Everything: check, unit, build, e2e |

The first time you run end-to-end tests on a new machine, install the browser:

```bash
npx playwright install chromium
```

## Where things live

```
src/config/site.ts          Brand, URL, contact, newsletter, analytics, legal links
src/config/copy.ts          Editable marketing copy (principles, about page)
src/config/navigation.ts    Main navigation
src/content/businesses.yaml Product lines (visibility, status, colors)
src/content/products/       One Markdown file per product (+ _template.md)
src/content/solutions.yaml  Problem-oriented solutions
src/content/resources/      Guides, tutorials, downloads, documentation
src/content/faqs.yaml       Support FAQ
src/content/legal/          Privacy, terms, refunds (unpublished until you write them)
src/assets/products/        Product images (optimized automatically)
public/downloads/           Free downloadable files
src/lib/                    Catalog, visibility rules, commerce rules, SEO, search
src/components/, src/pages/ UI and routes
scripts/                    Build verification, preflight, asset generators
tests/                      Unit tests, Playwright tests, fixture content
```

## Documentation

| Document | Read it when you want to… |
| --- | --- |
| [CONTENT_MANAGEMENT.md](CONTENT_MANAGEMENT.md) | add a product, product line, resource or FAQ |
| [MONETIZATION.md](MONETIZATION.md) | connect checkout providers and plan revenue features |
| [DEPLOYMENT.md](DEPLOYMENT.md) | publish on Cloudflare Pages for free |
| [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) | check everything before going live |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | change colors, type, components or motion |
| [ROADMAP.md](ROADMAP.md) | see what to build next, by value |
| [CLAUDE.md](CLAUDE.md) | understand the architecture and conventions (for AI sessions and developers) |

## Tech stack

Astro 7 (static output) · TypeScript 6 · Tailwind CSS 4 · MDX · Zod schemas ·
self-hosted Mona Sans and Geist Mono (SIL Open Font License) · Playwright and
axe-core for testing. Hosting: Cloudflare Pages (free plan).
