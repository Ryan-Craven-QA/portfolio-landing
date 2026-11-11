# Deployment

The RenewalTrail site builds to plain static files in `dist/`. It is designed for the **Cloudflare Pages
free plan**, connected to this GitHub repository, so every push to `main` deploys automatically and every
other branch or pull request gets its own preview URL.

> **Nothing has been deployed, and no domain has been bought.** Both need your approval. These are the steps
> to do it yourself when you decide to.

## Minimum-cost hosting options

The site is static: any static host works. Compared for a small **commercial** product site (as of
November 2026; check current terms before signing up):

| Host | Cost for this site | Fit | Notes |
| --- | --- | --- | --- |
| **Cloudflare Pages** (recommended) | **$0** | ✅ | Free plan allows commercial sites. Unlimited static requests and bandwidth, 500 builds/month, preview URL per branch, `_headers` support, free `*.pages.dev` address. Steps below. |
| Cloudflare Workers (static assets) | $0 | ✅ | Cloudflare's newer option for new projects; static asset requests are free and unlimited. Same `_headers`. See the alternative at the end. |
| Netlify (free plan) | $0 up to a monthly credit cap | ⚠️ | Credit-based since 2025: the free plan has a hard monthly credit cap (bandwidth and builds use credits) and **pauses the site** when it runs out. Fine for low traffic; watch usage. |
| GitHub Pages | $0 | ❌ | GitHub's terms say Pages may not be used as free hosting for an online business or a site primarily for commercial transactions or services. |
| Vercel (Hobby) | $0 | ❌ | Hobby is limited to non-commercial personal use; a business site needs Pro (paid per seat). |

**Recommendation:** Cloudflare Pages on the free `*.pages.dev` address during validation. Total cost: **$0**.
Add a custom domain (≈ $11/year) only after trademark and domain clearance, and only with your approval.

## Required external configuration

Everything the site needs from outside this repository. Nothing here can be created on your behalf: each
needs your own account.

