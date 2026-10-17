# MVP Plan: AI Quoting + Job Paperwork for Small HVAC Contractors
**Phases 1-3: Validate, Define, Design**
Working name: **SiteQuote** (placeholder, check the name and domain are free before using it)

---

## How to read this document

- **Phase 1** is split into what I could do (desk research) and what only you can do (talking to real people). I cannot interview anyone, so the interview script and scoring sheet are ready for you to use.
- **Phase 2** is the full requirements: what to build, and what NOT to build.
- **Phase 3** is the design: user flow, screen wireframes, and visual style.
- Facts marked **(unverified)** come from vendor blogs or second-hand statistics. Treat them as hypotheses until your own interviews confirm them.

---

# PHASE 1: VALIDATE THE IDEA

## 1.1 The idea in one line
Small HVAC companies lose jobs and hours because quoting is slow and manual. A technician takes photos and a voice note at the job, and the app drafts a priced quote and a job report in about two minutes. A human reviews it and sends it.

## 1.2 Desk research findings

**Quoting is a known bottleneck**
- One industry blog cites a Jobber 2024 report saying 61% of home-service owners call quoting and estimating their biggest operational bottleneck **(unverified, second-hand)**.
- The same blog describes a typical slow process: technician assesses the job, calls the office, the office manager builds the quote in Excel, the owner reviews it, and someone finally contacts the customer **(unverified)**.
- Another claim says technicians spend 2-3 hours a day on paperwork, and that mobile quoting closes more jobs than office-based quoting (52% vs 34%, attributed to a ServiceTitan report) **(unverified, vendor marketing; do not repeat these numbers to customers until you confirm them)**.

**The competitor landscape**
| Product | Who it fits | Price (as reported 2026) | Known complaints |
|---|---|---|---|
| Jobber | Solo and small crews, up to ~15 people | ~$25-249/month, no setup fee | Light on reporting depth |
| Housecall Pro | Small to mid crews | ~$49 to $300+/month | Reported Android issues for some crews |
| ServiceTitan | Larger contractors | Not public; reported 5-10x Jobber/Housecall | Cost, long contracts, early-termination fees, onboarding time, overkill for under 5 techs |

**Where the gap might be (my hypothesis, needs checking)**
- Cheap tools handle scheduling and invoicing well, but the quote is still built by hand from a price list.
- Nobody I found clearly offers "photos plus voice note in, priced draft quote out" built for the small shop. Some vendors are adding AI add-ons (for example AI receptionists), so **you must check each competitor's current AI features before building**.
- The wedge is therefore narrow: the speed of creating the quote, not a full replacement for Jobber.

## 1.3 Target customer (first niche)
- **Who:** Residential HVAC repair and replacement companies with 1-10 technicians.
- **Buyer:** the owner or owner-operator.
- **Why this niche:** the owner feels the pain personally, decides alone, pays by card, and finds ServiceTitan too big and Jobber too generic.
- You can change the trade later (plumbing, electrical, solar), but pick one for now.

## 1.4 Hypotheses to test (with kill criteria)

| # | Hypothesis | Counts as confirmed if... |
|---|---|---|
| H1 | Quoting takes too long and costs jobs | 12 of 20 owners describe a real lost job or delay from slow quotes |
| H2 | Owners will trust an AI draft if they review it before sending | 10 of 20 say they'd use a draft they can edit |
| H3 | Existing tools don't solve this for small shops | 12 of 20 say they use Excel/paper/phone calls for quotes even if they own software |
| H4 | They will pay | 3 of 20 agree to a paid pilot or put down a deposit |
| H5 | Their price list can be digitized easily | 10 of 20 can send you their price list or a past quote within a week |

**Stop or change direction if** H1 or H4 fails clearly. Do not build anything until at least H1 and H3 pass.

## 1.5 Who to interview and how to find them
Target: **20-30 interviews, 15-20 minutes each.**

