# Roadmap

Prioritized by business value: what most directly moves the site from "ready"
to "earning", then what compounds over time. Each item lists the effort and
whether it needs new infrastructure.

## Now — launch blockers (cost: $0–11)

| # | Item | Why | Effort |
| --- | --- | --- | --- |
| 1 | Decide the public name, check trademark and domain, set `name` and `SITE_URL` | Indexing stays off until the URL is real | Low |
| 2 | Configure a contact channel (Formspree form and/or email) | Visitors currently have no way to reach you | Low |
| 3 | Write and publish privacy, terms and refund policies | Required before collecting data or selling | Medium |
| 4 | Choose which product lines launch (`visible`) and set honest statuses | First impression and focus | Low |
| 5 | Deploy to Cloudflare Pages; protect `main` with the CI check | Live site with a safety net | Low |

## Next — first revenue

| # | Item | Why | Effort |
| --- | --- | --- | --- |
| 6 | Launch the first product end to end (real screenshots, docs page, verified checkout, test purchase) | Proves the whole funnel | Medium |
| 7 | Turn on a newsletter provider | Converts "coming soon" interest into an audience you own | Low |
| 8 | Publish one free lead-magnet per launched line (checklist, template) | Earns trust and email sign-ups before people buy | Medium |
| 9 | Enable privacy-friendly analytics with checkout-click goals | Know which pages and offers convert | Low |
| 10 | Submit the sitemap to Google Search Console and Bing Webmaster Tools | Faster indexing | Low |
| 11 | Write the draft FAQ answers (refunds, client use, updates) | Removes purchase hesitation | Low |

## Then — growth

| # | Item | Why | Effort |
| --- | --- | --- | --- |
| 12 | Product comparison table for multi-tier products | Helps buyers pick the right license | Low |
| 13 | Social preview images per product/resource (generated at build time) | Better click-through when shared | Medium (adds satori/resvg) |
| 14 | Release notes / changelog collection with RSS | Shows momentum; existing customers see updates | Low |
| 15 | Customer quotes section — only with real, permissioned quotes (add a `testimonials` collection with source and consent fields) | Social proof without fabrication | Low |
| 16 | Bundles across lines and seasonal offers (provider coupons) | Higher order value | Low |
| 17 | Affiliate program via the checkout provider | Low-cost acquisition | Low |
| 18 | SEO content plan: one practical guide per solution task | Compounding organic traffic | Ongoing |

## Later — automation and scale

| # | Item | Why | Effort |
| --- | --- | --- | --- |
| 19 | Git-based CMS (e.g. Pages CMS, Decap, TinaCMS) on top of the existing content files | Edit products in a web UI, no code | Medium |
| 20 | Scheduled daily rebuild (deploy hook + GitHub Actions cron) | Scheduled resources publish themselves | Low |
| 21 | License keys + update delivery for WordPress plugins (provider APIs or Freemius) | Required for paid plugin updates | Medium–High |
| 22 | Provider webhooks → small Cloudflare Worker (stock, onboarding emails) | Less manual work per sale | Medium |
| 23 | Organization licensing flow (quote → invoice → seats) | Larger deals | Medium |
| 24 | Course delivery for Family Tech Safety (provider or course platform) | New product format | Medium |
| 25 | Localization of key pages | New markets | High |

## Ongoing hygiene

- Monthly: `npm outdated`, `npm audit`, update dependencies on a branch and let
  CI verify; check form and newsletter deliverability; review analytics.
- Each release: update product `updatedDate`/`version`, publish docs, run
  `npm run preflight`.
- Yearly: review policies, prices, license terms and the accessibility of new
  pages with a screen reader.
