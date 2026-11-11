# RenewalTrail Starter Kit — product specification

**Status:** draft v0.1 · not built · not for sale  
**Build gate:** build only after [VALIDATION_PLAN.md](VALIDATION_PLAN.md) reaches its decision threshold (at least two credible paid commitments).  
**Name:** "RenewalTrail" is a working name until trademark and domain clearance is complete.

> **Scope, in one sentence:** the Starter Kit is an administrative tracking tool. It records the dates, statuses
> and follow-ups that *you* enter. It does not review documents, verify insurance coverage, determine legal or
> contractual compliance, or certify vendor eligibility.

---

## 1. Summary

| | |
| --- | --- |
| **What** | A downloadable kit: a tracker workbook for Excel and Google Sheets, renewal-request email templates, a setup guide and a one-page weekly checklist. |
| **For** | Independent property-management companies working with roughly 10–100 vendors. The user is whoever handles vendor paperwork: an owner, a property manager or an office manager. |
| **Job to be done** | "Know what expires next — and who's following up." |
| **Planned price** | $79 one-time, single company. Founding price $49 for early-access participants. *Both are placeholders proposed during planning: confirm them before any outreach (they also appear in `src/config/landing.ts`).* |
| **Delivery** | A zip download from an external checkout (merchant of record). The Google Sheets version is a "Make a copy" template link inside the kit. |
| **Reference implementation** | The status rules match the website demo: `src/lib/renewals.ts`, specified by `tests/unit/renewals.test.ts`. |

## 2. Goals and non-goals

### Goals

| # | Goal | Measure |
| --- | --- | --- |
| G1 | Every vendor document and its expiration date in one list | One row per document; vendors listed once |
| G2 | Statuses calculated from dates, never typed by hand | Status column is formula-only and locked |
| G3 | A named owner and one next action on every item | Owner required; Next action column is formula-only |
| G4 | A record of every request and follow-up | Follow-up log; "Requested on" is derived from it |
| G5 | A weekly check that takes minutes | ≤ 15 minutes for 50 vendors (acceptance test AC6) |
| G6 | Fast setup | 20 vendors and 40 documents set up in ≤ 60 minutes using only the guide (AC5) |
| G7 | Works where small offices already work | Excel (Microsoft 365, 2021 or newer, Excel for the web) and Google Sheets. No macros, scripts, add-ins or external connections. |

### Non-goals (explicitly out of scope for v1)

- Reviewing documents, judging whether coverage is adequate, verifying insurance, determining compliance or certifying vendors. **The kit never uses words that suggest it does** (AC7).
- Storing documents. An optional "File location" column holds a link to wherever *you* keep the file.
- Sending email or reminders automatically. Templates are copied into your own email by you.
- AI or OCR extraction of dates from documents.
- Macros (`.xlsm`), Apps Script, add-ins, external data connections.
- Multi-company use, user accounts or permissions beyond what Excel and Google Sheets already provide.
- Integrations with property-management software. Vendor lists are pasted in from a CSV export.

## 3. Package contents

```
RenewalTrail-Starter-Kit-v1.0.zip
├── START-HERE.pdf                     # what's inside, Google Sheets copy link, license, support
├── RenewalTrail-Tracker.xlsx          # blank tracker (3 rows labelled "Example — delete me")
├── RenewalTrail-Tracker-Sample.xlsx   # 14 fictional rows (same vendors as the website demo) for practice
├── Setup-Guide.pdf                    # 12–16 pages, see §7
├── Weekly-Checklist.pdf               # 1 page, see §8
├── Templates/
│   ├── 1-renewal-request.txt
│   ├── 2-friendly-reminder.txt
│   ├── 3-final-reminder.txt
│   ├── 4-new-vendor-documents.txt
│   └── 5-received-thank-you.txt
└── LICENSE.txt                        # single-company license, see §10
```

The Google Sheets version is a native Sheets file (not an imported `.xlsx`), shared as a template link that
forces "Make a copy", so each customer's data lives only in their own Google account.

## 4. Workbook structure

Tabs, in order. Input cells have a pale fill; formula columns are grey, locked, and protected **without a
password** so customers can unlock them if they need to. No merged cells inside tables. Header rows are frozen.

