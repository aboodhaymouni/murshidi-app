# BUILD SPEC — the new Tawjihi system across the whole app

Repo root (absolute, Arabic path segment — quote it in shell):
`C:\Users\mzaid\مسابقة ولي العهد\03_Murshidi\haymouni-app`

Read `docs/BUILD_SPEC.md` first — its §0 non-negotiable rules (honesty, no secrets, RTL/bilingual,
gates, no placeholders, design bar, mobile-first) apply to every line of this round too.

**The authoritative dataset for this round is `docs/tawjihi-2026-official.json`.** It was transcribed
on 16 Sep 2026 by rendering the Ministry's own PDFs and reading the pages visually — text extraction
was NOT used, because these PDFs reorder Arabic lam ligatures (`المسار` extracts as `املسار`). Both
source PDFs ship in `docs/sources/`. Treat that JSON as ground truth. **Do not re-type any of its
lists from memory, do not "improve" a college name, and do not add a college that is not in it.**
If you think something is missing, it is missing from the Ministry's document, and that is a fact
the app should state rather than a gap the app should fill.

---

## 1. What actually changed in Jordan, and why the app is currently wrong

Jordan replaced the old Tawjihi branches (علمي، أدبي، إدارة معلوماتية، شرعي، صناعي، تجاري، فندقي،
زراعي) with a two-track structure. Students choose at the end of grade 9:

- **المسار الأكاديمي** — six *fields* (حقول), leading to a conventional bachelor's degree.
- **المسار المهني (BTEC)** — ten *programmes*, leading to **الدبلوم المتوسط** and the
  **البكالوريوس التقني/التطبيقي**, which is a different degree from the academic bachelor.

The Higher Education Council then published exactly which colleges each field and each programme may
enter, effective 2026/2027. That table is the single most decision-relevant fact for a Tawjihi
student choosing a major, and the app does not currently know it exists.

**The consequence the app must surface, because no competitor does:** a vocational-track student
cannot reach الطب البشري, العلوم الصيدلانية, التمريض or الحقوق at all — those appear only under
academic fields. But that same student *can* reach علوم الحاسوب, الذكاء الاصطناعي, هندسة مدنية and
هندسة العمارة, as a **technical/applied** bachelor. Telling a student that clearly, with the
Ministry's own document behind it, is worth more than every projected-salary chart in the app.

Today `src/lib/account.ts` / `src/context/AuthContext.tsx` carry a `BranchId` union built from the
OLD branch names. That union is dead. Replace it as described below.

---

## 2. The model — ALREADY BUILT, consume it, do not rewrite it

`src/lib/tawjihi.data.ts` and `src/lib/tawjihi.ts` **already exist in the working tree**. The
orchestrator wrote them, because fidelity to the Ministry's table is not something to delegate.
`tawjihi.data.ts` is generated from `docs/tawjihi-2026-official.json` by `scripts/gen-tawjihi.mjs`.

**Do not edit either file, and do not build a parallel implementation.** If you need a helper the
API does not expose, ask for it under `NEEDS-ORCHESTRATOR` and use what exists meanwhile. The one
thing you SHOULD add: an npm script `"tawjihi:gen": "node scripts/gen-tawjihi.mjs"` in
`package.json` (whoever owns package.json this round).

The API was runtime-verified on 16 Sep 2026 with these actual results, which are also the acceptance
cases for the test file in §5:

```
eligibilityFor('medicine',     {track:'academic',   field:'health'})        -> eligible (bachelor)
eligibilityFor('medicine',     {track:'academic',   field:'science-tech'})  -> not-eligible
eligibilityFor('medicine',     {track:'vocational', program:'it'})          -> not-eligible
eligibilityFor('cs',           {track:'academic',   field:'science-tech'})  -> eligible, explicit: true
eligibilityFor('cs',           {track:'vocational', program:'it'})          -> eligible-technical
eligibilityFor('data-science', {track:'academic',   field:'science-tech'})  -> eligible, explicit:false,
                                                              coveredBy: 'تكنولوجيا المعلومات'
eligibilityFor('law',          {track:'vocational', program:'business'})    -> not-eligible
eligibilityFor(any,            {track:'legacy',     branch:'scientific'})   -> unpublished
majorsFor({track:'vocational', program:'it'})
   -> eligible: [], technical: [cs, data-science, cyber],
      blocked: [medicine, pharmacy, nursing, civil-eng, architecture, media, law, business, accounting]
```

