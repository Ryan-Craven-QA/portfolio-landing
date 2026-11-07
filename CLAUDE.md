# CLAUDE.md — working on this repository

Guidance for future Claude Code sessions (and any developer). Read this before
changing code.

## What this is

A static Astro 7 site: marketing pages plus a config-driven product catalog for
an independent studio with five product lines. There is no backend. Commerce,
forms, newsletter and analytics are delegated to external hosted providers and
are **off until configured**.

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
   on GitHub even if the site hides it.

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
src/pages/                → routes; dynamic routes use getStaticPaths from getCatalog()
src/scripts/              → small client modules (theme, nav, reveal, search, filters, forms)
scripts/                  → Node tooling: verify-build, preflight, generate-icons/og
tests/unit/               → node:test unit tests (run with Node type stripping)
tests/e2e/                → Playwright + axe against the FIXTURE build
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

- Product: copy `src/content/products/_template.md`; see CONTENT_MANAGEMENT.md.
- Product line: add an entry to `src/content/businesses.yaml` (glyph/art enums
  in `src/lib/schemas/content.ts`; new art needs a case in `LineArt.astro`).
- Page: create `src/pages/<name>.astro` using `BaseLayout` + `PageHeader`,
  add it to `src/config/navigation.ts` and `search.json.ts` if it should be
  discoverable, and to `tests/e2e/helpers.ts` `PUBLIC_ROUTES`.
- New third-party integration: add hosts in `src/lib/csp.ts`, a schema in
  `src/lib/schemas/site.ts`, and a unit test in `tests/unit/config.test.ts`.
