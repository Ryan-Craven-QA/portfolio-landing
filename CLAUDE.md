# CLAUDE.md — working on this repository

Guidance for future Claude Code sessions (and any developer). Read this before
changing code.

## What this is

A static Astro 7 site for **RenewalTrail** (a working name, configurable in
`src/config/site.ts`): a single-product landing page for a planned tool that
helps small property-management companies track vendor document expiration
dates, renewal requests and follow-ups. The product is being **validated**
first (a spreadsheet Starter Kit, see STARTER_KIT_SPEC.md and
VALIDATION_PLAN.md); nothing is for sale.

Two homepage modes (`homepage` in site config):
- `'product'` (live): the landing page in `src/components/landing/`.
- `'portfolio'`: the original multi-product catalog homepage
  (`src/components/home/PortfolioHome.astro`). All product lines are hidden;
  catalog index pages (`/products/`, `/solutions/`, `/resources/`) are only
  built while they have public content.

There is no backend. Forms, analytics and (later) checkout are delegated to
external hosted providers and are **off until configured**.

## Non-negotiable rules

1. **Never fabricate.** No invented products, customers, testimonials, reviews,
   ratings, metrics, partnerships, certifications, contact details, legal text
   or prices. Placeholder content must never be presented as real.
2. **Visibility goes through `src/lib/visibility.ts` + `src/lib/catalog.ts`.**
   Pages must read content only via `getCatalog()` (never `getCollection()`
   directly). Hidden lines, draft products/resources/FAQs/legal pages must not
   be built, linked, indexed, searched or listed. Defaults are safe: hidden /
   draft unless explicitly published.
3. **A purchase button requires a verified checkout.** Use the `CheckoutAction`
   from `resolveOfferAction()` (`src/lib/commerce.ts`); render through
   `OfferAction.astro`. Never hand-roll a "Buy" link.
4. **Forms only with a real destination.** Contact/newsletter forms render only
   when a provider is configured in `src/config/site.ts`.
5. **Public-facing copy never mentions internal strategy**: income goals,
   "businesses" as a portfolio, the founder's employer, or revenue targets.
   Publicly they are "product lines".
6. **Keep JavaScript minimal.** Progressive enhancement only; every page must
   work without JS. No UI frameworks, no animation libraries.
7. **The repository is public.** Anything committed (drafts, docs) is visible
   on GitHub even if the site hides it. Never commit prospect lists,
   interview notes or anyone's contact details.
8. **Administrative tracking only.** RenewalTrail never verifies insurance,
   determines legal compliance or certifies vendor eligibility — no copy,
   status label or feature may say or imply it. `src/lib/claims.ts` is run
   over every built page by `verify-build` and fails the build on such claims
   (questions and negated sentences are allowed, so FAQs can say what it does
   *not* do). Don't weaken the rules to make a build pass; reword the copy.
9. **Nothing is for sale until a product is purchasable.** Prices are labelled
   "planned"; pricing buttons lead to early access. While no product is
   available, the claims guard also rejects "buy now"-style wording. Never
   describe unbuilt features (sign-in, automatic emails, AI extraction,
   document storage) as existing.
10. **Demo data is fictional and labelled.** `src/config/demo.ts` uses made-up
    vendors and people with relative dates; every place it appears says
    "fictional" and that nothing is saved or sent.

## Architecture

```
src/config/site.ts        → validated by src/lib/schemas/site.ts (pure Zod)
src/config/load.ts        → picks production vs fixture config (SITE_FIXTURES=1), loads .env
src/content.config.ts     → collections; schemas in src/lib/schemas/content.ts (pure Zod)
src/lib/visibility.ts     → pure visibility rules (unit tested, also used by scripts/)
src/lib/commerce.ts       → checkout verification, CTA decisions, price formatting (pure)
src/lib/catalog.ts        → THE content API: getCatalog() → lines, products, solutions,
                            resources, faqs, legal (view models with URLs and actions)
src/lib/routes.ts         → every internal URL (trailing slashes!)
src/lib/seo.ts            → JSON-LD builders (factual fields only)
src/lib/csp.ts            → third-party hosts for the CSP, derived from config
src/lib/search.ts         → client-side search scoring (pure, unit tested)
src/lib/renewals.ts       → renewal status rules + urgency sort (pure; the Starter Kit spec mirrors it)
src/lib/renewal-demo-view.ts → HTML for demo rows/cards (pure; used by server render AND client script)
src/lib/claims.ts         → claims guard used by verify-build (pure, unit tested)
src/lib/brand.ts          → brandify(): replaces {brand} in copy with site.name
src/config/landing.ts     → landing page copy and planned pricing ({brand} tokens)
src/config/demo.ts        → fictional demo data
src/config/copy.ts        → About/Contact/Help copy for both modes (+ portfolio home)
src/config/navigation.ts  → getNavigation(mode, sections); landingAnchors
src/components/landing/   → landing page sections (ProductLanding.astro composes them)
src/pages/                → routes; dynamic routes use getStaticPaths from getCatalog();
                            catalog indexes are [...index].astro so they can be skipped
src/scripts/              → small client modules (theme, nav, reveal, search, filters, forms)
scripts/                  → Node tooling: verify-build, preflight, generate-icons/og
tests/unit/               → node:test unit tests (run with Node type stripping)
tests/e2e/                → Playwright + axe against the FIXTURE builds: dist-fixtures/
                            (product mode, :4322) and dist-fixtures-portfolio/ (:4323,
                            portfolio.spec.ts only)
tests/fixtures/           → fixture content + site config covering every state
```

