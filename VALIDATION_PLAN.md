# 14-day market validation plan — RenewalTrail

**Objective:** in 14 days, hold real conversations with **10–15 independent property-management companies**
(roughly 10–100 vendors each) and obtain **at least two credible paid commitments** for the Starter Kit
*before* building it.

**What is being tested:** whether the problem ("we don't know what expires next, or who's chasing it") hurts
enough that small property-management companies will pay for a simple fix, and whether the Starter Kit as
specified in [STARTER_KIT_SPEC.md](STARTER_KIT_SPEC.md) is that fix.

> **This repository is public.** Keep the prospect list, contact details, interview notes and any payment
> information out of it. Use a private spreadsheet (see §5) and never commit it.

---

## 1. Rules agreed before starting

Write these down now and don't change them after seeing results.

### What counts as a credible paid commitment

| Counts | Doesn't count |
| --- | --- |
| **A paid founding pre-order**: money received through a real checkout link, at the founding price, with a written delivery date and full refund if it isn't delivered by then (or on request before delivery). **This is the primary measure.** | "Sounds great", "keep me posted", "I'd probably pay for that" |
| A written purchase commitment from someone with budget authority (owner, principal, operations lead) that names the price and the delivery date, e.g. "We'll pay $49 on delivery by December 15." Counts only if it's specific and in writing. | Joining the early-access list, booking an interview, compliments, survey answers |
| | Commitments from friends or family who aren't in the target segment |

### Who counts as a qualified conversation

- An **independent** property-management company (not a national franchise or enterprise operator).
- Works with **roughly 10–100 vendors** (a rough proxy: 2–20 staff, or 50–1,500 units).
- The person handles or supervises vendor paperwork, or decides on tools for it.
- At least 15 minutes, live (call, video or in person), about *their* current process.

### Decision rules for day 14

| Outcome | Rule | Next step |
| --- | --- | --- |
| **GO** | ≥ 2 credible paid commitments **and** ≥ 5 qualified conversations rating the pain 4–5 out of 5 | Build the Starter Kit (STARTER_KIT_SPEC.md §12) and deliver to founding customers first, by the promised date. |
| **ITERATE** | Exactly 1 commitment, **or** ≥ 5 strong-pain conversations with consistent objections (price, format, setup effort) | Change one thing (price, Excel vs Sheets, add a setup call) and run 7 more days with the same rules. |
| **STOP / RETHINK** | 0 commitments **and** < 3 strong-pain conversations, or most say their property-management software already handles it | Don't build. Refund anything collected. Write down what you learned; consider a different segment (e.g. HOA managers, small general contractors) or a different problem. |

## 2. Honesty and conduct rules

