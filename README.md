# RenewalTrail — product website

The website for **RenewalTrail**, a planned tool that helps small property-management companies track vendor
document expiration dates, renewal requests and who is following up. It is a fast, static
[Astro](https://astro.build) site designed to cost nothing to run while the product is being validated.

> **"RenewalTrail" is a working name** until trademark and domain clearance is complete. Change `name` in
> `src/config/site.ts` and the whole site follows (copy uses a `{brand}` token). Set `nameCleared: true` once
> clearance is done.

> **Scope:** RenewalTrail is an administrative tracking tool. The site must never claim that it verifies
> insurance, determines legal compliance or certifies vendor eligibility. A build-time claims guard enforces this.

## What's inside

- **Single-product landing page** built around the headline "Know what expires next—and who's following up":
  the problem, the proposed solution, an interactive demo, features, how it works, who it's for, planned
  pricing, FAQ, early-access registration and contact.
- **Interactive demo** with clearly labelled **fictional** vendors, people and dates (relative to today, so it
  never goes stale): filter by view, owner and search, sort, and try "Mark request sent", "Log follow-up",
  "Mark received" and "Record new date". It runs entirely in the browser; nothing is saved or sent.
- **Real conversion, not a fake checkout:** the early-access / interview form posts straight to Formspree or
  Web3Forms and lands in your inbox. It appears only once a provider is configured; until then the page
  honestly says registration opens soon (or offers a prefilled email if you set an address).
- **Nothing is for sale:** pricing is labelled "planned" and every pricing button leads to early access. The
  Starter Kit exists only as a draft product and a specification ([STARTER_KIT_SPEC.md](STARTER_KIT_SPEC.md)).
- **Extensible:** the original multi-product catalog (product lines, products, solutions, resources, verified
  checkout links) is still here, switched off. Set `homepage: 'portfolio'` and publish product lines to bring
  it back; navigation only ever links to sections that have public content.
- **Fast and private by default:** about 13 KB of JavaScript and 15 KB of CSS (gzipped), self-hosted fonts,
  no cookies, no analytics until you enable a privacy-friendly provider, and a strict Content-Security-Policy.
- **Quality gates:** type checks, unit tests, a build verifier (metadata, links, draft leaks and forbidden
  claims), and Playwright end-to-end + axe accessibility tests on desktop and mobile, in both themes.

## Quick start

Requirements: **Node.js 22.23.4 or newer** (see `.node-version`) and npm.

```bash
npm install
```

```bash
npm run dev
```

Open <http://localhost:4321>. To also see drafts and hidden product lines (never possible in a build):

```bash
npm run dev:drafts
```

## Make the early-access form work

1. Create a free form at [formspree.io](https://formspree.io) (or an access key at [web3forms.com](https://web3forms.com)).
2. In `src/config/site.ts`, set `contact.form` to `{ provider: 'formspree', formId: 'yourFormId' }`.
3. Optional: create a free 20-minute event on [cal.com](https://cal.com) and set `earlyAccess.bookingUrl`.
4. Restart `npm run dev`, submit a test registration, and confirm it arrives in your inbox.

See [DEPLOYMENT.md](DEPLOYMENT.md#required-external-configuration) for the full list.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Local dev server with hot reload |
| `npm run dev:drafts` | Dev server that also shows drafts and hidden lines (marked with a banner) |
| `npm run build` | Production build to `dist/`, then verifies the output (including the claims guard) |
| `npm run preview` | Serve the production build locally |
| `npm run check` | TypeScript + Astro diagnostics |
| `npm run test:unit` | Unit tests (Node's built-in test runner) |
| `npm run test:e2e` | Builds both fixture sites and runs Playwright + axe tests |
| `npm run preview:fixtures` | Browse the fixture site (every state, form configured) at :4322 |
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
src/config/site.ts           Brand, homepage mode, contact form, booking link, disclaimer, legal links
src/config/landing.ts        Landing page copy: problem, features, how it works, audience, planned pricing
src/config/demo.ts           Fictional demo data (vendors, people, documents)
src/config/copy.ts           About, Contact and Help page copy (+ the optional portfolio homepage)
src/config/navigation.ts     Navigation for both homepage modes
src/content/faqs.yaml        FAQ (shown on the landing page and the Help page)
src/content/products/        Products; the Starter Kit is a draft here
src/content/businesses.yaml  Product lines (all hidden in single-product mode)
src/lib/renewals.ts          Renewal status rules (shared by the demo and the Starter Kit spec)
src/lib/claims.ts            Claims guard: wording the site must never use
src/components/landing/      Landing page sections
src/components/forms/        Early-access and contact forms
scripts/                     Build verification, preflight, asset generators
tests/                       Unit tests, Playwright tests, fixture content
```

## Documentation

| Document | Read it when you want to… |
| --- | --- |
| [STARTER_KIT_SPEC.md](STARTER_KIT_SPEC.md) | see exactly what the Starter Kit would contain and how it would work |
| [VALIDATION_PLAN.md](VALIDATION_PLAN.md) | run the 14-day validation: 10–15 conversations, 2 paid commitments |
| [DEPLOYMENT.md](DEPLOYMENT.md) | compare free hosting options and set up the required external services |
| [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) | check everything before going live |
| [CONTENT_MANAGEMENT.md](CONTENT_MANAGEMENT.md) | edit landing copy, the demo, FAQs, or add products later |
| [MONETIZATION.md](MONETIZATION.md) | take founding pre-orders and, later, sell through a verified checkout |
| [DESIGN_SYSTEM.md](DESIGN_SYSTEM.md) | change colors, type, components or motion |
| [ROADMAP.md](ROADMAP.md) | see what comes after validation |
| [CLAUDE.md](CLAUDE.md) | understand the architecture and conventions (for AI sessions and developers) |

## Tech stack

Astro 7 (static output) · TypeScript 6 · Tailwind CSS 4 · MDX · Zod schemas · self-hosted Mona Sans and
Geist Mono (SIL Open Font License) · Playwright and axe-core for testing. Hosting: Cloudflare Pages
(free plan) or any static host.
