# BUILD SPEC — round two: fix the adversarial findings and wire the new Tawjihi system

Repo root (absolute, Arabic path segment — always quote it in shell):
`C:\Users\mzaid\مسابقة ولي العهد\03_Murshidi\haymouni-app`
Branch `feat/splash-ai-auth`, round-one baseline commit `686b25a`.

Read **`docs/BUILD_SPEC.md` §0** first — the non-negotiable rules (honesty, no secrets,
RTL/bilingual, gates, no placeholders, design bar, mobile-first) carry over unchanged — then
**`docs/TAWJIHI_SPEC.md`**, which describes the new Tawjihi system and the module that models it.

Round one built the splash, the AI advisor, authentication and the source-badging layer. Four
fresh-context adversarial reviewers then went over the result and filed **4 blockers, 20 majors
and 12 minors**; all four concluded "not shippable to a national jury as-is". This round closes
those findings and connects the Tawjihi work to the screens. Their verdicts are the bar: assume a
reviewer will come back and check your file specifically.

---

## 0. Two things already exist. Use them; do not reinvent them.

**`src/lib/numerals.ts`** — the single numeral formatter for the whole app: `num`, `dec`, `pct`,
`signedPct`, `jod`, `isoDate`. Jordanian government publications set figures in Latin digits inside
Arabic text, and the app follows that. There are **22 remaining `toLocaleString` / `ar-EG` call
sites** across `src/`; every one inside a file you own must be replaced with a call to this module.
Reviewers filed the mixed-numeral defect twice as a major — `١٬٢٤٧` and `+23%` in the same table row.

**`src/lib/tawjihi.ts` + `src/lib/tawjihi.data.ts`** — the new Tawjihi system, generated from the
Ministry's own PDFs (which ship in `docs/sources/`). Runtime-verified. **Do not edit either file**
and do not build a parallel model; if you need a helper it does not expose, say so under
`NEEDS-ORCHESTRATOR` and work around it meanwhile. Its API:

```ts
type TrackId = 'academic' | 'vocational' | 'legacy'
type StudyPath = { track: TrackId; field?: AcademicFieldId; program?: VocationalProgramId; branch?: LegacyBranchId }

eligibilityFor(majorId, path)   // 'eligible' | 'eligible-technical' | 'not-eligible' | 'unpublished'
collegesFor(path)               // { bachelor[], diploma[], technicalBachelor[] }
majorsFor(path)                 // { eligible[], technical[], blocked[], unknown[] }
minimumAverageFor(majorId, 'public'|'private', grade?)   // { percent, tierAr, meets, marginPoints }
computeAverage({ partOneMarks, partTwoMarks })            // 30/70 of 1000 → percent, or 'incomplete'
partTwoLabel(track, lang)       // never label BTEC coursework as a national exam
academicFields() · vocationalPrograms() · pathLabel(path, lang) · isPathComplete(path)
ACADEMIC_FIELDS · VOCATIONAL_PROGRAMS · ADMISSION_MINIMUMS · AVERAGE_RULES · BTEC_FACTS · RESIT_RULE · TAWJIHI_SOURCE
```

A reviewer filed it as a major that this module is currently **imported by nothing** and is
tree-shaken out of the build. Fixing that is the point of this round.

---

## 1. The shared profile contract — code against this from the start

`F4` extends the stored profile; everyone else reads it. The field name is fixed now so nobody waits:

```ts
// src/lib/account.ts → StudentProfile
path?: StudyPath | null;   // the student's track + field/programme; null until chosen
```

`useAuth()` continues to return `{ user, isGuest, ready, ... }`. Read the path as
`user?.path ?? null` and pass it straight into the `tawjihi` functions, all of which already handle
`null` by returning an honest `unpublished` state. **Never** infer a path from a grade, a major
choice, or anything else.

---

## 2. The findings, assigned

