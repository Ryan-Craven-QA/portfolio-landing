# Content management

Everything visitors see comes from a few files. You never edit page templates to change copy, prices,
the demo or the FAQ.

## The RenewalTrail landing page (single-product mode)

| What | Where |
| --- | --- |
| Brand name, headline, intro, disclaimer, form, booking link | `src/config/site.ts` (`name`, `hero`, `disclaimer`, `contact.form`, `earlyAccess`) |
| Problem, solution, features, how it works, audience, planned pricing, registration copy | `src/config/landing.ts` |
| Demo vendors, people and documents (fictional) | `src/config/demo.ts` |
| FAQ (landing page and Help page) | `src/content/faqs.yaml` |
| About, Contact and Help page copy | `src/config/copy.ts` |

Rules for every edit:

- **Write `{brand}` instead of the name.** It is replaced with `name` from `site.ts`, so renaming is one change.
- **Administrative tracking only.** Never write that RenewalTrail verifies insurance, ensures compliance or
  certifies vendors. Saying what it does *not* do is fine. The build fails on forbidden claims and prints
  the sentence to fix.
- **Nothing is for sale yet.** Keep prices labelled "planned"; don't add "buy now", "available now",
  "free trial" or sign-in wording (also enforced by the build).
- **Demo data stays fictional.** Use made-up names, keep the "Fictional" labels, and store dates as
  `expiresIn` (days from today) so the demo never goes stale. Each document's `owner` must be a person id
  from `demoPeople`. `npm run test:unit` checks this.
- After changing the headline or name, run `npm run assets:og` to refresh the social sharing image.

Preview your edits with `npm run dev`, then run `npm run test:unit` (copy and demo checks) and
`npm run build` (claims guard, links).

### Planned pricing

Each plan in `landing.pricing.plans` has a `stage` (e.g. "First release · in development"), a planned
`price` or `priceRange`, `billing`, an optional `founding` price, what it `includes`, and a `cta` whose
`intent` preselects the matching option on the early-access form. The free interview plan also has
`stageWhenClosed`, which is shown instead of "Open now" until a form or email is configured.

When the Starter Kit is ready to sell, follow LAUNCH_CHECKLIST.md part B. Purchases always go through a
published product with a verified checkout (below), never a link typed into the landing copy.

### FAQ

`src/content/faqs.yaml`: each entry has `question`, `answer` (Markdown), `category`
(`general`, `products`, `purchasing`, `support`) and `status`. Only `published` entries appear. The landing
page shows all of them; the Help page groups them by category.

---

## The catalog (multi-product mode, currently hidden)

The original catalog is still here for future products. In single-product mode every product line is hidden,
so catalog pages aren't built. The Starter Kit already exists as a **draft** product
(`src/content/products/renewaltrail-starter-kit.md`) under the hidden `renewaltrail` line.

| What | Where |
| --- | --- |
| Brand, URL, contact, newsletter, analytics, legal links | `src/config/site.ts` |
| Portfolio homepage copy, principles | `src/config/copy.ts` |
| Product lines (all hidden in single-product mode) | `src/content/businesses.yaml` |
| Products | `src/content/products/<product-id>.md` |
| Product images | `src/assets/products/<product-id>/` |
| Solutions (problem-oriented pages) | `src/content/solutions.yaml` |
| Guides, tutorials, downloads, docs | `src/content/resources/<id>.md` or `.mdx` |
| Downloadable files | `public/downloads/` |
| Support FAQ | `src/content/faqs.yaml` |
| Privacy, terms, refunds | `src/content/legal/*.md` |

Everything is validated when you run `npm run dev` or `npm run build`. A typo
such as an unknown product line, an `http://` checkout link or a missing field
stops the build with a message that names the file and field.

## Safe by default

Nothing becomes public by accident:

- a product line is hidden unless `visible: true`;
- a product is a draft unless `visibility: public` — and it stays hidden while
  its product line is hidden;
- a resource, FAQ or legal page is a draft unless `status: published`;
- a resource with a future `publishDate` stays hidden until a build after
  that date.

Hidden and draft entries are not built at all: no page, no link, no search
result, no sitemap or RSS entry. `npm run build` re-checks this on every build.

**Preview drafts locally** (never possible in a production build):

```bash
npm run dev:drafts
```

Draft items appear with a red "Draft"/"Hidden" badge and a banner explains the
mode.

> The GitHub repository is public, so draft files are readable there even
> though the website hides them. Make the repository private if that matters
> (Cloudflare Pages works with private repositories).

---

## Product lines

Each entry in `src/content/businesses.yaml` is one product line.