The exported surface you build against:

```ts
export type TrackId = 'academic' | 'vocational' | 'legacy';

export type AcademicFieldId =
  | 'health' | 'engineering' | 'science-tech' | 'languages-social' | 'law-sharia' | 'business';

export type VocationalProgramId =
  | 'engineering' | 'construction' | 'it' | 'art-design' | 'beauty'
  | 'creative-media' | 'travel-tourism' | 'hospitality' | 'business' | 'agriculture';

/** Students still finishing under the pre-2023 plan. Kept so the app serves them honestly. */
export type LegacyBranchId =
  | 'scientific' | 'literary' | 'informatics' | 'sharia'
  | 'industrial' | 'commercial' | 'hotel' | 'agricultural';

export interface StudyPath {
  track: TrackId;
  field?: AcademicFieldId;        // when track === 'academic'
  program?: VocationalProgramId;  // when track === 'vocational'
  branch?: LegacyBranchId;        // when track === 'legacy'
}

export type Eligibility =
  | { status: 'eligible'; degree: 'bachelor'; officialCollege: string;
      explicit: boolean; coveredBy?: string }
  | { status: 'eligible-technical'; degree: 'technical-bachelor'; via: VocationalProgramId;
      officialCollege: string; noteAr: string; noteEn: string }
  | { status: 'not-eligible'; reasonAr: string; reasonEn: string }
  | { status: 'unpublished'; reasonAr: string; reasonEn: string };

/** The whole point of this module. Never guesses. */
export function eligibilityFor(majorId: string, path: StudyPath): Eligibility;

/** Every college the Ministry lists for this path, for the "my field" screen. */
export function collegesFor(path: StudyPath): { ar: string; explicit: boolean }[];

/** Which of the app's majors this path can reach, partitioned. */
export function majorsFor(path: StudyPath): { eligible: string[]; technical: string[]; blocked: string[] };
```

Rules the implementation must obey:

- `explicit: false` means the Ministry named a **broader** college that covers this major (e.g.
  `data-science` is covered by `تكنولوجيا المعلومات`, `civil-eng` by `الهندسة`). Anywhere the UI shows
  such a major it must read «ضمن تكنولوجيا المعلومات» / "within Information Technology" — the app may
  never imply the document named it literally. The JSON records this in `explicit` and `coveredBy`.
- `track: 'legacy'` returns `status: 'unpublished'` for every major, with copy explaining that the
  2026/2027 table applies to the new plan and that old-plan students follow the admission rules
  published for their own year. **Do not invent a legacy mapping.** No official old-branch→college
  table was found for 2026/2027; saying so is correct, guessing is not.
- No throwing on unknown ids — return `unpublished` with an honest reason.

---

## 3. Where it has to show up

Nothing below is optional; "the data exists in a module" is not the deliverable.

**3.1 Onboarding / sign-up (`src/pages/Auth.tsx`, `src/context/AuthContext.tsx`)**
Replace the old branch dropdown with a two-step choice: track first (three cards — أكاديمي, مهني BTEC,
الخطة القديمة), then field or programme. Each option carries a one-line plain-Arabic description of
what it leads to. Persist as `StudyPath` on the profile, migrating any previously stored `branch`
value forward rather than dropping the user's data. The existing `grade` field stays.

**3.2 A new screen — «حقلي وكلياتي» (`src/pages/MyField.tsx`), routed at `/field`**
The student's own row of the official table: the field or programme, every college the Ministry
allows for it, and for the vocational track the diploma list and technical-bachelor list as separate,
clearly-labelled groups. Head it with a source card naming the Higher Education Council, the
2026/2027 effective year, the 8 Sep 2024 decision date, and a link to the PDF in `docs/sources/`.
Add a way to switch the displayed field so a student can explore what a different choice would open —
that is the single most useful thing this screen can do for someone still in grade 9 or 10.
Put it in the bottom nav if you can do so without crowding it; otherwise a prominent Home card.