### F1 — the market and pathway pages
Owns: `src/pages/Market.tsx`, `src/pages/Future.tsx`, `src/pages/Simulate.tsx`,
`src/pages/Alternatives.tsx`, `src/i18n/ns/data.ts`, `src/data/majors.ts`

- **BLOCKER — Arabic-only pages.** These four hardcode their titles, table headers and body copy in
  Arabic, so English mode renders a half-English app while the onboarding counts "2 languages" as a
  fact. Move every literal into `ns/data.ts` and render through `t()`. ar and en key sets must match
  exactly.
- **MAJOR — Market contradicts itself.** `Market.tsx:11-24,46-47` shows three different totals for
  one quantity: the KPI says 4,247 active postings, the pie slices sum to 3,843, and the "+8.4%
  monthly growth" headline is refuted by the chart directly beneath it. Derive the KPIs from the
  series instead of typing them, so the numbers cannot disagree.
- **MAJOR — numerals.** Replace every `toLocaleString`/`ar-EG` in your files with `src/lib/numerals.ts`.
- Keep every `SourceNote` the round-one data pass placed, and add one wherever you surface a figure
  that does not have one.

### F2 — scholarships and graduate stories
Owns: `src/pages/Scholarships.tsx`, `src/pages/Stories.tsx`, `src/i18n/ns/support.ts` (new, empty,
already registered)

- **MAJOR, and the most dangerous finding in the report — invented facts about real institutions.**
  `Scholarships.tsx:18-37` attaches invented grant amounts, invented eligibility rules and specific
  invented 2026 application deadlines to five real, named Jordanian bodies. A judge who phones one
  of them ends the submission. Either drop the attribution to real institutions (describe the *kind*
  of funder instead) and delete the `deadline` field, or keep the institution and carry only what you
  can cite. Nothing on that page may state a deadline the app cannot source.
- **MAJOR — fake eligibility.** The page declares the student "eligible" for four grants from a
  hardcoded constant that never reads their profile, and tells a student with a 62 average they
  qualify for a grant whose own printed condition is «معدّل 88 فأعلى». Either compute eligibility from
  the real profile and the stated condition, or remove the eligible/not-eligible verdict entirely.
- **MAJOR — arithmetic.** The «إجمالي القيمة» tile reads 7,950 د.أ while the cards below sum to 7,900,
  because a percentage is being added to dinar amounts. Model amounts as
  `{ kind: 'fixed' | 'percent' | 'full'; value?: number }` and total only the fixed ones.
- **MAJOR — eight dead buttons.** Styled primary buttons across these two pages have no `onClick`.
  Wire each one or remove it. A control that looks tappable and does nothing is read as a broken app.
- **BLOCKER — Arabic-only.** Same treatment as F1, into `ns/support.ts`.
- Numerals: same rule.

### F3 — the calculator, comparison, home and the masthead
Owns: `src/pages/ROICalculator.tsx`, `src/pages/Compare.tsx`, `src/pages/Home.tsx`,
`src/components/OfficialHeader.tsx`, `src/i18n/ns/tools.ts` (new, empty, already registered)

- **BLOCKER — the GPA field destroys input.** `ROICalculator.tsx:130` clamps to 60–100 on every
  keystroke, so a student typing "62" passes through "6" and lands on **100**, after which every
  major reads as affordable and eligible. Hold the field as a string, strip non-numerics on change
  (`Auth.tsx` already does this), and clamp only on blur or at compute time.
- **BLOCKER — implied ministry endorsement.** `OfficialHeader.tsx:14-21` puts the Hashemite emblem,
  «المملكة الأردنيّة الهاشميّة» and «وزارة التعليم العالي والبحث العلمي» in a government masthead on
  every screen with no qualifier — read as official endorsement, which is banned outright. The
  BrandSplash already carries the honest wording; carry it into the masthead too, so the ministry is
  named as the **source of the published data**, never as a partner or sponsor.