| # | What | Required? | Where it goes | Cost |
| --- | --- | --- | --- | --- |
| 1 | **Early-access form:** a Formspree form (or a Web3Forms access key) | **Yes**, it's the main conversion | `contact.form` in `src/config/site.ts` | $0 (Formspree free: 50 submissions/month; Web3Forms free: 250/month) |
| 2 | **Public site URL:** `SITE_URL` environment variable in the hosting project | **Yes**, for indexing (every page is `noindex` until it's set) | Cloudflare Pages → Settings → Environment variables | $0 |
| 3 | **Privacy policy:** your own, describing the form provider and what you collect | **Yes**, once the form is live (preflight blocks launch without it) | `src/content/legal/privacy.md` (set `status: published`) or `legal.privacyUrl` | $0, or a lawyer/policy service |
| 4 | **Contact email:** a mailbox you check | Recommended | `contact.general` (and optionally `business`) | $0 with an address you already have; with a custom domain, Cloudflare Email Routing forwards `hello@yourdomain` to your inbox for free |
| 5 | **Interview booking link:** e.g. a free Cal.com 20-minute event | Optional | `earlyAccess.bookingUrl` | $0 |
| 6 | **Brand clearance:** trademark search and domain availability for "RenewalTrail" | Before a custom domain or public promotion | then set `nameCleared: true` (and `name` if it changes, then `npm run assets:og`) | $0 for a basic search; legal advice costs extra |
| 7 | Custom domain | Optional, **needs your approval** | Pages → Custom domains; update `SITE_URL` | ≈ $11/year for a `.com` |
| 8 | Analytics (Cloudflare Web Analytics) | Optional | `analytics` in `src/config/site.ts` | $0, cookieless |
| 9 | Founding pre-order checkout (merchant of record or Stripe Payment Link) | Only for the validation plan; shared privately, **not** on the site | — (see VALIDATION_PLAN.md §3) | Per-sale fees only |

After changing the config, run `npm run preflight`. It lists anything still blocking launch.
[LAUNCH_CHECKLIST.md](LAUNCH_CHECKLIST.md) has the complete list of remaining launch requirements.

## Accounts you need

| Account | Needed? | Cost |
| --- | --- | --- |
| GitHub (you have it) | Yes — hosts the code, runs CI | Free |
| Cloudflare | Yes — hosting | Free plan |
| Form provider (Formspree or Web3Forms) | **Yes** — early-access registration | Free tier |
| Cal.com (or another booking tool) | Optional — interview scheduling | Free plan |
| Domain registrar | Optional, later — a custom domain | ≈ $11/year for a `.com` (see costs) |
| Checkout provider (Lemon Squeezy, Paddle, Stripe, …) | Later — founding pre-orders, then sales | Fees per sale, no monthly cost on the basic plans |

## Costs (as of November 2026 — check current pricing before signing up)

| Item | Cost | Notes |
| --- | --- | --- |
| Cloudflare Pages hosting | **$0** | Free plan: 500 builds/month, 1 build at a time, 20,000 files and 25 MiB per file per site, static requests free and unlimited, 100 custom domains per project |
| Cloudflare Web Analytics | **$0** | Cookieless; optional |
| GitHub Actions CI | **$0** | Free minutes for public repositories; private repositories include a monthly free allowance |
| Custom domain | ≈ **$11/year** | Cloudflare Registrar sells at cost. The `.com` wholesale price rose to $10.97 on 1 Nov 2026, so expect roughly $11.20/year (estimate) |
| Early-access / contact form | **$0** | Formspree free: 50 submissions/month. Web3Forms free: 250/month |
| Interview booking | **$0** | Cal.com free plan for individuals |
| Newsletter (not needed yet) | **$0** to start | Early-access registrations are the update list for now |
| Checkout | per sale | See MONETIZATION.md |

**Total to launch: $0**, or about $11/year with a custom domain.

## Before you deploy

1. Merge the work into `main` (Cloudflare deploys the production branch).
2. Run the checks locally:

   ```bash
   npm run verify
   ```

3. Read the launch report:

   ```bash
   npm run preflight
   ```

## Deploy on Cloudflare Pages (Git integration)

Cloudflare reorganizes its dashboard from time to time; the names below were
current at the time of writing.

1. Sign in at <https://dash.cloudflare.com> and open **Workers & Pages**.
2. Choose **Create** → **Pages** → **Connect to Git** (Cloudflare now promotes
   Workers for new projects; the Pages option is still offered and fully
   supported — see the alternative below).
3. Authorize GitHub and pick this repository.
4. Build settings:

   | Setting | Value |
   | --- | --- |
   | Production branch | `main` |
   | Framework preset | Astro (or None) |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Root directory | *(leave empty)* |

5. **Environment variables** (Production):

   | Name | Value |
   | --- | --- |
   | `SITE_URL` | `https://<your-project>.pages.dev` (later: your custom domain) |

   The Node version comes from `.node-version` (22.23.4). Do **not** set
   `NODE_ENV=production` for the build — the build verification uses dev
   dependencies.
6. **Save and Deploy.** The first build takes a minute or two. Your site is at
   `https://<your-project>.pages.dev`.
7. If you did not know the project URL in step 5, set `SITE_URL` now and
   redeploy (**Deployments → … → Retry deployment**). Until `SITE_URL` is a
   real address, every page is marked `noindex` on purpose.

### What happens on each push

- Push to `main` → production deploy.
- Push to another branch or open a pull request → a preview deploy at its own
  URL. Cloudflare adds `X-Robots-Tag: noindex` to previews, and the site also
  marks non-production branches `noindex` (via `CF_PAGES_BRANCH`).
- GitHub Actions (`.github/workflows/ci.yml`) runs type checks, unit tests,
  the build verifier, end-to-end and accessibility tests. Turn on branch
  protection for `main` (Settings → Branches) and require the **CI** check so
  nothing broken can be merged.

### Security headers

`public/_headers` sets clickjacking protection (`frame-ancestors 'none'`),
`X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`,
`Cross-Origin-Opener-Policy`, HSTS, and long-lived caching for fingerprinted
assets. The rest of the Content-Security-Policy is a `<meta>` tag generated on
every page from `src/config/site.ts`, so enabling a form, newsletter or
analytics provider updates it automatically.

Check the live headers after deploying:

```bash
curl -sI https://<your-project>.pages.dev/ | grep -iE "x-frame|content-security|strict-transport|referrer"
```

### Rolling back

**Workers & Pages → your project → Deployments**, pick a previous deployment,
**Rollback**.

## Custom domain (optional, later)

1. Buy a domain (Cloudflare Registrar sells at cost) or bring one you own.
2. In the Pages project: **Custom domains → Set up a custom domain**. If the
   domain uses Cloudflare DNS the record is created for you; otherwise add the
   CNAME record Cloudflare shows you at your DNS provider.
3. Update `SITE_URL` to `https://www.yourdomain.com` (or the apex) and redeploy.
4. Stop the `*.pages.dev` copy from being indexed as a duplicate: uncomment the
   `https://:project.pages.dev/*` block at the end of `public/_headers`.
5. Optional: redirect the bare domain to `www` (or the reverse) with a
   Cloudflare redirect rule.
6. Regenerate the sharing image so it shows your domain: `npm run assets:og`.

## Analytics (optional)

Cloudflare Web Analytics is free and cookieless. Either:

- **Automatic:** Pages project → **Metrics → Web Analytics → Enable**, then set
  `analytics: { provider: 'cloudflare' }` (no token) in `src/config/site.ts` so
  the Content-Security-Policy allows the injected beacon; or
- **Manual:** create a site under **Analytics & Logs → Web Analytics**, copy
  the token from the snippet, and set
  `analytics: { provider: 'cloudflare', token: '<token>' }`.

Plausible and Umami are also supported (see `src/config/site.ts`).

## Scheduled rebuilds (optional)

Resources with a future `publishDate` appear on the first build after that
date. To publish them automatically, rebuild daily:

1. Pages project → **Settings → Builds → Deploy hooks** → create a hook for
   `main` and copy its URL.
2. GitHub → repository **Settings → Secrets and variables → Actions** → add
   `CLOUDFLARE_DEPLOY_HOOK` with that URL.
3. Add `.github/workflows/scheduled-rebuild.yml`:

   ```yaml
   name: Scheduled rebuild
   on:
     schedule:
       - cron: '17 6 * * *' # daily, 06:17 UTC
   jobs:
     rebuild:
       runs-on: ubuntu-latest
       steps:
         - run: curl -fsS -X POST "${{ secrets.CLOUDFLARE_DEPLOY_HOOK }}"
   ```

Each rebuild counts toward the 500 builds/month free allowance.

## Alternative: Cloudflare Workers static assets

Cloudflare's documentation now recommends Workers (with static assets) for new
projects; static asset requests are free and unlimited there too. To use it
instead of Pages, add `wrangler.jsonc`:

```jsonc
{
  "name": "renewaltrail-site",
  "compatibility_date": "2026-11-01",
  "assets": { "directory": "./dist", "not_found_handling": "404-page" }
}
```

Then connect the repository under **Workers & Pages → Create → Import a
repository** with build command `npm run build` and deploy command
`npx wrangler deploy`. `_headers` works the same way. Previews on custom
domains do not get `noindex` automatically on Workers, so keep `SITE_NOINDEX`
set for any staging deployment.

Any static host works: publish `dist/` and translate `public/_headers` into that host's header
configuration. Check the commercial-use terms first (see the comparison at the top).

## Troubleshooting

| Problem | Fix |
| --- | --- |
| Build fails with `Invalid site configuration` | The message names the field in `src/config/site.ts` |
| Build fails with `[content] … refers to unknown …` | A product/resource/solution points at an id that does not exist |
| `verify-build` reports a broken link or leak | Fix the content it names; it runs on every build on purpose |
| Pages are `noindex` in production | `SITE_URL` is still a placeholder, or `SITE_NOINDEX` is set |
| Early-access form says "registration opens soon" | `contact.form` is not configured (or the build used an old config) |
| Contact form missing on the live site | `contact.form` is not configured |
| `verify-build` reports a forbidden claim | Reword the sentence it quotes; see the scope rules in CLAUDE.md and `src/lib/claims.ts` |
| Node version errors | Cloudflare reads `.node-version`; Astro 7 needs ≥ 22.23.4 |