| Tab | Purpose |
| --- | --- |
| **Start here** | Five setup steps with links to each tab, the disclaimer, version number and support contact. |
| **Dashboard** | The weekly view (§4.5). Read-only. |
| **Documents** | One row per vendor document: the heart of the kit (§4.2). |
| **Vendors** | One row per vendor (§4.1). |
| **Follow-ups** | Append-only log of requests, reminders and replies (§4.3). |
| **People** | Who can own a follow-up. |
| **Request builder** | Pick a document and a template, then copy a ready-to-send email (§6.2). |
| **Settings** | Thresholds (§4.4). |
| **Lists** | Dropdown sources (document types, trades, actions). Protected. |

Excel uses named tables (`tblVendors`, `tblDocuments`, `tblFollowups`, `tblPeople`) with structured references.
The Google Sheets build uses named ranges with the same names, so formulas read the same in both.

### 4.1 Vendors (`tblVendors`)

| Column | Type | Required | Validation / notes |
| --- | --- | --- | --- |
| Vendor | text | yes | Unique (duplicate names are highlighted). Used as the key everywhere else. |
| Trade | dropdown | no | From **Lists** (Plumbing, Electrical, HVAC, Landscaping, Cleaning, Roofing, Pest control, Pool, Snow removal, Locksmith, Elevator, Painting, General contractor, Other). |
| Contact name | text | no | |
| Contact email | text | no | Basic email format check. |
| Phone | text | no | |
| Active | dropdown | yes | Yes / No (default Yes). Inactive vendors are left off the Dashboard. |
| Notes | text | no | |

### 4.2 Documents (`tblDocuments`)

**Inputs**

| Column | Type | Required | Validation / notes |
| --- | --- | --- | --- |
| Vendor | dropdown | yes | From `tblVendors[Vendor]`. |
| Document type | dropdown | yes | Certificate of insurance (general liability), Workers' comp certificate, Auto liability certificate, Business license, Contractor license, W-9, Signed vendor agreement, Other. Editable in **Lists**. |
| Property / scope | text | no | e.g. "All properties" or a property name, for documents that differ by property. |
| Expiration date | date | no | Blank means "no expiration date" (e.g. a W-9). Rejects text and dates before 2000. |
| State | dropdown | yes | **On file / Missing / Requested / Received**. Where the document stands in *your* workflow (default On file). |
| Owner | dropdown | yes | From `tblPeople[Name]`. |
| File location | text | no | Optional link to where you keep the file (shared drive, PM software). The kit stores no files. |
| Reviewed by / Reviewed on | dropdown / date | no | Optional record of who on *your* team looked at the latest copy, and when. An administrative note, not a verification. |
| Notes | text | no | |

**Calculated (locked)**

| Column | Formula (Excel; Sheets equivalent uses named ranges) |
| --- | --- |
| Label | `=[@Vendor]&" — "&[@[Document type]]&IF([@[Property / scope]]="","", " ("&[@[Property / scope]]&")")` (unique; used by dropdowns elsewhere) |
| Requested on | Latest "Request sent" or "Follow-up sent" date for this document in the log: `=LET(d,MAX(MAXIFS(tblFollowups[Date],tblFollowups[Document],[@Label],tblFollowups[Action],"Request sent"),MAXIFS(tblFollowups[Date],tblFollowups[Document],[@Label],tblFollowups[Action],"Follow-up sent")),IF(d=0,"",d))` |
| Days left | `=IF([@[Expiration date]]="","",[@[Expiration date]]-Today)` |
| Days waiting | `=IF([@[Requested on]]="","",Today-[@[Requested on]])` |
| Status | see §5.1 |
| Next action | see §5.2 |
| View | Needs action / Waiting on vendor / Coming up / Current (see §5.1) |
| Sort key | see §5.3 |

`Today` is a named cell on **Settings**: `=IF(TodayOverride="",TODAY(),TodayOverride)`. The override exists for
QA and for "what will next week look like?" checks.

If State is **Requested** but nothing is logged yet, Next action reads "Log the request in Follow-ups" so the
wait can be measured.

### 4.3 Follow-ups (`tblFollowups`)

| Column | Type | Required | Notes |
| --- | --- | --- | --- |
| Date | date | yes | Keyboard shortcut for today shown in the header note (Ctrl+; in Excel and Sheets). |
| Document | dropdown | yes | From `tblDocuments[Label]`. |
| Action | dropdown | yes | Request sent · Follow-up sent · Vendor replied · Document received · New date recorded · Note |
| By | dropdown | yes | From `tblPeople[Name]`. |
| Method | dropdown | no | Email · Phone · Vendor portal · In person |
| Note | text | no | |