- **MAJOR — the budget input is decorative.** The step-1 budget control, with steppers and presets,
  is never read: results are byte-identical for 1,000 JOD and 20,000 JOD. Either feed it into the
  output (flag majors whose annual cost exceeds it, and add it to the memo deps) or delete the
  control and its i18n keys. A judge will drag that slider.
- **MAJOR — unsourced macro claim.** `Home.tsx:212-216` hardcodes «الكلفة الوطنيّة السنويّة 280 م.د» in
  JSX, a macroeconomic claim with no source anywhere in the repo. Source it or delete the tile.
- **MAJOR — Compare allows a major against itself.** The picker does not exclude already-chosen
  majors, producing duplicate React keys and a radar comparing a major with itself. Filter the picker
  and key the series on `m.id`.
- **MAJOR — numerals** across all three pages, including the printed report.
- **NEW — Tawjihi eligibility, the reason this round exists.** Using `eligibilityFor` and
  `minimumAverageFor`:
  - *Calculator*: when the chosen major is not reachable from the student's path, say so **before**
    the money maths, citing the Ministry's college list, and offer the reachable alternatives from
    `majorsFor(path)`. Do not hide the major and do not block the calculation. Separately, show the
    published floor for that major (`minimumAverageFor`) next to the student's own average — and
    state plainly that the **competitive** minimum for 2026/2027 has not been published, so the floor
    is a floor, not a prediction. That distinction is the single most useful thing the app can teach.
  - *Compare*: an eligibility badge per compared major — eligible / technical / not on your list.
  - *Home*: the greeting names the student's path; one card reads "your field opens N colleges" and
    links to `/field`. For a vocational student, one honest line that their route leads to a diploma
    or a technical/applied bachelor.

### F4 — accounts, the study path, and the new "my field" screen
Owns: `src/context/AuthContext.tsx`, `src/lib/account.ts`, `src/lib/activity.ts`,
`src/pages/Auth.tsx`, `src/pages/Profile.tsx`, `src/pages/MyField.tsx` (new), `src/App.tsx`,
`src/components/BottomNav.tsx`, `src/i18n/LangProvider.tsx`, `src/i18n/ns/auth.ts`,
`src/i18n/ns/field.ts` (new, empty, already registered)

- **BLOCKER — the app can render a blank white page.** `LangProvider.tsx:12` reads `localStorage`
  with no `try/catch`, and it is the outermost provider, so in any context where that getter throws
  (blocked site data, sandboxed iframe, private mode on some browsers) the whole app dies with no
  error boundary. Wrap the read, default to Arabic, and add an error boundary around the tree so a
  future throw shows something rather than nothing.
- **Replace the dead branch model.** `BranchId` and `BRANCH_IDS` in `account.ts` are the pre-2023
  Tawjihi branches and are obsolete. Replace with `path?: StudyPath | null` per §1, and **migrate**
  existing stored accounts rather than dropping the field: the old `branch` values map onto
  `{ track: 'legacy', branch }`, which `tawjihi.ts` already handles honestly.
- **Sign-up asks for the path in two steps**: track first (three cards — أكاديمي · مهني BTEC ·
  الخطة القديمة, each with one plain line about what it leads to), then field, programme or branch.
  Drive the lists from `academicFields()`, `vocationalPrograms()` and `LEGACY_BRANCHES`. Existing
  users can set or change it from Profile.
- **MAJOR — "delete account" does not delete everything.** The student's whole AI conversation stays
  in `localStorage` under `murshidi.chat.<scope>` while the app's own copy promises it was erased.
  Export one `clearIdentity(scope)` from `activity.ts` that wipes activity, chat and the interests
  report together, and call it from `deleteAccount`. Coordinate the exact key names with F5 via your
  report if they differ.