**3.3 Home (`src/pages/Home.tsx`)**
The greeting states the student's path. One card: "your field opens N colleges" linking to `/field`.
If the student is on the vocational track, a single honest line that their route leads to a diploma
or a technical/applied bachelor.

**3.4 Calculator (`src/pages/ROICalculator.tsx`)**
When the chosen major is not reachable from the student's path, say so **before** the money maths,
kindly and specifically, citing the official college list, and offer the nearest reachable
alternatives from `majorsFor(path)`. Do not silently hide the major and do not block the calculation —
a student is allowed to explore. For the vocational track, label the degree as
بكالوريوس تقني/تطبيقي wherever the result names a degree.

**3.5 Compare (`src/pages/Compare.tsx`)**
An eligibility badge per compared major: eligible / technical / not available for your path.

**3.6 Interests test (`src/pages/Personality.tsx`)**
The five-major shortlist must be drawn from what the student can actually reach. If a strong match is
out of reach, it may still appear — but explicitly marked, with the reason. Never present an
unreachable major as a recommendation.

**3.7 The AI (`src/lib/ai/`, `src/pages/Chat.tsx`)**
`buildGroundingBlock` must include the student's `StudyPath` and the eligibility partition for it.
The system prompt must forbid recommending a college the student's path cannot reach, require the
model to name the track/field constraint when it is the binding one, and require it to use the
Ministry's own wording for college names. This is the highest-value grounding in the app — a student
asking "معدلي ٨٥ وبدي طب" who is on the vocational track needs to hear the track answer, not the
average answer.

---

## 4. Facts the app may state, and the ones it may not

**May state, sourced to the Higher Education Council decision (page dated 8 Sep 2024, effective
2026/2027), with the PDFs shipped in `docs/sources/`:** the two tracks; the six academic fields and
their college lists; the ten vocational programmes and their diploma and technical-bachelor lists;
that the vocational route leads to الدبلوم المتوسط and البكالوريوس التقني/التطبيقي; the `***`
military-college marker.

**Verified by the orchestrator on 16 Sep 2026, so the app MAY state it:** the 2026/2027 competitive
minimums (الحدود الدنيا التنافسية) have **not** been published by وحدة تنسيق القبول الموحد. What that
unit publishes is a database of the minimums for the five preceding years, offered explicitly as an
indicator for ranking choices — not as a 2026/2027 result. The app must say exactly that wherever it
shows an acceptance figure, and must link students to admhec.gov.jo for the historical database.

**May NOT state without a source you have verified in this session:** how the Tawjihi average is
computed under the new plan; the weighting of the grade-11 and grade-12 sittings; 2026 session dates,
candidate counts or pass rates; how many schools or students are on the BTEC track; any claim about
employer or foreign-university recognition of BTEC. Research on these was commissioned in parallel —
if a verified figure with a source URL and publication date reaches you, use it and cite it; **if it
does not, the app says the figure is not published rather than filling the gap.** "لم تُنشر بعد" is a
correct, respectable thing for a national platform to say, and a jury will respect it far more than a
confident wrong number.

The existing `averageAcceptance` values in `src/data/majors.ts` are indicative figures from the
previous build and are already badged illustrative by the data pass — they are **not** the published
2026/2027 minimums and nothing in this round may present them as such.

---

## 5. Done means

- `npx tsc --noEmit -p tsconfig.app.json` → 0, `npx eslint .` → 0, `npm run build` → success.
- A test file `src/lib/tawjihi.test.ts` (or the repo's existing test convention) asserting, at
  minimum: medicine is not eligible on any vocational programme; `cs` is `eligible` on
  `science-tech` and `eligible-technical` via the `it` programme; `data-science` returns
  `explicit: false` with `coveredBy: 'تكنولوجيا المعلومات'`; every legacy branch returns
  `unpublished`; and that the college lists in the module match `docs/tawjihi-2026-official.json`
  exactly (a structural diff, so the two can never drift).
- Every new string bilingual, RTL-correct, no raw literals outside i18n.
- Screens verified at 375×812 with no overflow and no console errors.