The log is history: rows are added, never edited. Workflow **State** stays a dropdown on **Documents** (one
source of truth for state, one for dates). Changing the state isn't automated, and the setup guide says so.

### 4.4 Settings

| Setting | Default | Meaning |
| --- | --- | --- |
| Due soon (days) | 30 | Expiring within this many days → **Due soon**. |
| Coming up (days) | 60 | Expiring within this many days → **Coming up**. |
| Follow up after (days) | 7 | A request without a reply for this long → **Follow up**. |
| New term (days) | 365 | Suggested length when you record a renewed document (shown as a hint only). |
| Today override | blank | For testing. Leave blank. |

These defaults match `DEFAULT_SETTINGS` in `src/lib/renewals.ts`.

### 4.5 Dashboard

Read-only, recalculates on open. Top to bottom:

1. **Header:** "Week of {Today}" and the scope disclaimer in small text.
2. **Counts:** Needs action · Waiting on vendor · Coming up · Current · Missing (`COUNTIFS` over Documents, active vendors only).
3. **Needs action:** `SORTBY(FILTER(…, View="Needs action"), SortKey, 1)` showing Vendor, Document type, Expiration date, Status, Owner, Next action.
4. **Waiting on vendor:** the same for View = "Waiting on vendor", with Days waiting.
5. **Next to expire:** the next 5 documents with Days left ≥ 0 that are on file or requested (same rule as `nextToExpire()`).
6. **By owner:** an Owner × Status count grid, so everyone can see their own list.

`FILTER`, `SORTBY` and `LET` need Excel 2021, Microsoft 365, Excel for the web, or Google Sheets. Excel 2019 and
older are **not supported**, and START-HERE and the product page say so. Every dynamic list has room to spill
(at least 200 empty rows below it) so `#SPILL!` can't happen in normal use.

## 5. Status rules

These rules mirror `evaluate()` in `src/lib/renewals.ts` exactly. If either one changes, change both and update
`tests/unit/renewals.test.ts`.

### 5.1 Status and view

Evaluated top to bottom; the first match wins.

| # | Condition | Status | View |
| --- | --- | --- | --- |
| 1 | State = Missing | **Missing** | Needs action |
| 2 | State = Received | **Received** | Needs action |
| 3 | State = Requested and Days waiting ≥ Follow up after | **Follow up** | Needs action |
| 4 | State = Requested | **Requested** | Waiting on vendor |
| 5 | Expiration date blank | **On file** | Current |
| 6 | Days left < 0 | **Expired** | Needs action |
| 7 | Days left ≤ Due soon | **Due soon** | Needs action |
| 8 | Days left ≤ Coming up | **Coming up** | Coming up |
| 9 | otherwise | **Current** | Current |

```
=IF([@State]="Missing","Missing",
 IF([@State]="Received","Received",
 IF([@State]="Requested",IF(N([@[Days waiting]])>=FollowUpAfter,"Follow up","Requested"),
 IF([@[Expiration date]]="","On file",
 IF([@[Days left]]<0,"Expired",
 IF([@[Days left]]<=DueSoon,"Due soon",
 IF([@[Days left]]<=ComingUp,"Coming up","Current")))))))
```

### 5.2 Next action

| Status | Next action |
| --- | --- |
| Missing | Request the document |
| Received | Review it and record the new expiration date |
| Follow up | Follow up with the vendor |
| Requested | Follow up in *N* days if there is no reply (*N* = Follow up after − Days waiting) |
| Expired, Due soon | Send a renewal request |
| Coming up | Send a renewal request in *N* days (*N* = Days left − Due soon) |
| On file, Current | No action needed |

### 5.3 Sort key ("most urgent first")

`Sort key = tier × 100000 + MAX(-49999, MIN(49999, Days left))`, with blank Days left counting as 49999.
Tiers: Expired 0 · Missing 1 · Follow up 2 · Due soon 3 · Received 4 · Requested 5 · Coming up 6 · Current/On file 7.
Within a tier the earliest date comes first; the longest-expired document is first of all. (Same as `urgencyRank()`.)

### 5.4 Status colours

Text label always present; colour is never the only signal. Every fill/text pair is at least 4.5:1 contrast.

| Status | Style |
| --- | --- |
| Expired, Missing | Red text on light red |
| Follow up, Due soon | Dark amber text on light amber |
| Received | Blue text on light blue |
| Requested, Coming up | Dark grey on light grey |
| Current, On file | Green text on light green |