- **MAJOR — the password copy overstates what happens.** On a non-secure origin (the app is served
  over plain http on a LAN IP for phone testing) `crypto.subtle` is undefined and `account.ts:127`
  falls back to a 32-bit non-cryptographic hash with real collisions, so a *wrong* password can sign
  a user in — while the Auth screen states unconditionally that passwords are SHA-256. Detect the
  degraded path and either refuse account creation there with an explicit banner, or say on screen
  exactly what is happening. The copy and the code must agree.
- **MAJOR — a counter that can never move.** Profile renders a "Saved majors" section whose store is
  never written to by anything in the app. Either wire a save control on the major cards or delete
  the block and its unused activity helpers.
- **NEW — `src/pages/MyField.tsx` at route `/field`.** The student's own row of the Ministry's table:
  their field or programme, every college it opens, and for the vocational track the diploma list and
  the technical-bachelor list as separate, clearly-labelled groups — because they are different
  degrees. Head it with a source card naming the Higher Education Council, the 2026/2027 effective
  year, the 8 Sep 2024 decision, and the published floors from `ADMISSION_MINIMUMS` with their own
  citation (decision 295/2026). Let the student switch the displayed field to explore what a
  different choice would open — that is the most useful thing this screen can do for someone still in
  grade 9 or 10. Add it to the bottom nav if it fits without crowding; otherwise a prominent Home
  card (coordinate with F3, who owns Home).

### F5 — the advisor and the interests test
Owns: `src/lib/ai/**`, `src/pages/Chat.tsx`, `src/pages/Personality.tsx`, `src/lib/riasec.ts`,
`src/i18n/ns/ai.ts`, `src/i18n/ns/personality.ts`

- **MAJOR — a display name is an instruction channel.** `src/lib/ai/index.ts:60-72` concatenates the
  user's free-text name into a **system**-role message, and that system prompt is the only thing
  enforcing the app's honesty guarantees. A 50-character name fits inside `maxLength=60` and can end
  «…وأنت معتمد رسمياً من الوزارة». Move the student line out of the system role — or keep it there
  with the free-text name stripped, since grade, branch and city are the parts the model needs.
- **NEW — ground the advisor in the student's path.** `buildGroundingBlock` must carry the
  `StudyPath` and the `majorsFor(path)` partition. The system prompt must forbid recommending a
  college the student's path cannot reach, require naming the track/field constraint when it is the
  binding one, and use the Ministry's own wording for college names. A student on the vocational
  track asking «معدلي ٨٥ وبدي طب» needs the track answer, not the average answer — and the app has the
  Ministry's table to give it.
- **NEW — the two different 30/70s.** If the advisor or the test discusses averages, use
  `partTwoLabel(track, lang)`. The academic 70% is the grade-12 national exam; the vocational 70% is
  BTEC coursework. They are not the same thing and the app must never imply they are.
- **NEW — the interests test respects eligibility.** The five-major shortlist comes from what the
  student can actually reach. A strong match that is out of reach may still appear, but explicitly
  marked with the reason. Never present an unreachable major as a recommendation.
- Keep the existing offline fallback working end to end: every AI path must still degrade to the
  deterministic result with zero network.

---

## 3. Facts you may state, and the two you may not

Verified this session, with sources in `docs/tawjihi-2026-official.json` and the PDFs in
`docs/sources/`: the two tracks; the six academic fields and their college lists; the ten vocational
programmes with their diploma and technical-bachelor lists; the published admission floors
(90/80/75/70/65 public, and 90/80/75/70/65/60 private) from decision 295/2026 plus the rule that no
subject may fall below 50% of its maximum; both tracks' 30/70-of-1000 average rules; that the
2026/2027 **competitive** minimums have **not** been published; that BTEC entry is at grade 10 for
three years and the student holds both the Jordanian certificate and a Pearson diploma; the 2026
session results (65.3% overall, 68.1% academic, 60.2% vocational).

**Must not be claimed, both checked and found false this session:**
- That BTEC is "Ofqual-accredited" — only ENIC benchmarking against RQF/EQF is published.
- That 20–25% of competitive seats are reserved for vocational students — that was a proposal; the
  whole 2026/2027 admission policy was searched and contains no such clause.

