# Roadmap — RenewalTrail

Ordered by what most directly answers the question "will small property-management companies pay for
this?", then what follows only if the answer is yes. Each item lists effort and whether it needs new
infrastructure. Nothing in "Later" is built without evidence of demand.

## Now — validation launch (cost: $0)

| # | Item | Why | Effort |
| --- | --- | --- | --- |
| 1 | Create the Formspree form and set `contact.form`; optional Cal.com link in `earlyAccess.bookingUrl` | The early-access form is the main conversion and stays off until configured | Low |
| 2 | Write and publish the privacy policy | Required before collecting registrations | Low–Medium |
| 3 | Confirm or change the planned prices in `src/config/landing.ts` | They're public on the page and used in interviews | Low |
| 4 | Trademark and domain check for the working name; set `nameCleared` or rename | Before any public promotion or domain purchase | Low |
| 5 | **With your approval:** deploy to Cloudflare Pages (`*.pages.dev`), set `SITE_URL`, protect `main` with CI | A live link for outreach | Low |
| 6 | Run [VALIDATION_PLAN.md](VALIDATION_PLAN.md): 10–15 conversations, ≥ 2 credible paid commitments | The decision gate for everything below | 14 days |

## Next — Starter Kit v1.0 (only after a GO decision)

| # | Item | Why | Effort |
| --- | --- | --- | --- |
| 7 | Build the kit per [STARTER_KIT_SPEC.md](STARTER_KIT_SPEC.md) §12, passing AC1–AC9 | The first product | 1–2 weeks part-time |
| 8 | Founding-customer beta: watch 2–3 customers set it up | Fix setup friction before wider sale | 2–4 days |
| 9 | Terms of sale (single-company license) and refund policy | Required before selling | Low–Medium |
| 10 | Connect the pricing card to a real checkout: add a `productId` to `PricingPlan` and render `OfferAction` (verified checkout) when that product is purchasable; keep the early-access link otherwise | Selling without ever hand-rolling a "Buy" link | Low (code) |
| 11 | Publish the Starter Kit product page with screenshots of the **Sample** workbook and an excerpt of the setup guide | Lets visitors see exactly what they'd get | Low |
| 12 | Cloudflare Web Analytics with a goal on early-access submissions and checkout clicks | Know which sections convert | Low |

## Then — after the first sales

| # | Item | Why | Effort |
| --- | --- | --- | --- |
| 13 | Customer quotes, **only** real and permissioned (a `testimonials` collection with source and consent fields) | Social proof without fabrication | Low |
| 14 | "Done-with-you" setup call as a paid add-on, if interviews asked for it | Higher value for busy offices | Low |
| 15 | Practical guides (e.g. "Which vendor documents do property managers keep on file?"), clearly informational, never legal advice. The Resources section reappears automatically once one is published | Search traffic from the exact audience | Ongoing |
| 16 | Newsletter provider once the early-access list outgrows a personal inbox | Owned audience | Low |
| 17 | Kit v1.1 from customer feedback (document types, per-property tracking, Request builder polish) | Retention and referrals | Low–Medium |

## Later — software (only with clear, paid demand)

The hosted version is listed on the site as "Exploring · not yet built". Build it only when paying kit
customers repeatedly ask for what a spreadsheet can't do (several people editing at once, reminders,
an audit trail).

| # | Item | Why | Effort |
| --- | --- | --- | --- |
| 18 | Hosted RenewalTrail: accounts, shared lists, the same status rules (`src/lib/renewals.ts`) | Teams outgrow a shared spreadsheet | High (new backend, auth, storage) |
| 19 | Opt-in reminder emails to your own team (not to vendors at first) | The most requested automation, kept within your control | Medium–High (email delivery, consent) |
| 20 | Document links or uploads, with a security review | Fewer places to look | High |
| 21 | CSV import from property-management software exports | Faster setup | Medium |

Every item in this section stays administrative: no feature may verify insurance, determine compliance or
certify vendors.

## Additional products

The multi-product catalog is still in place (hidden). A second product means: add a product line to
`src/content/businesses.yaml`, add products, and switch `homepage` to `'portfolio'` when the site should
present more than one. Navigation, search and the sitemap only ever include sections with public content.

## Ongoing hygiene

- Monthly: `npm outdated`, `npm audit`, update dependencies on a branch and let CI verify; check that a
  test registration still arrives.
- Each release: update the product's `updatedDate`/`version`, publish docs, run `npm run preflight`.
- Yearly: review policies, prices, license terms, and the accessibility of new pages with a screen reader.