## 6. Templates

### 6.1 Template text

Plain text, with placeholders in `{braces}`. The templates *ask for documents*. They don't set, interpret or
promise anything about insurance requirements; optional lines in `[brackets]` let customers mention their own
agreement terms in their own words.

**1 · Renewal request** (Expired, Due soon)

```
Subject: Updated {Document type} for {Company}

Hi {Contact name},

Our records show the {Document type} we have on file for {Vendor} expires on {Expiration date}.
When the renewal is issued, could you send us an updated copy? If it comes from your insurance
agent, feel free to ask them to send it to us directly.

[Optional: Please make sure it reflects the details in our vendor agreement.]

Thank you,
{Your name}
{Company}
```

**2 · Friendly reminder** (Follow up)

```
Subject: Following up: {Document type} for {Company}

Hi {Contact name},

Just following up on my note from {Requested on} about an updated {Document type} for {Vendor}.
Could you send it over when you have a moment, or let me know when to expect it?

Thanks,
{Your name}
```

**3 · Final reminder** (Expired, after a follow-up)

```
Subject: Still needed: {Document type} for {Vendor}

Hi {Contact name},

We still don't have an updated {Document type} on file for {Vendor}; the copy we have expired on
{Expiration date}. [Optional: Under our vendor agreement we need a current copy on file before
scheduling further work.] Please send it, or reply if anything is holding it up.

Thank you,
{Your name}
{Company}
```

**4 · New vendor documents** (Missing, onboarding)

```
Subject: Documents we keep on file for {Company} vendors

Hi {Contact name},

Welcome aboard. For our records, could you send us the following?

{Missing document list}

Thank you,
{Your name}
{Company}
```

**5 · Received, thank you**

```
Subject: Thanks — {Document type} received

Hi {Contact name},

Thanks for sending the updated {Document type}. We've added it to our records.

{Your name}
```

### 6.2 Request builder tab (should-have for v1.0)

Pick a **Document** (dropdown of labels) and a **Template** (1–5); the tab shows the finished Subject and Body
with placeholders filled from the Documents, Vendors and Settings tabs (`{Your name}` and `{Company}` come from
Settings). Template 4 builds `{Missing document list}` with `TEXTJOIN` over that vendor's Missing rows.
Customers copy the text into their own email. The workbook never sends anything.

## 7. Setup guide outline (Setup-Guide.pdf)

1. What the kit does, and what it doesn't (the disclaimer, in plain words)
2. Excel or Google Sheets? Opening the file or making your copy
3. Add your people (2 minutes)
4. Add your vendors: paste from a CSV export (most property-management systems can export a vendor list), with a column-mapping table
5. Add documents and expiration dates (about 1–2 minutes per vendor; start with certificates of insurance)
6. Assign owners
7. Check the settings (30 / 60 / 7 days)
8. Your first weekly check, step by step on the Dashboard
9. Sending requests with the templates and logging them
10. When a document arrives: review it yourself, record the new date, set State back to On file
11. Sharing with your team (OneDrive/SharePoint or Google Sheets sharing). The file holds vendor contact details, so share it only with staff who need it
12. Troubleshooting: dates stored as text, regional date formats, `#SPILL!`, missing dropdowns, Excel 2019
13. Support and updates

Style: plain language, one task per page, screenshots from the **Sample** workbook only (fictional data), tagged
PDF with real headings and alt text, minimum 11 pt.

## 8. Weekly checklist (Weekly-Checklist.pdf)