Where to find them:
- Google Maps: search "HVAC repair [your target city]", then call or visit shops with 1-10 trucks.
- Facebook groups and the r/HVAC subreddit (read first and follow the rules; don't spam).
- LinkedIn: search "owner HVAC" with a company size filter of 1-10.
- Local supply houses and distributors, where owners gather.
- Trade forums and Discord/WhatsApp groups for contractors.

Outreach message (short and honest):
> "Hi [Name], I'm researching how small HVAC companies handle quotes and paperwork. I'm not selling anything yet. Could I ask you 5 quick questions? 15 minutes, and I'll share what I learn from other owners."

## 1.6 Interview script

Rules: ask about **past behavior**, not opinions. Never pitch in the first 12 minutes. Take notes; ask "tell me about the last time that happened."

**Warm-up**
1. How many technicians do you have, and what kind of jobs do you do mostly?
2. How do customers find you?

**Quoting (the core)**
3. Walk me through the last quote you gave, from the moment the tech arrived to the moment the customer got a price.
4. How long did that take? How long before the customer heard back?
5. Have you ever lost a job because the quote was late? What happened?
6. Who builds the quote: the tech, you, or an office person? What do they use (Excel, paper, software, memory)?
7. How do you decide the price? Do you have a price list or price book?

**Paperwork**
8. After a job, what paperwork does the tech or office have to do?
9. What part of that do you or your team hate most?

**Current tools**
10. What software do you use today, if any? What do you like and dislike about it?
11. Have you tried something and quit it? Why?

**Money**
12. What do you pay monthly for software today?
13. If a tool cut a 30-minute quote to 3 minutes, what would that be worth to you?

**Closing**
14. Can I show you a quick prototype in two weeks?
15. Who else should I talk to?

**Only after all that, test the idea:**
> "Imagine the tech takes 5 photos and speaks for 30 seconds. A priced draft quote appears. You edit and send it. What would make you not trust that?"

## 1.7 Scoring sheet (copy into a spreadsheet)

| Interview # | Name/Company | Techs | Quote tool today | Time to quote | Lost job? (Y/N) | Pain 1-5 | Would pilot? | Would pay? | Price they said | Notes |
|---|---|---|---|---|---|---|---|---|---|---|

After each interview, record **exact phrases** the owner used. You'll reuse them on your landing page.

## 1.8 Competitor homework (2-3 hours)
- Start free trials of **Jobber** and **Housecall Pro**. Create a quote as a customer-facing technician would.
- Time how long it takes to produce a quote from scratch.
- Screenshot where it feels slow or clunky.
- Look for AI features in each product today.
- Read recent reviews on G2, Capterra and r/HVAC for "quote" and "estimate" complaints.

## 1.9 Pricing hypothesis (to test, not to trust)
- **Starter:** around $49/month per company for up to 3 technicians, plus roughly $15 per extra technician.
- Test it by asking in interviews: "Would $49/month be a no-brainer, expensive, or too cheap?"
- Anchor: Jobber starts near $25 and Housecall Pro near $49, so you must show a clear time-saving to justify it.

---

# PHASE 2: REQUIREMENTS

## 2.1 Product statement
> We help **small HVAC contractors** turn **job photos and a voice note** into **an accurate priced quote in under 3 minutes**, so they **close more jobs before the customer calls someone else.**

## 2.2 Users

| Persona | Needs | What they hate |
|---|---|---|
| **Owner (decision maker)** | Fast, correct quotes; control over prices; see jobs won/lost | Software that takes weeks to learn; quotes that undercut margin |
| **Technician (daily user)** | Quote at the customer's door from a phone; no typing | Typing on a phone; calling the office |
| **Office manager (optional)** | Review and send quotes; keep the price list updated | Retyping data twice |

For the MVP, **owner and technician can be the same login.** Do not build multi-role permissions yet.

## 2.3 MVP scope

### MUST HAVE (build these)
| ID | Feature |
|---|---|
| M1 | Sign up and log in (email and password or magic link); one company per account |
| M2 | Company price book: a simple list of items (name, unit, unit price, category) plus labor rate and markup; import from CSV; edit in the app |
| M3 | Create a job: customer name, phone, address, job type (repair, replacement, maintenance) |
| M4 | Add photos (up to 6) and notes by typing or voice dictation |
| M5 | **AI draft quote:** uses photos, notes and the price book to propose line items, quantities and labor hours |
| M6 | Review and edit the quote (add, remove, change lines; totals recalc) |
| M7 | Send quote: shareable link and a PDF; customer can view it and tap "Approve" |
| M8 | Jobs list with status: Draft, Sent, Approved, Lost |
| M9 | Basic dashboard: quotes sent, approved, total value, average time to send |

### LATER (explicitly not in the MVP)
Scheduling and dispatch, invoicing and payments, customer portal, good/better/best tiers, equipment history, SMS/WhatsApp sending, QuickBooks sync, multi-user roles, native iOS/Android apps, route optimization, robots/wearables.

### NON-GOALS
- Replacing Jobber or ServiceTitan.
- Handling payments in the MVP. Charge your first pilots manually (bank transfer, invoice).
- Perfect AI accuracy. The human review step is the safety net.

## 2.4 User stories and acceptance criteria

1. **As an owner, I can sign up and set my labor rate and markup** so quotes match my pricing.
   - Done when: a new user finishes setup in under 5 minutes.
2. **As an owner, I can import my price list from a spreadsheet** so I don't retype it.
   - Done when: a CSV with name, unit, price imports with errors highlighted by row.
3. **As a technician, I can create a job in under 30 seconds** from my phone.
   - Done when: 4 required fields only (customer name, phone, address, job type).
4. **As a technician, I can attach photos and dictate notes** so the AI has context.
   - Done when: up to 6 photos upload from the phone camera; text notes can be typed or dictated.
5. **As a technician, I get a draft quote within 30 seconds** of tapping "Generate."
   - Done when: lines come only from the price book, each has a quantity, and uncertain items are flagged.
6. **As an owner, I can edit every line before sending** so nothing goes out wrong.
   - Done when: totals update live; the app warns if the margin falls under a set minimum.
7. **As an owner, I can send the quote by link and PDF** and see when it was viewed.
   - Done when: the customer sees a clean page with no login and an Approve button.
8. **As an owner, I can see how many quotes I sent and won** this month.
   - Done when: dashboard shows the counts and total approved value.

## 2.5 AI quote behavior (spec)

**Inputs:** up to 6 photos, typed or dictated notes, job type, company price book, labor rate, markup %.

**Output (structured JSON):**
- `line_items[]`: price-book item ID, description, quantity, unit price, line total, reason
- `labor_hours` and `labor_total`
- `assumptions[]`: what the AI assumed
- `questions_for_tech[]`: what it could not tell from the photos
- `confidence`: low, medium or high, per line
- `total`

**Hard rules:**
1. **Only use items that exist in the price book.** If something is needed but missing, add it as a flagged "Unpriced item" with no price and tell the user.
2. **Never invent prices.**
3. If photos are unclear, list questions instead of guessing.
4. A human must approve before anything is sent to a customer.
5. Show the user *why* each line was suggested.

## 2.6 Data model (simple)

- **companies:** id, name, labor_rate, markup_percent, min_margin_percent
- **profiles:** id (links to auth user), company_id, name, role
- **price_items:** id, company_id, name, category, unit, unit_price
- **customers:** id, company_id, name, phone, address
- **jobs:** id, company_id, customer_id, created_by, job_type, notes, status, created_at
- **job_photos:** id, job_id, storage_path
- **quotes:** id, job_id, status, ai_raw_output, subtotal, labor_total, total, public_token, sent_at, viewed_at, approved_at
- **quote_lines:** id, quote_id, price_item_id (nullable), description, qty, unit_price, line_total, is_ai_suggested

Every table scoped by `company_id` with row-level security so one company can never see another's data.

## 2.7 Success metrics

| Metric | Target for first 30 days of use |
|---|---|
| Time from job created to quote sent | Under 5 minutes (aim for 3) |
| Share of AI lines kept unchanged | Over 60% |
| Pilot companies using it weekly | 3-5 |
| Paying pilots | At least 2 |
| Quotes sent per active company per week | 5 or more |

If after 4-8 weeks accepted-AI-lines is under 40% or pilots stop using it, revisit the AI or the niche.

## 2.8 Main risks and plan

| Risk | Mitigation |
|---|---|
| AI proposes wrong parts or prices | Price-book-only rule, mandatory human review, margin warning |
| Owners won't maintain a price book | Offer to enter it for the first pilots; provide a starter template |
| Photos are too poor to judge | Show a "what photos to take" guide; AI asks questions instead of guessing |
| Incumbents add AI | Move fast; deepen the data and workflow; focus on one trade |
| Customer data privacy | Row-level security, HTTPS, privacy policy, no sharing data between companies |

---

# PHASE 3: DESIGN

## 3.1 Design principles
1. **Phone first.** The technician uses this one-handed, possibly in sunlight with dirty hands: large tap targets (at least 44px), high contrast.
2. **Three taps to a quote.** New job, add photos, Generate.
3. **Plain language.** No jargon like "line item schema." Say "Items," "Labor," "Total."
4. **Trust by transparency.** Always show why the AI chose each line.
5. **Boring and clean.** No decoration; fast load; works on weak signal.

## 3.2 User flow

**Technician flow**
1. Log in, land on **Jobs**.
2. Tap **+ New Job**, enter customer name, phone, address and job type.
3. Add photos and notes.
4. Tap **Generate Quote**, then wait (progress shown).
5. Review lines, fix anything, check the total.
6. Tap **Send**, share the link or PDF.
7. Job moves to **Sent**; later it becomes **Approved** or **Lost**.

**Owner setup flow (first time only)**
1. Sign up, enter company name, labor rate, markup and minimum margin.
2. Import or add the price book.
3. Invite a technician (can be added later).

## 3.3 Screens and wireframes

### Screen 1: Login / Sign up
~~~
+---------------------------+
|        SiteQuote          |
|                           |
|  Email  [______________]  |
|  Password [___________]   |
|                           |
|  [      Log in       ]    |
|  New here? Create account |
+---------------------------+
~~~

### Screen 2: Jobs list (home)
~~~
+---------------------------+
| Jobs            [+ New]   |
| [All][Draft][Sent][Won]   |
|---------------------------|
| Ahmed Khan - AC repair    |
| 12 Oak St       Sent $480 |
|---------------------------|
| Sara Ali - Furnace replace|
| 8 Pine Rd      Draft  --  |
|---------------------------|
| Mike R. - Maintenance     |
| 3 Elm Ave   Approved $220 |
+---------------------------+
 [Jobs] [Dashboard] [Prices]
~~~

### Screen 3: New job
~~~
+---------------------------+
| < New Job                 |
| Customer name [_________] |
| Phone         [_________] |
| Address       [_________] |
| Job type  (o)Repair       |
|           ( )Replacement  |
|           ( )Maintenance  |
|                           |
| [ Add photos (0/6) ]      |
| Notes  [ type or tap mic ]|
|                           |
| [   Generate Quote   ]    |
+---------------------------+
~~~

### Screen 4: Quote review (most important screen)
~~~
+---------------------------+
| < Quote - Ahmed Khan      |
| AI draft - please review  |
|---------------------------|
| Items                     |
| Capacitor 45/5 MFD  x1    |
|   $38   [why?]  [edit][x] |
| Contactor 30A       x1    |
|   $42   [why?]  [edit][x] |
| (!) Unpriced: refrigerant |
|   [add price]             |
|---------------------------|
| Labor 1.5 h @ $95   $142  |
| Subtotal            $222  |
| Markup 20%           $44  |
| TOTAL               $266  |
| Margin OK (31%)           |
|---------------------------|
| Questions from AI:        |
| - Is the unit R-410A?     |
|---------------------------|
| [ + Add item ]            |
| [ Send quote ]            |
+---------------------------+
~~~

### Screen 5: Customer quote page (public link, no login)
~~~
+---------------------------+
| [Company logo / name]     |
| Quote for Ahmed Khan      |
| 12 Oak St                 |
|---------------------------|
| Capacitor replacement $38 |
| Contactor             $42 |
| Labor                $142 |
|---------------------------|
| Total               $266  |
|                           |
| [    Approve quote    ]   |
| Questions? Call [phone]   |
+---------------------------+
~~~

### Screen 6: Price book
~~~
+---------------------------+
| Price book  [Import CSV]  |
| Search [_______________]  |
|---------------------------|
| Capacitor 45/5   $38  >   |
| Contactor 30A    $42  >   |
| Thermostat basic $65  >   |
|---------------------------|
| Labor rate $95/h  [edit]  |
| Markup 20%        [edit]  |
| Min margin 25%    [edit]  |
+---------------------------+
~~~

### Screen 7: Dashboard
~~~
+---------------------------+
| This month                |
| Quotes sent       18      |
| Approved           7      |
| Approved value  $5,420    |
| Avg time to send  4m 10s  |
| AI lines kept     68%     |
+---------------------------+
~~~

## 3.4 Visual style

| Item | Choice |
|---|---|
| Layout | Mobile-first, single column, bottom tab bar (Jobs, Dashboard, Prices); desktop shows the same layout centered, max width ~720px for the technician side |
| Primary color | Deep blue `#1D4ED8` (trust) |
| Accent | Orange `#F97316` for primary buttons, since contractors recognize safety-orange |
| Success / warning / error | Green `#16A34A`, amber `#D97706`, red `#DC2626` |
| Background / text | White `#FFFFFF`, light gray `#F3F4F6`, text `#111827` |
| Font | Inter (system fallback) |
| Sizes | Body 16px, headings 20-24px, buttons at least 48px tall |
| Corners / spacing | 12px radius; 16px page padding |
| Components | shadcn/ui (buttons, inputs, tabs, dialogs, toasts) |
| Dark mode | Not needed in the MVP |

## 3.5 Copywriting tone
Short, direct, respectful of the trade. Examples:
- Button: "Generate quote", not "Initiate AI estimation."
- Empty state: "No jobs yet. Tap + New to start your first quote."
- AI notice: "Draft. Check prices before sending."

## 3.6 Test the design before building (do this yourself)
Show the wireframes above, or a quick Figma/Canva version, to 5 contractors from your interviews. Ask them to "create a quote" and watch where they hesitate. Fix the confusing parts before Phase 4.

---

## Phase 1-3 checklist (your to-dos before building)

- [ ] Complete 20+ interviews and fill in the scoring sheet
- [ ] H1 and H3 confirmed (otherwise change niche or idea)
- [ ] Collect **1-2 real price lists** and **5 past quotes** from friendly contractors
- [ ] Check competitor AI features (Jobber, Housecall Pro) today
- [ ] Confirm name and domain are available
- [ ] Show wireframes to 5 users and note changes
- [ ] Get at least 2-3 contractors who agree to be pilot users