```yaml
- id: wordpress-plugins          # URL: /products/wordpress-plugins/
  name: WordPress Plugins
  tagline: Practical utilities for running and maintaining WordPress sites.
  description: >-
    Longer description shown on the product line page.
  visible: true                  # false → hidden everywhere, with all its products
  status: in-development         # exploring | in-development | coming-soon | early-access | available
  order: 20                      # sort order
  hue: 200                       # accent colour (0–360 on the OKLCH wheel)
  glyph: plug                    # flow | plug | calendar | grid | shield
  art: plugin-toggles            # document-fields | plugin-toggles | calendar-grid | file-stack | message-check
  audience: Site owners, administrators, and agencies    # optional
  disclaimer: Optional notice shown on the line and its product pages.
  examples:                      # the kinds of products this line offers (not listings)
    - Document inventory and management
```

**Show or hide a line:** change `visible`. **Launch with a single line:** set
`visible: false` on all the others — the homepage switches to a single wide
card and every page adapts.

**Status badge:** anything other than `available` shows a badge
("In development", "Coming soon", "Early access"…), so a line is never
presented as operational before it is.

**Add a new line:** add an entry with a new `id`, pick a `hue` that differs
from the others by at least ~40°, and reuse an existing `glyph` and `art`.
(New glyphs live in `src/components/brand/LineGlyph.astro`; new illustrations
in `src/components/home/LineArt.astro` — add the name to the lists in
`src/lib/schemas/content.ts` too.) Then add the line to a solution in
`src/content/solutions.yaml` if it solves one.

---

## Adding a product (one file + its images)

1. **Copy the template.** Duplicate `src/content/products/_template.md` to
   `src/content/products/<product-id>.md`. The file name is the product's
   id and URL: `/products/<line-id>/<product-id>/`. Use lowercase and hyphens.
2. **Fill in the basics:** `name`, `business` (the product line id), `type`,
   `summary` (shown on cards and in search), optional `tagline`.
3. **Add images (optional).** Put them in `src/assets/products/<product-id>/`
   and reference them relative to the Markdown file:

   ```yaml
   cover:
     src: ../../assets/products/<product-id>/cover.png
     alt: What the image shows
   screenshots:
     - src: ../../assets/products/<product-id>/settings.png
       alt: The settings screen with three sync options
       caption: Optional caption
   ```

   Images are resized and converted to modern formats automatically. Without
   a cover, the site draws a typographic cover in the line's colours — it
   never fakes a screenshot. A 1600×1200 (4:3) cover works best; it is also
   cropped to 1200×630 for social sharing.
4. **Add pricing** (see below). Leave `offers: []` until prices are decided —
   the page then says "Pricing will be announced at launch."
5. **Write the description** in the Markdown body: what it does, how it works,
   who it is for. Add `includes`, `highlights`, `requirements`, `formats`,
   `faqs` and `links.documentation` as needed.
6. **Preview** with `npm run dev:drafts`.
7. **Publish:** set `visibility: public` and the right `availability`:

   | availability | Meaning | Purchase button |
   | --- | --- | --- |
   | `coming-soon` | Announced, not released | Never — shows "Coming soon" + notify link |
   | `early-access` | Usable early version | Yes, if checkout is verified |
   | `available` | Released | Yes, if checkout is verified |
   | `unavailable` | Temporarily or permanently withdrawn | Never |

8. Run `npm run build`, commit and push. Cloudflare deploys automatically.

### Pricing options (`offers`)

Each product can have several offers — e.g. personal, team and agency, or
monthly and yearly.

```yaml
offers:
  - id: personal                 # unique within the product
    label: Personal
    price: 29                    # 29 = $29 · 0 = free · null = "Contact us for pricing"
    billing: one-time            # one-time | monthly | yearly
    license: personal            # optional: personal | commercial | team | organization | agency
    scope: 1 site                # optional, e.g. "Up to 5 sites"
    checkoutUrl: https://you.gumroad.com/l/thing
    recommended: false           # highlights this offer when there are several
    features: [Lifetime updates for 1.x, Email support]
    note: Optional small print in your own words.
    ctaLabel: Optional custom button text
```

**Checkout links must be verified.** A Buy/Subscribe button appears only when
the product is available (or early access) **and** `checkoutUrl` is `https`
on one of: `*.gumroad.com`, `buy.stripe.com`, `checkout.stripe.com`,
`*.lemonsqueezy.com`, `pay.paddle.io`, `buy.paddle.com`, `polar.sh`,
`buy.polar.sh`, `payhip.com` — or a host you add to
`checkout.extraAllowedHosts` in `src/config/site.ts` (for example a custom
Stripe or Gumroad domain). Otherwise the page shows "Checkout not yet
available" and `npm run build` prints a warning. Plain `http://` links are
rejected outright.

The button label follows the offer: "Buy now", "Buy license", "Subscribe",
"Buy annual license" — or your `ctaLabel`. Under each button the page says
"Secure checkout on Gumroad" (or the provider you used).

### Common setups

