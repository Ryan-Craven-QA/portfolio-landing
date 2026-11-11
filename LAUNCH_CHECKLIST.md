# Launch checklist — RenewalTrail

There are two launches:

- **A. Validation launch:** the landing page goes live with a working early-access form. Nothing is sold.
- **B. First sale:** the Starter Kit goes on sale, only after the validation plan says GO.

Work top to bottom. `npm run preflight` checks many of these automatically; `npm run preflight -- --strict`
must pass before going live.

---

## A. Validation launch

### 1. Decisions (yours)

- [ ] **Approve deploying publicly.** Recommended: Cloudflare Pages on the free `*.pages.dev` address, $0 (DEPLOYMENT.md).
- [ ] **Brand clearance** for the working name "RenewalTrail": trademark search in your markets and domain
      availability. Then set `nameCleared: true` in `src/config/site.ts`, or change `name` (copy follows via
      `{brand}`) and run `npm run assets:og`.
- [ ] **Planned prices** confirmed or removed: $79 Starter Kit, $49 founding price, $29–59/month software range
      (`src/config/landing.ts`). These were proposed during planning, not researched market prices.
- [ ] Landing copy read and agreed (`src/config/landing.ts`, `src/content/faqs.yaml`). Only keep promises you'll keep,
      e.g. "We reply by email" and the interview length.
- [ ] Decide whether this GitHub repository should be **private**. While it's public, STARTER_KIT_SPEC.md,
      VALIDATION_PLAN.md and every draft are readable by anyone.
- [ ] Optional: founder profile on the About page, in your own words (`founder` in `src/config/site.ts`).

### 2. Configuration (`src/config/site.ts` and the host)

- [ ] `contact.form` set (Formspree or Web3Forms); one test registration received **for each** choice:
      early access, interview, both
- [ ] Spam protection: the honeypot is built in; also turn on the provider's spam filtering
- [ ] `contact.general` set to a mailbox you check (recommended; also the fallback shown if the form fails)
- [ ] `earlyAccess.bookingUrl` set and a test booking made (optional)
- [ ] `contact.responseTime` set only if you'll reliably meet it
- [ ] `SITE_URL` set in the hosting project (until then every page is `noindex` on purpose)
- [ ] `disclaimer` reviewed; keep the administrative-tracking-only meaning
- [ ] `npm run assets:og` re-run after any name or headline change

### 3. Legal and scope

- [ ] **Privacy policy published** (`src/content/legal/privacy.md` with `status: published`, or
      `legal.privacyUrl`). It must be accurate about what the form collects (name, work email, company, role,
      vendor count, current method, optional message), the form provider, the booking tool, hosting
      (Cloudflare) and analytics if enabled. `npm run preflight` blocks launch without it once a form is configured.
- [ ] The consent sentence on the form matches how you'll actually use the details
- [ ] **Scope read-through:** nothing on the site says or implies that RenewalTrail verifies insurance, determines
      compliance or certifies vendors. The build's claims guard catches common phrasings, so read the pages too.
- [ ] **Availability read-through:** nothing implies the software, the Starter Kit or a subscription is available today
- [ ] Fictional demo names checked: if one matches a real business you know in your area, rename it in `src/config/demo.ts`
- [ ] The `refunds` FAQ stays a draft until something is for sale

### 4. Technical

- [ ] `npm run verify` passes locally (type check, unit tests, build verifier with claims guard, e2e, accessibility)
- [ ] GitHub branch protection on `main` requires the **CI** check
- [ ] Production deploy succeeded; site loads over HTTPS
- [ ] Response headers present (`curl -sI <url>` shows HSTS, X-Content-Type-Options and CSP frame-ancestors)
- [ ] `robots.txt` says `Allow: /` and lists the sitemap; pages are no longer `noindex`
- [ ] Custom domain (optional, approved) connected and the `*.pages.dev` noindex rule uncommented in `public/_headers`
- [ ] 404 page works for a random URL
- [ ] Demo tried on a real phone (iOS Safari and Android Chrome), keyboard-only, and with a screen reader
- [ ] Early-access form submitted from a phone
- [ ] Social preview checked (paste the URL into a messaging app)

### 5. Accounts and security

- [ ] Two-factor authentication on GitHub, Cloudflare, the form provider, the booking tool and any checkout provider
- [ ] Dependabot alerts enabled on the repository
- [ ] No secrets in the repository (none are needed: form and analytics identifiers are public by design)
- [ ] Prospect lists and interview notes kept outside the repository (VALIDATION_PLAN.md §5)

---

## B. Before the first sale (Starter Kit)

- [ ] VALIDATION_PLAN.md decision is **GO**
- [ ] The kit passes the acceptance criteria in STARTER_KIT_SPEC.md §11 (AC1–AC9)
- [ ] Terms of sale (single-company license) and a refund policy published, matching the checkout provider's settings
- [ ] Checkout created at a merchant of record; test-mode purchase, then a real low-value purchase (refund it)
- [ ] Delivery email, download and receipt verified; the Google Sheets "Make a copy" link works from a logged-out browser
- [ ] Product page published: in `src/content/products/renewaltrail-starter-kit.md` set `visibility: published`,
      `availability: available`, and add an offer whose `checkoutUrl` passes the verified-checkout check
- [ ] The Starter Kit pricing card links to that offer through `OfferAction` (never a hand-written "Buy" link; see ROADMAP.md)
- [ ] Landing copy updated so it's true on launch day ("Nothing is for sale yet" removed, stage updated). The claims
      guard's not-for-sale rules switch off by themselves once a product is purchasable.
- [ ] Founding customers' pre-orders fulfilled first, by the date you promised them
- [ ] Support email monitored; the `refunds` FAQ answer written and published

## After launch

- [ ] Reply to every registration within the time you stated (or within a few days if you stated none)
- [ ] Re-run `npm run preflight` after any configuration or content change
- [ ] Monthly dependency update branch (`npm outdated`; CI verifies)
