# Launch checklist

Work top to bottom. `npm run preflight` checks many of these automatically;
`npm run preflight -- --strict` must pass before going live.

## 1. Decisions

- [ ] Final public name chosen (replacing the working name "Plainwork"), with a
      trademark search and an available domain
- [ ] Which product lines are visible at launch (`visible` in
      `src/content/businesses.yaml`) and their honest `status`
- [ ] Hero headline and supporting copy confirmed (`src/config/site.ts`)
- [ ] Principles and About copy read and agreed (`src/config/copy.ts`) —
      only keep promises you will keep
- [ ] Decide whether this GitHub repository should be **private** (drafts,
      product plans and docs are readable by anyone while it is public)

## 2. Configuration (`src/config/site.ts` and Cloudflare)

- [ ] `SITE_URL` set in Cloudflare Pages (and/or `url` in site.ts)
- [ ] `legalName` set if you operate as a registered business
- [ ] Contact: `contact.form` (Formspree/Web3Forms) and/or email addresses you
      monitor; optional `responseTime` you can actually meet
- [ ] Newsletter provider configured, or consciously left as RSS-only
- [ ] Analytics provider chosen (or consciously off)
- [ ] Social profile links (optional)
- [ ] Founder profile written in your own words (optional)
- [ ] `npm run assets:og` re-run after any name/headline change
- [ ] `npm run assets:icons` re-run if the mark changes

## 3. Legal

- [ ] Privacy policy published (`src/content/legal/privacy.md` or
      `legal.privacyUrl`) and accurate about: the contact-form provider,
      newsletter provider, analytics, checkout providers, hosting (Cloudflare)
- [ ] Terms of service published, including license terms for digital
      products (personal / team / agency / organization)
- [ ] Refund policy published and matching your checkout-provider settings
- [ ] Draft FAQ answers written and published (refunds, client use, updates)
- [ ] Disclaimers reviewed (e.g. "not legal advice" on Employer Toolkits)
- [ ] Cookie consent: the site sets no cookies and the supported analytics are
      cookieless — confirm this is sufficient where your customers live

## 4. Content

- [ ] Starter guides in `src/content/resources/` reviewed — edit, keep or
      set them to `status: draft`
- [ ] Every public product has: accurate summary, real images with alt text,
      documentation link, requirements, offers
- [ ] No placeholder text anywhere (`npm run build` warns on TODO/TBD)
- [ ] Spelling and tone pass on every page, in both themes

## 5. Commerce (for each product you sell)

- [ ] Checkout created in the provider; `checkoutUrl` copied exactly
- [ ] Test-mode purchase, then a real low-value purchase (refund it after)
- [ ] Delivery email, download/license key and receipt verified
- [ ] Taxes: merchant-of-record provider, or your own registrations set up
- [ ] Refund and cancellation flow tested
- [ ] Product set to `visibility: public` and `availability: available`

## 6. Forms

- [ ] Contact form test message received for each topic
- [ ] Spam protection active (honeypot is built in; enable provider filtering)
- [ ] Newsletter: sign-up confirmed end to end, welcome email checked

## 7. Technical

- [ ] `npm run verify` passes locally (type check, unit, build verifier, e2e,
      accessibility)
- [ ] GitHub branch protection on `main` requires the **CI** check
- [ ] Production deploy succeeded; site loads over HTTPS
- [ ] Response headers present (`curl -sI <url>` shows CSP frame-ancestors,
      HSTS, X-Content-Type-Options)
- [ ] `robots.txt` says `Allow: /` and lists the sitemap; pages are no longer
      `noindex`
- [ ] Custom domain connected (optional) and the `*.pages.dev` noindex rule
      uncommented in `public/_headers`
- [ ] 404 page works for a random URL
- [ ] Checked on a real phone (iOS Safari and Android Chrome), keyboard-only,
      and with a screen reader on at least the home and product pages
- [ ] Sitemap submitted to Google Search Console and Bing Webmaster Tools
- [ ] Social preview checked (paste the URL into a messaging app or a
      card validator)

## 8. Accounts and security

- [ ] Two-factor authentication on GitHub, Cloudflare, your registrar, and
      every payment/newsletter/form provider
- [ ] Dependabot alerts enabled on the repository
- [ ] No secrets in the repository (none are needed: form, newsletter and
      analytics identifiers are public by design)

## After launch

- [ ] Watch analytics and form submissions in the first week
- [ ] Re-run `npm run preflight` after every content change that adds a product
- [ ] Monthly dependency update branch (`npm outdated`, CI verifies)
