---
# ─────────────────────────────────────────────────────────────────────────────
#  PRODUCT TEMPLATE — copy this file to `src/content/products/<product-id>.md`.
#  The file name becomes the product id and URL: /products/<line-id>/<product-id>/
#  Files starting with "_" are ignored, so this template is never published.
#
#  Images: put them in src/assets/products/<product-id>/ and reference them
#  with a path relative to THIS file, e.g. ../../assets/products/my-tool/cover.png
#  Astro optimizes them automatically (responsive sizes, modern formats).
# ─────────────────────────────────────────────────────────────────────────────

name: Example Product
# Product line id from src/content/businesses.yaml
business: templates-and-tools
# web-app | desktop-app | wordpress-plugin | automation | ai-workflow | template |
# spreadsheet | calculator | toolkit | checklist | guide | course | bundle
type: spreadsheet
summary: One or two sentences that say what it does and who it is for. Shown on cards and in search results.
tagline: Optional headline for the product page.

# draft → not built anywhere. public → listed, searchable, in the sitemap.
# (A public product of a hidden product line stays hidden.)
visibility: draft
# available | early-access | coming-soon | unavailable
availability: coming-soon

featured: false
featuredOrder: 100
# releaseDate: 2026-12-01
# updatedDate: 2026-12-15
# version: "1.0"

# ── Pricing ──────────────────────────────────────────────────────────────────
# One entry per purchase option. A Buy/Subscribe button appears ONLY when the
# product is available and `checkoutUrl` is https on a verified host
# (Gumroad, Stripe Payment Links, Lemon Squeezy, Paddle, Polar, Payhip, or a
# host you add in site config). Otherwise the button is replaced with an honest
# "Checkout not yet available" state.
#
# price: 49    → $49   | price: 0 → free | price: null → "Contact us for pricing"
# billing: one-time | monthly | yearly
# license: personal | commercial | team | organization | agency
offers: []
#  - id: standard
#    label: Standard
#    price: 29
#    billing: one-time
#    license: personal
#    checkoutUrl: https://yourname.gumroad.com/l/example
#    features:
#      - Lifetime access to this version
#      - Setup guide included
#  - id: team
#    label: Team
#    price: 9
#    billing: monthly
#    license: team
#    scope: Up to 10 people
#    checkoutUrl: https://buy.stripe.com/xxxxxxxxxxxx
#    recommended: true
#    note: Billed monthly. Cancel from the link in your receipt.
#  - id: free
#    label: Free edition
#    price: 0
#    downloadUrl: /downloads/example-free.pdf   # file in public/downloads/

# ── Details ──────────────────────────────────────────────────────────────────
includes: []
#  - XLSX and Google Sheets versions
#  - Step-by-step setup guide (PDF)
highlights: []
#  - title: Built for one job
#    body: Short explanation of a concrete benefit.
requirements: []
#  - Microsoft Excel 2019 or newer, or Google Sheets
formats: []
#  - XLSX

# cover:
#   src: ../../assets/products/example-product/cover.png
#   alt: Describe what the image shows
screenshots: []
#  - src: ../../assets/products/example-product/screen-1.png
#    alt: Describe what the screenshot shows
#    caption: Optional caption

links: {}
#  documentation: /resources/example-product-docs/
#  support: /contact/?topic=support#contact-form
#  changelog: https://...
#  demo: https://...

# For bundles (type: bundle): ids of the products included
bundleIncludes: []
related: []
tags: []
faqs: []
#  - question: Does it work on a Mac?
#    answer: Yes — ...

# seo:
#   title: Optional custom page title (max 70 characters)
#   description: Optional custom meta description (50–170 characters)
---

The body is the long description on the product page. Write it in Markdown:
what problem it solves, how it works, and who it is for. Keep claims factual —
describe what the product does, not results you cannot back up.