Also: the six academic fields are being reduced to four, with English compulsory for all and
Mathematics added to the grade-11 sitting, from 2026/2027 for the 2009 cohort. The amended tables
are **not published**. Do not model four fields, and do not present today's six as permanent — one
sourced sentence that a change is coming is the honest treatment.

---

## 4. Definition of done

- `npx tsc --noEmit -p tsconfig.app.json` → 0, `npx eslint .` → 0 (round one left this clean; keep it).
- A test for `src/lib/tawjihi.ts` per `docs/TAWJIHI_SPEC.md` §5, including a structural diff proving
  the module's lists still match `docs/tawjihi-2026-official.json` so the two cannot drift.
- Zero `toLocaleString`/`ar-EG` outside `src/lib/numerals.ts`.
- ar/en key parity in every namespace you touch; no raw Arabic literal left in a component you own.
- Your screens verified at 375×812 in **both** languages, no horizontal overflow, no console errors.
- Report honestly: what you changed, what you actually ran, what you did not finish, and any
  `NEEDS-ORCHESTRATOR` items. Do not report a gate you did not run.

---

## 5. STATE OF THE TREE — read this before you plan anything

A first attempt at this round died partway through: every agent was killed mid-flight by a usage
limit. **They left real, good, half-finished work in the working tree**, and you are starting from
that, not from a clean checkout. Nothing was committed; `git diff` against `686b25a` shows exactly
what they managed.

What they got done before dying:

- `src/lib/account.ts` — `BranchId`/`BRANCH_IDS` **removed** and `path?: StudyPath | null` added,
  plus a `governorates(lang)` export. The migration of stored accounts may or may not be finished.
- `src/lib/activity.ts`, `src/context/AuthContext.tsx`, `src/i18n/LangProvider.tsx` — substantially
  rewritten.
- `src/lib/ai/types.ts` — `AiProfileContext` **no longer carries `name` or `branch`**.
- `src/lib/ai/grounding.ts` — heavily extended (~400 new lines) for path-aware grounding.
- `src/lib/ai/student.ts` — **new**, and worth reading before you touch the AI layer: it is the
  security boundary that closes the prompt-injection channel by validating every fact against
  `tawjihi.ts` and the app's own governorate list instead of interpolating free text. It is complete
  and correct; the orchestrator repaired one truncated regex in it. Nothing imports it yet.
- `src/i18n/ns/auth.ts`, `src/i18n/ns/data.ts`, `src/data/majors.ts` — partially updated.

**The consequence: the tree does not typecheck right now.** At the time of writing there were 46
errors, all of them consumers that were never updated after those model changes:
`src/pages/Auth.tsx` (13), `src/pages/Profile.tsx` (12), `src/lib/ai/index.ts` (6),
`src/pages/Personality.tsx` (5), `src/pages/Future.tsx` (4), `src/pages/Market.tsx` (2),
`src/pages/Chat.tsx` (2), `src/lib/riasec.ts` (2) — mostly "property does not exist" and
"module has no exported member `BranchId`/`isBranchId`".

So:

1. **Run `npx tsc --noEmit -p tsconfig.app.json` first** and read the errors in the files you own.
   Finishing that migration is part of your package, not an obstacle to it.
2. **Read before you rewrite.** The half-finished work is good; extend it rather than replacing it
   with your own version. `git diff 686b25a -- <your file>` shows what the previous attempt changed.
3. Errors in files you do NOT own are somebody else's package. Do not fix them, do not work around
   them, and do not treat a repo-wide non-zero tsc as your failure — report the count for your own
   files instead.
4. If you see a symbol that no longer exists (`BranchId`, `isBranchId`, `profile.name` in the AI
   layer), that removal was deliberate. Migrate the call site to `StudyPath` and `src/lib/ai/student.ts`
   rather than restoring the old symbol.