**Free download (lead magnet).** Put the file in `public/downloads/` and:

```yaml
offers:
  - id: free
    label: Free
    price: 0
    downloadUrl: /downloads/family-safety-checklist.pdf
```

To collect emails in exchange, create a $0 product on Gumroad/Payhip (or a
form in your newsletter tool) and use that URL as `checkoutUrl` instead.

**Subscription.** Create a recurring price in Stripe and a Payment Link
(`https://buy.stripe.com/...`), then use `billing: monthly` or `yearly`.

**Annual license** (common for plugins): `billing: yearly` with a `license`
and a `scope` such as "1 site" / "5 sites" / "Unlimited sites".

**Organization / agency licensing.** Add an offer with
`license: organization` or `agency`. If you quote individually, use
`price: null` — the button becomes "Contact us for pricing" and opens the
contact form with the product preselected.

**Bundle.** A product with `type: bundle` and the included product ids:

```yaml
type: bundle
bundleIncludes: [project-pricing-calculator, admin-calendar-toolkit]
```

**Feature on the homepage:** `featured: true` (order with `featuredOrder`).
Up to three featured products show; with none, the homepage shows an honest
"first releases are on the workbench" panel instead.

**Retire a product:** `availability: unavailable` keeps the page (useful for
existing customers and documentation); `visibility: draft` removes it.

---

## Solutions

`src/content/solutions.yaml` groups product lines around customer problems.
Each solution lists `businesses` (product line ids), a `problem`, an
`approach`, and `tasks` — short phrases that also power the homepage task
finder. A solution is shown only while at least one of its lines is visible.
All public products of those lines appear on the solution page automatically;
list ids under `products` to pin a specific selection instead.

## Resources (guides, tutorials, downloads, documentation)

Create `src/content/resources/<id>.md` (or `.mdx` to use components):

```markdown
---
title: How to …
description: One or two sentences (50–200 characters) for cards and search.
type: guide                # tutorial | guide | article | download | documentation
status: published          # draft until you are ready
publishDate: 2026-12-01    # future date = scheduled (appears on the first build after it)
updatedDate: 2026-12-15    # optional
business: family-tech-safety   # optional: hides the resource while that line is hidden
products: [family-scam-defense-guide]  # optional related products (public ones are shown)
tags: [scams, family]
download:                  # optional
  label: Printable checklist
  href: /downloads/checklist.pdf   # file in public/downloads/, or an https URL
  format: PDF
  size: 120 KB
---

Your content in Markdown. `## Headings` build the "On this page" menu.
```

**Product documentation:** use `type: documentation`, then point the product
at it with `links: { documentation: /resources/<id>/ }`. The support page and
footer link to documentation automatically once it exists.

**Scheduled publishing:** future `publishDate`s publish on the first build
after that date. Static sites only rebuild when something triggers them —
see "Scheduled rebuilds" in DEPLOYMENT.md.

## FAQs

`src/content/faqs.yaml` feeds the support page (and the top of the contact
page). Answers are plain text; separate paragraphs with a blank line and add
an optional `link`. Three draft questions (refunds, client work, updates) are
waiting for answers that only you can give — publish them once written.

## Legal pages

`src/content/legal/privacy.md`, `terms.md` and `refunds.md` are unpublished
placeholders. Replace the text with your own policies (written by you, a
generator you trust, or a professional) and set `status: published`. Published
pages appear at `/legal/<id>/` and in the footer. Hosted policies work too: set
`legal.privacyUrl` / `termsUrl` / `refundsUrl` in `src/config/site.ts`.

## Site settings (`src/config/site.ts`)

- **Brand:** `name`, `legalName`, `tagline`, `description`, `hero`.
- **URL:** `url`, or the `SITE_URL` environment variable (recommended in
  Cloudflare Pages). While it is a placeholder every page is `noindex`.
- **Contact:** `contact.general` / `support` / `business` email addresses
  and/or `contact.form` (`formspree` with a form id, or `web3forms` with an
  access key). Nothing appears until set.
- **Newsletter:** `buttondown` (username), `kit` (form id) or `custom`
  (any HTML embed form). Without one, the site offers the RSS feed.
- **Analytics:** `cloudflare`, `plausible` or `umami` (all cookieless). Off by
  default. The Content-Security-Policy updates automatically.
- **Social profiles, founder profile, legal links, extra checkout hosts.**

After changing the brand name or hero copy, regenerate the sharing image:

```bash
npm run assets:og
```

## Publishing workflow

1. Edit the files above (directly on GitHub or locally).
2. Check locally: `npm run dev` (or `npm run dev:drafts`).
3. Run `npm run build` — it fails loudly on mistakes.
4. Commit and push. Cloudflare Pages builds and deploys in about a minute.
5. Before the first launch, run `npm run preflight` and work through
   [LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md).