URL scheme: `/products/<line>/`, `/products/<line>/<product>/`,
`/solutions/<id>/`, `/resources/<id>/`, `/legal/<id>/`.

## Conventions

- **Pure modules** (`src/lib/*.ts` except `catalog.ts`, `src/config/site.ts`,
  `src/lib/schemas/*`) must not import Astro virtual modules, must use explicit
  `.ts` extensions in relative imports, and only erasable TypeScript syntax
  (no enums/namespaces/parameter properties) — `scripts/` and unit tests run
  them directly with Node's type stripping.
- Import Zod from `astro/zod` (Zod 4 API: `z.url()`, `z.email()`, …).
- Styling: Tailwind 4 utilities + tokens in `src/styles/global.css`. Use the
  semantic colors (`bg-canvas`, `text-ink-2`, `border-line`, `text-tone`…),
  never raw hex. Product-line color: set `style="--tone-h: <hue>"` on an
  element, then use `text-tone`, `bg-[var(--tone-soft)]`, etc.
- Copy: plain, specific, calm. No hype words ("revolutionize", "supercharge",
  "seamless", "cutting-edge"). Status always honest.
- Accessibility: one `<h1>` per page, labelled landmarks, visible focus, AA
  contrast in both themes (verified by axe in the e2e suite).
- Motion: `.enter` for small load-in elements (never the LCP headline),
  `.reveal` for scroll reveals; everything respects `prefers-reduced-motion`.

## Commands

```bash
npm run dev            # dev server
npm run dev:drafts     # dev server incl. drafts (DEV + MODE=drafts only)
npm run check          # astro check (0 errors expected)
npm run test:unit      # pure-logic tests
npm run build          # production build + scripts/verify-build.ts
npm run test:e2e       # fixture build + Playwright/axe (desktop + mobile)
npm run preflight      # launch readiness report
```

Run `npm run verify` before committing larger changes.

## Gotchas (Astro 7 / tooling specifics)

- **TypeScript 6, not 7.** `@astrojs/check` supports TS ^5 || ^6.
- **Fonts:** the `npm` font provider emits `file://` URLs that Astro's fallback
  generator cannot fetch, so fonts use the `local` provider pointing at the
  `@fontsource-variable/*` woff2 files (latin subset only, preloaded).
- **CSP:** Astro's `security.csp` writes a per-page `<meta>` CSP with hashes of
  every script/style it emits (including `is:inline`). Style *attributes* are
  allowed via `style-src-attr 'unsafe-inline'` (needed for `--tone-h`).
  Markdown uses Prism (class-based) instead of Shiki (inline styles).
  `frame-ancestors` and other header-only directives live in `public/_headers`.
- **`astro preview` is a per-project daemon.** Use `--ignore-lock` to run a
  second one (the fixture preview and Playwright do).
- **Draft preview** is gated on `import.meta.env.DEV && MODE === 'drafts'`;
  `astro build` always has `DEV=false`, so drafts can never reach a build.
- **Fixture builds** use `astro.fixtures.config.ts` → `dist-fixtures/` and a
  separate cache dir. `src/config/load.ts` imports the fixture config; static
  builds discard server code, so it never ships.
- Scoped `<style>` in `.astro` files outranks single utilities (attribute
  selector specificity) — use `!` utilities when overriding component styles.
- Playwright is pinned to 1.63.0 (matches the preinstalled browser in cloud
  sessions); `overrides` keeps `@axe-core/playwright` on the same core.

## Adding things (summary)

- Landing copy: `src/config/landing.ts` (use `{brand}`, not the name). FAQ:
  `src/content/faqs.yaml`. Run `npm run test:unit` — `tests/unit/landing.test.ts`
  runs all public copy through the claims guard.
- Status rules: change `src/lib/renewals.ts`, `tests/unit/renewals.test.ts`
  and STARTER_KIT_SPEC.md §5 together.
- Copy that depends on configuration (e.g. "Early access open") must check it:
  `canRegister()` in `src/lib/catalog.ts`.

- Product: copy `src/content/products/_template.md`; see CONTENT_MANAGEMENT.md.
- Product line: add an entry to `src/content/businesses.yaml` (glyph/art enums
  in `src/lib/schemas/content.ts`; new art needs a case in `LineArt.astro`).
- Page: create `src/pages/<name>.astro` using `BaseLayout` + `PageHeader`,
  add it to `src/config/navigation.ts` and `search.json.ts` if it should be
  discoverable, and to `tests/e2e/helpers.ts` `PUBLIC_ROUTES`.
- New third-party integration: add hosts in `src/lib/csp.ts`, a schema in
  `src/lib/schemas/site.ts`, and a unit test in `tests/unit/config.test.ts`.
