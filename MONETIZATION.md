# Monetization

The site sells through **hosted checkout pages** — Gumroad, Stripe Payment
Links, Lemon Squeezy, Paddle, Polar, Payhip, or a storefront domain you allow.
Payment details are entered on the provider's page, never on this site. There
is no custom payment processing, subscription backend or customer database to
build, secure or maintain.

## Guarantees built into the site

- A purchase button appears **only** when the product is `available` (or
  `early-access`) **and** the offer's `checkoutUrl` is `https` on a verified
  host (`src/lib/commerce.ts`). Otherwise visitors see "Coming soon",
  "Checkout not yet available" or "Contact us for pricing" — never a button
  that goes nowhere.
- `http://` checkout links fail the build; unknown hosts are refused unless you
  add them to `checkout.extraAllowedHosts`.
- `npm run build` warns, and `npm run preflight` blocks launch, when a public,
  available product has no working checkout or download.
- Product structured data (for search engines) is emitted only for products
  that are actually purchasable, with their real prices.
- Every purchase button carries `data-checkout="<provider>"`, ready for
  click tracking if you add analytics goals later.

## Supported revenue types

| Revenue type | How to set it up (`offers` in the product file) |
| --- | --- |
| One-time digital purchase | `price: 29`, `billing: one-time`, `checkoutUrl` from Gumroad/Payhip/Polar/Lemon Squeezy/Stripe |
| Monthly subscription | `billing: monthly` with a Stripe Payment Link (recurring price) or a Paddle/Polar/Lemon Squeezy subscription link |
| Annual license | `billing: yearly`, `license: personal \| team \| agency`, `scope: "1 site"` |
| Product bundle | a product with `type: bundle` and `bundleIncludes: [...]`, priced like any other |
| Free lead-generation resource | `price: 0` + `downloadUrl: /downloads/file.pdf`, or a $0 product on Gumroad/Payhip to capture emails |
| Organization / agency license | an offer with `license: organization` or `agency`; `price: null` turns it into "Contact us for pricing" |

Step-by-step examples are in [CONTENT_MANAGEMENT.md](CONTENT_MANAGEMENT.md#pricing-options-offers).

## Choosing a checkout provider

Fees and policies change often. The figures below were gathered from the
providers' own sites in November 2026 — **confirm them before you sign up.**

| Provider | Fees (summary) | Merchant of record? | Good for |
| --- | --- | --- | --- |
| **Gumroad** | 10% + $0.50 per direct sale (30% on sales through its Discover marketplace); check whether card/PayPal processing is added on top | Yes, since Jan 2025 — handles sales tax and VAT | Templates, guides, toolkits, simple downloads, $0 lead magnets |
| **Stripe Payment Links** | 2.9% + $0.30 (US cards); +1.5% international cards; +1% currency conversion. Subscriptions add Stripe Billing (0.7%). Stripe Tax 0.5% per transaction | No by default; **Stripe Managed Payments** (merchant of record) is available since Apr 2026 for +3.5% | Subscriptions and software; lowest fees if you handle tax yourself |
| **Lemon Squeezy** | 5% + $0.50 (+1.5% international, +1.5% PayPal, +0.5% subscriptions) | Yes | Software licenses with license keys. Owned by Stripe; its January 2026 update describes a move onto Stripe Managed Payments — check its status first |
| **Paddle** | 5% + $0.50, all-inclusive | Yes | Software subscriptions; hosted checkout needs Paddle's approval |
| **Polar** | Free plan: 5% + $0.50 (+1.5% non-US cards); lower rates on paid plans | Yes | Software, licenses, digital downloads |
| **Payhip** | Free plan: 5% per sale + Stripe/PayPal fees; Plus $29/mo (2%); Pro $99/mo (0%) | Partly — handles EU/UK VAT and US sales tax as a marketplace facilitator | Downloads, courses, memberships |

**Merchant of record (MoR)** means the provider is the legal seller: it
calculates, collects and remits sales tax and VAT worldwide, and handles
invoices and many chargebacks. For a small studio selling digital products to
customers in many countries, an MoR usually saves far more effort than its
extra fee costs. This is not tax advice — confirm your obligations with an
accountant.

### A sensible starting setup

- **Templates, toolkits, guides, family resources:** Gumroad or Payhip — they
  host the files and deliver downloads after payment.
- **WordPress plugins (annual licenses, updates):** an MoR with license keys
  (Lemon Squeezy, Paddle or Polar). WordPress-specific platforms such as
  Freemius also handle licensing and in-dashboard updates — evaluate their
  current terms.
- **Operations software (subscriptions):** Paddle or Polar (MoR), or Stripe
  Payment Links plus the Stripe customer portal if you handle tax.
- **Organization licenses:** start with "Contact us for pricing" and invoice
  through your provider; add a fixed-price tier once demand is clear.

Use **one provider per product type** at first; the site supports mixing them.

## Delivery and customer experience

- **Downloads and license keys** are delivered by the checkout provider
  (email + receipt page). Free resources are served from `/downloads/`.
- **Receipts, refunds, cancellations** happen in the provider's dashboard and
  customer portal. Make sure your published refund policy matches the
  provider's settings.
- **Support:** product pages link to documentation and to the contact form
  with the product preselected (`/contact/?topic=support&product=<id>`).

## Before taking the first payment

- [ ] Product is `visibility: public`, `availability: available`
- [ ] Every offer has a verified `checkoutUrl` (or a working download)
- [ ] Test purchase completed in the provider's test mode, then live
- [ ] Delivery email, file/license key and receipt checked
- [ ] Refund policy and terms (including license terms) published
- [ ] Tax settings reviewed in the provider (MoR or your own registrations)
- [ ] `npm run preflight -- --strict` passes

## Future capabilities (when there is demand)

The static architecture leaves room to grow without a rewrite:

| Capability | Path |
| --- | --- |
| License validation / update server for plugins | Provider license-key APIs, or a small Cloudflare Worker (free tier) that validates keys |
| Webhook automation (e.g. mark sold out, send onboarding) | Provider webhooks → Cloudflare Worker or an automation tool |
| Customer accounts | Provider customer portals (Stripe, Paddle, Lemon Squeezy, Polar, Gumroad library) — no auth to build |
| Coupons, regional pricing, affiliates | Built into most of the providers above |
| Conversion tracking | Analytics events on `[data-checkout]` clicks (privacy-friendly providers support custom events) |
| In-page overlay checkout | Provider JavaScript overlays (Gumroad, Lemon Squeezy, Paddle) — would require allowing their scripts in the CSP (`src/lib/csp.ts`) |

Keep the rule: if a capability needs a server, use the provider's hosted
feature or a minimal edge function — never store payment data.