- Never say or imply that the kit exists, is ready or is available. Give the real delivery date.
- Never say it verifies insurance, determines compliance or certifies vendors. It tracks dates and follow-ups.
- No fake urgency or scarcity. A founding price may have a deadline only if the deadline is real.
- Refund anyone who asks before delivery, and everyone if the delivery date is missed.
- Ask before taking notes; never record a call without explicit consent.
- Use business contact details only, and honour "no thanks" immediately: no further messages.
- Commercial email rules: if a message promotes a paid product (the pre-order offer), US CAN-SPAM rules apply
  (accurate sender and subject, a physical postal address, a working opt-out). Outside the US the rules
  differ (e.g. Canada's CASL, UK/EU rules) and can require prior consent. Check what applies before
  emailing people abroad. This plan isn't legal advice.
- **Keep the website truthful.** It currently says nothing is for sale. If you start taking founding
  pre-orders, update `src/config/landing.ts` the same day (pricing description and the Starter Kit stage,
  e.g. "Founding pre-orders open to interview participants") and rebuild, so the site and your emails agree.

## 3. Before day 1 (decisions that need you)

| Decision | Recommendation |
| --- | --- |
| Confirm the planned prices | $79 one-time and $49 founding are placeholders from planning. Change them in `src/config/landing.ts` if they don't feel right. |
| Delivery date for founding customers | Within 3 weeks of the GO decision, e.g. "by December 18, 2026". |
| Where pre-orders are taken | A merchant of record (Lemon Squeezy or Paddle) or a Stripe Payment Link. No monthly fee, per-sale fees only. Shared privately in emails, **not** on the website. |
| Refund terms | Full refund on request before delivery; automatic refund if the delivery date is missed. Put this in the checkout description. |
| Public site or not | The plan works without a public site (show the demo over screen share from `npm run dev`). A live URL helps credibility. **Deploying needs your approval**: the free Cloudflare Pages `*.pages.dev` address works, so no domain purchase is required. |

## 4. Schedule

14 calendar days, about 10 working days. Starting **Wednesday, November 11, 2026** puts day 14 on
**Tuesday, November 24**, before Thanksgiving week (Thursday, November 26), when many offices are slow. If you
start later, pause the count over the holiday.

| Day | Date (if starting Nov 11) | Focus | Output |
| --- | --- | --- | --- |
| 1 | Wed Nov 11 | **Set up.** Create the Formspree form and put its ID in `src/config/site.ts`; create a free Cal.com 20-minute event and set `earlyAccess.bookingUrl`; send yourself a test registration. Create the private tracker (§5). Confirm prices, delivery date and refund terms. | Working registration + booking; tracker ready |
| 2 | Thu Nov 12 | **Build the list.** 60 prospects from §6 sources, each with a named person and a one-line personal note. Prepare (don't share yet) the founding pre-order checkout link. | 60 rows in the tracker |
| 3 | Fri Nov 13 | **Wave 1.** 20 personalised emails + 10 phone calls (calls in the morning work best for small offices). | 30 contacted |
| 4–5 | Sat–Sun | Light day: add 15 more prospects, reply to anyone who answered, post in 1–2 communities where self-promotion is allowed. | Interviews booked |
| 6 | Mon Nov 16 | **Wave 1 continued.** 20 more emails; follow up day 3 non-replies by phone. First interviews. | 50+ contacted; 2–3 interviews |
| 7 | Tue Nov 17 | Interviews. Evening: **mid-point review.** Response rate by channel, what resonates, what doesn't. Rewrite the opening line if replies are below 10%. | Adjusted messages |
| 8 | Wed Nov 18 | **Wave 2** to remaining prospects on the best channel; interviews. | 5–7 interviews total |
| 9 | Thu Nov 19 | Interviews. Send recap + founding pre-order offer to every interested participant (template E). | First offers out |
| 10 | Fri Nov 20 | Interviews; reply to questions about the offer. | 8–10 interviews total |
| 11–12 | Sat–Sun | Draft the synthesis (§9). One final follow-up to non-replies (template B), then stop. | Synthesis draft |
| 13 | Mon Nov 23 | Last interviews. One reminder for open offers (template F), no more. | 10–15 interviews total |
| 14 | Tue Nov 24 | **Decide** against §1 rules. Write the one-page summary. If GO: tell founding customers the build has started. | Decision |

## 5. Private tracker (not in this repository)

A private spreadsheet with one row per company:

`Company · Contact name · Role · Source · Channel · Date first contacted · Follow-ups sent · Reply (Y/N) ·
Interview date · Units · Vendors (approx.) · Current method · Who owns follow-up · Last slip (story) ·
Pain 1–5 · PM software · Excel or Sheets · Price reaction · Offer sent · Commitment (none / written / paid) ·
Amount · Notes · Opted out (Y/N)`

Summary cells at the top: contacted, reply rate, interviews, qualified, pain ≥ 4, offers sent, commitments.

## 6. Where to find prospects

Aim for 60–75 names to reach 10–15 conversations. Cold outreach to small businesses often gets well under
20% replies, so phone calls and warm introductions matter.

1. **Your own network first:** anyone who owns rentals and uses a manager, anyone in real estate, insurance,
   trades or bookkeeping who works with property managers. Ask for one introduction each.
2. **Maps and directories:** search "property management" for your city and nearby cities. Small,
   independent firms usually list an owner's name on their website "About" page.
3. **Local associations:** property-management and landlord associations often publish member directories
   and run events; ask a chapter leader for introductions.
4. **LinkedIn:** owners, principals and office managers at firms with 2–50 employees.
5. **Online communities** for property managers and small landlords. Follow each community's rules on
   self-promotion; ask a research question, don't pitch.
6. **Adjacent professionals:** insurance agents who issue certificates to contractors, and bookkeepers for
   property managers, know who struggles with this. Ask them who to talk to, not to sell for you.

## 7. Outreach templates

Replace `{…}`. Keep emails under 120 words, personal first line, one clear ask, sent from your own address.

**A · First email**

```
Subject: Question about vendor insurance certificates at {Company}

Hi {First name},

{Personal line: e.g. "I saw {Company} manages around 300 units in {City}."}

I'm researching how small property-management companies keep track of vendor documents:
certificates of insurance, licenses, W-9s, and when each one expires. I'm considering a simple
spreadsheet kit for this, and I'm not selling anything today.

Would you be open to a 20-minute call this week or next? I'd mostly ask how you handle it now.
{Booking link}

If it's not relevant, just reply "no" and I won't follow up.

{Your name}
{Your city / phone}
```

**B · One follow-up (3–4 business days later, then stop)**

```
Subject: Re: Question about vendor insurance certificates at {Company}

Hi {First name}, a quick nudge in case this got buried. If someone else at {Company} handles
vendor paperwork, I'd be grateful for their name. {Booking link}
```

**C · Phone opener (30 seconds)**

> "Hi, this is {Your name}. I'm not selling anything. I'm researching how property-management offices keep
> track of vendor insurance certificates and when they expire. Who handles that there? … Would they have
> 20 minutes this week to tell me how they do it today?"

**D · LinkedIn note (under 300 characters)**

> Hi {First name}, I'm researching how small property-management firms track vendor insurance certificates
> and renewal dates. Not selling anything; would you share how {Company} handles it in a 20-minute call?

**E · Thank-you + founding offer (only to people who showed interest)**

```
Subject: Thanks, and the RenewalTrail founding offer

Hi {First name},

Thanks for walking me through how {Company} tracks vendor documents. The part about
{their specific pain} was really useful.

Based on these conversations I'm planning to build the RenewalTrail Starter Kit: a tracker
for Excel and Google Sheets, renewal-request templates and a setup guide. It tracks dates,
owners and follow-ups; it doesn't verify insurance or compliance.

For people who helped shape it there's a founding pre-order at {$49} (planned price
{$79}). It will be delivered by {date}, and you get a full refund if it isn't, or any time
before delivery if you change your mind: {checkout link}

No pressure at all. Your time already helped a lot.

{Your name}
{Physical mailing address}
Reply "stop" and I won't email about this again.
```

**F · One reminder for open offers (3–4 days later, then stop)**

```
Subject: Re: Thanks, and the RenewalTrail founding offer

Hi {First name}, one last note: the founding pre-order is open until {real date}. If now isn't the
right time, no problem at all. Is there anything that would make the kit more useful for {Company}?
```

## 8. Interview guide (20 minutes)

Ask about what they actually did, not what they might do. Don't pitch until the last few minutes.
Take notes on exact phrases.

| Min | Section | Questions |
| --- | --- | --- |
| 0–2 | Context | Your role? How many units / properties? Roughly how many active vendors? Who's on the team? |
| 2–8 | Current process | "Walk me through the last time a vendor's certificate of insurance expired. How did you find out?" · Where do expiration dates live today? · Who sends renewal requests? How? · How much time does this take in a typical week? · Could you show me the spreadsheet or screen you use (only if you're comfortable)? |
| 8–12 | Consequences | "What happened the last time something slipped?" · How often does that happen? · What did it cost: time, delayed jobs, awkward calls with owners? |
| 12–15 | Past fixes | "Have you tried to fix this? What happened?" · Does your property-management software track this? If it does, what makes you use it or not? · Have you ever paid for anything to help? |
| 15–18 | Demo | Show the demo on the website. "What's missing? What's confusing? What would you never use?" |
| 18–20 | Commitment | Explain the Starter Kit, planned price, founding price, delivery date and refund terms. "Would you like to pre-order at the founding price?" If yes: send template E today. If no: "What would need to be true for this to be worth paying for?" Write the answer down word for word. |

Score each conversation right after the call: **pain 1–5**, **frequency**, **fit** (vendor count),
**current workaround cost**, **commitment** (none / written / paid).

## 9. Metrics and targets

| Metric | Target by day 14 |
| --- | --- |
| Prospects identified | 60–75 |
| Contacted (any channel) | ≥ 50 |
| Reply rate | ≥ 15% (rewrite the opener at the day-7 review if lower) |
| Interviews completed | 10–15 |
| Qualified interviews (§1) | ≥ 8 |
| Pain rated 4–5 | ≥ 5 |
| Founding offers sent | every interested qualified participant |
| **Credible paid commitments** | **≥ 2 (decision gate)** |

Day-14 synthesis (one page): who said yes and why, who said no and why, the three most common workflows,
document types ranked by how often they're chased, Excel vs Sheets split, price reactions, the strongest
objections, and updates for STARTER_KIT_SPEC.md §13.

## 10. Budget

| Item | Cost |
| --- | --- |
| Registration form (Formspree free plan) | $0 |
| Interview booking (Cal.com free plan) | $0 |
| Private tracker (Google Sheets or Excel) | $0 |
| Pre-order checkout (merchant of record or Stripe) | $0 monthly; a per-sale fee on each payment |
| Website hosting (Cloudflare Pages free plan, *if you approve deploying*) | $0 |
| Custom domain (optional, **not purchased without your approval**) | about $10–15 per year |

## 11. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Too few replies | Phone first for small offices; warm introductions; local associations; shift effort to the best channel at the day-7 review. |
| "Our PM software already does this" | Ask what it does and why they don't use it. If most qualified prospects are happy with their software, that's a STOP signal, not something to argue with. |
| Polite interest, no money | Only paid pre-orders and specific written commitments count (§1). |
| Holiday slowdown | Finish before Thanksgiving week, or pause the count. |
| Scope creep in interviews (portals, auto-reminders, AI reading certificates) | Write requests down as possible later versions; keep the kit's scope as specified. |
| Saying more than is true under pressure | Re-read §2 before every call. |