- [ ] Open **Dashboard → Needs action**.
- [ ] **Expired** and **Missing** first: send template 1 or 4, then log it in Follow-ups.
- [ ] **Follow up**: send template 2 (or 3 if it's already expired) and log it.
- [ ] **Received**: look over the new copy yourself, record the new expiration date, set State to On file, log "New date recorded".
- [ ] **Coming up**: check who will send each request, and when.
- [ ] **By owner**: everyone knows their items for the week.

Target: 10–15 minutes a week for 50 vendors.

## 9. Compatibility and technical requirements

| Requirement | Detail |
| --- | --- |
| Excel | Microsoft 365 (Windows, Mac, web) and Excel 2021 or newer. Excel 2019 and older: not supported (no `FILTER`/`SORTBY`/`LET`). |
| Google Sheets | Current version in a desktop browser. Mobile apps: view and simple edits only. |
| Other apps | LibreOffice, Numbers: not tested, not supported. |
| File format | `.xlsx` only, no macros. No external links, no data connections, no hidden sheets except **Lists**. |
| Performance | Responsive with 500 documents and 2,000 log rows. |
| Privacy | Stores only what customers type. No telemetry, no external calls. Document properties cleared of author metadata before release. |
| Accessibility | Clear header names, frozen headers, no colour-only meaning, ≥ 4.5:1 contrast, tagged PDFs. |
| Versioning | `v1.0`, shown on **Start here** and in file names. Patch releases (v1.0.x) for fixes, free for buyers. |

## 10. Licensing, pricing and delivery

- **License:** one company, any number of staff inside that company. No resale or redistribution of the kit or templates.
- **Price (planned):** $79 one-time; founding price $49 for early-access participants. Confirm before use.
- **Checkout:** an external merchant of record (see MONETIZATION.md), which handles payment, tax and the download link. The site only links to a verified checkout once the product page is published.
- **Refunds:** a written refund policy must be published before the first sale (`npm run preflight` blocks launch without one).
- **Updates:** v1.x updates are free for buyers.
- **Support:** by email from the address configured in `src/config/site.ts`. Add a response time only if you'll reliably meet it.

## 11. Acceptance criteria (release checklist)

| # | Criterion | How it's checked |
| --- | --- | --- |
| AC1 | Status logic matches the reference implementation | A QA tab (removed before release) with the 14 demo rows plus boundary cases gives exactly the statuses in `tests/unit/renewals.test.ts`: −1 → Expired · 0 → Due soon ("Expires today") · 30 → Due soon · 31 → Coming up · 60 → Coming up · 61 → Current · blank → On file · requested 6 days → Requested · 7 days → Follow up. |
| AC2 | Dashboard counts and lists agree with the Documents tab | Spot check on the Sample workbook, plus `TodayOverride` set to 3 different dates. |
| AC3 | No formula errors anywhere | No `#NAME?`, `#SPILL!`, `#REF!`, `#VALUE!` with 0, 1, 50 and 500 rows in each supported app (Excel 365 Windows, Excel 365 Mac, Excel for the web, Excel 2021, Google Sheets). |
| AC4 | Validation works | Dropdowns everywhere; duplicate vendor names flagged; text in date columns rejected. |
| AC5 | Setup time | Two people who've never seen the kit set up 20 vendors / 40 documents in ≤ 60 minutes using only the guide. Ideally founding customers. |
| AC6 | Weekly check time | ≤ 15 minutes for the 50-vendor Sample, following the checklist. |
| AC7 | No claims beyond scope | The guide, templates and workbook text pass the site's claims guard (`findClaimViolations` in `src/lib/claims.ts`, run over the exported text). Nothing says verify, compliant, certified or approved as a claim. |
| AC8 | Accessibility | PDFs pass an accessibility checker (tags, headings, reading order, alt text); status colours meet 4.5:1. |
| AC9 | File hygiene | No macros, no external links, metadata cleared, versioned file names, zip opens on Windows and macOS. |

## 12. Build plan (after a GO decision)

| Step | Work | Estimate |
| --- | --- | --- |
| 1 | Excel workbook: tables, validation, formulas, Dashboard, protection | 2 days |
| 2 | Native Google Sheets version and template link | 1 day |
| 3 | Templates and Request builder | 1 day |
| 4 | Setup guide, weekly checklist, START-HERE (screenshots from the Sample) | 1–2 days |
| 5 | QA matrix across apps (AC1–AC9) | 1 day |
| 6 | Founding-customer beta: 2–3 customers set it up on a call, then fix what tripped them up | 2–4 days elapsed |
| 7 | Release: publish the product page (`src/content/products/renewaltrail-starter-kit.md`, add an offer with a verified checkout URL, set `visibility: published`) and point the Starter Kit pricing card at it through `OfferAction` | ½ day |

Roughly 1–2 weeks of part-time work. Founding customers get the kit first, by the delivery date promised when they paid.

## 13. Open questions for validation interviews

- Which document types matter most, and which ones do people actually chase? (COI, workers' comp, W-9, licenses, agreements)
- Do they track per vendor, or per vendor *and* property?
- Is follow-up owned by one person, or by each property manager?
- Excel or Google Sheets — and who else needs to open the file?
- What does their property-management software already do here, and why isn't it enough?
- Would they pre-order at the founding price? If not, what would need to be true?
- Would a "done-with-you" setup call be worth more than the kit itself?
