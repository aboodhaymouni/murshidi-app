# BUILD SPEC — Murshidi round "splash + AI + auth + 100% ready"

Repo root (absolute): `C:\Users\mzaid\مسابقة ولي العهد\03_Murshidi\haymouni-app`
Branch: `feat/splash-ai-auth`. Baseline commit: `4389bcd`.
Stack: React 19, TypeScript 6, Vite 8, Tailwind 3, React Router 7 (**HashRouter**), Recharts 3, Capacitor 8, lucide-react.
Dev server already running on <http://localhost:5190> (do not start another one).

Owner of this file: the orchestrator. **Agents must not edit this file.**

---

## 0. NON-NEGOTIABLE RULES (apply to every agent)

1. **Honesty mandate.** This app is a Crown Prince Award 2026 submission judged by a national
   panel. **Never invent a number.** Every figure rendered in the UI must either (a) carry a
   named source, or (b) be visibly badged as illustrative. If you need a number you cannot
   source, do not write one — render the UI without it, or route it through the illustrative
   badge described in §5. Do not write "99%", "certified", "official partnership", or
   "approved by the Ministry" anywhere.
2. **No secrets in tracked files.** The OpenRouter key lives ONLY in `.env.local` (gitignored)
   and is read via `import.meta.env.VITE_OPENROUTER_KEY`. Never hardcode a key, never write one
   into `.env.example`, docs, comments, or test fixtures.
3. **Stay inside your file list.** Files are assigned per agent in §7. Editing a file you do not
   own corrupts a parallel agent's work. If you believe you need a file you do not own, write the
   need into your final report instead of editing it.
4. **RTL-first, bilingual.** Arabic is the default language and the primary direction. Every
   user-visible string goes through `t('key')` from `useLang()`; add keys to **your own**
   namespace file under `src/i18n/ns/`. Both `ar` and `en` objects must have identical key sets.
   Use logical CSS properties (`ps-*`, `pe-*`, `ms-*`, `me-*`, `text-start`, `text-end`) — never
   `pl-*`/`pr-*`/`text-left`/`text-right` for layout that must mirror.
5. **Gates before you finish.** `npx tsc -b` must print zero errors and `npx eslint .` zero
   errors, for the whole repo, after your change. Run them yourself. Do not report success on a
   build you did not run.
6. **No placeholders.** No `TODO`, `FIXME`, `lorem`, `[FILL]`, `coming soon`, or commented-out
   dead code in what you ship.
7. **Design bar.** Government-grade, restrained, Jordanian. The existing design tokens in
   `src/index.css` and `tailwind.config.js` (`gov-navy #013070`, `gov-gold`, `gov-green`,
   `gov-ink`, `gov-line`, `gov-bg`, `.gov-card`, `.btn-primary`, `.gov-badge`) are the system —
   extend it, never fight it. Banned: purple gradients, glassmorphism, emoji as UI icons,
   cream+terracotta palettes, Inter as a headline face. Arabic type is IBM Plex Sans Arabic /
   Noto Naskh Arabic, already loaded in `index.html`.
8. **Mobile first.** The target viewport is 390×844. Nothing may overflow horizontally. Tap
   targets ≥ 44px. The bottom nav is 64px tall plus safe area — content needs `pb-24`/`pb-28`.

---

## 1. Shared contract — Auth (implemented by A3, consumed by A2, A5)

Create `src/context/AuthContext.tsx` exporting exactly:

```ts
export interface StudentProfile {
  id: string;
  name: string;
  grade: number | null;        // Tawjihi average 0–100
  city: string;                // governorate, in the current language at signup time
  branch: BranchId | null;     // Tawjihi stream
  createdAt: string;           // ISO
}

export type BranchId = 'scientific' | 'literary' | 'health' | 'industrial' | 'commercial' | 'shariah' | 'informatics' | 'hotel' | 'agricultural';

export interface AuthValue {
  user: StudentProfile | null;   // null = not signed in
  isGuest: boolean;              // true when the visitor chose "continue as guest"
  ready: boolean;                // false until localStorage has been read once
  signIn(name: string, password: string): Promise<AuthResult>;
  signUp(input: SignUpInput): Promise<AuthResult>;
  signOut(): void;
  continueAsGuest(): void;
  updateProfile(patch: Partial<Omit<StudentProfile, 'id' | 'createdAt'>>): void;
  deleteAccount(): void;
}

export function useAuth(): AuthValue;
export function AuthProvider(props: { children: React.ReactNode }): React.ReactElement;
```

`AuthResult` stays shaped like the existing one in `src/lib/account.ts`
(`{ ok: boolean; user?: StudentProfile; error?: ... }`).

`AuthProvider` wraps the app **inside** `LangProvider` in `src/main.tsx`.

---

## 2. Shared contract — AI (implemented by A2, consumed by A5)

Create `src/lib/ai/index.ts` exporting exactly:

```ts
export interface AiProfileContext {
  name?: string;
  grade?: number | null;
  branch?: string | null;
  city?: string | null;
  lang: 'ar' | 'en';
}

export interface AskOptions {
  history?: { role: 'user' | 'assistant'; content: string }[];
  profile?: AiProfileContext;
  signal?: AbortSignal;
  onToken?: (chunk: string) => void;   // called for each streamed delta
  system?: string;                     // overrides the default advisor prompt
  json?: boolean;                      // ask the model for strict JSON output
  maxTokens?: number;
}

export interface AiResult {
  text: string;
  model: string;          // the model id that actually answered
  source: 'ai' | 'local'; // 'local' = every remote attempt failed, rule-based answer
}

export function askAi(prompt: string, opts?: AskOptions): Promise<AiResult>;
export function aiStatus(): { configured: boolean; model: string };
export function buildGroundingBlock(lang: 'ar' | 'en', path?: StudyPath | null): string;
```

Requirements for `askAi`:

- Model chain, tried in order, each with the next one as fallback:
  1. `google/gemma-4-31b-it:free`  ← the model Zaid asked for, the default
  2. `google/gemma-4-26b-a4b-it:free`
  3. `google/gemma-4-31b-it` (paid; the key is capped at $0.10 so this is a few hundred answers)
  4. rule-based local answer → `source: 'local'`
- **Verified live on 16 Sep 2026:** all three model ids exist on OpenRouter, and the free tier
  was returning HTTP 429 `"temporarily rate-limited upstream"` from the shared Google AI Studio
  pool. The chain and the retry are therefore load-bearing, not decoration. Retry a 429 once with
  ~700ms backoff before moving to the next model.
- Endpoint `https://openrouter.ai/api/v1/chat/completions`, headers `Authorization: Bearer <key>`,
  `HTTP-Referer` from `VITE_OPENROUTER_REFERER`, `X-Title: Murshidi`.
- Streaming via `stream: true` + SSE parsing when `onToken` is supplied; non-streaming otherwise.
- Honour `signal` so a page unmount aborts the request.
- Key resolution order: `localStorage['murshidi.or.key']` override → `import.meta.env.VITE_OPENROUTER_KEY`.
- `buildGroundingBlock` returns a compact text block of the REAL app data (the majors table from
  `src/data/majors.ts`: name, acceptance average, government tuition, duration, category) so the
  model answers from app data instead of memorised numbers. **Widened in round two** (see
  `docs/TAWJIHI_SPEC.md` §3.7): it takes the student's `StudyPath` as an optional second argument
  and appends the `majorsFor(path)` partition, so the prompt can forbid recommending a college the
  path cannot reach. The argument is optional, so the round-one call shape still compiles.
- The system prompt must instruct the model, in Arabic: answer in the user's language, use only
  the supplied data block for figures, say "لا أعرف" rather than inventing a number, keep answers
  short and numbered, always close by pointing at a concrete app tool, and never present itself as
  a licensed counsellor. It must NOT contain hardcoded unemployment rates or salaries — those come
  from the grounding block.

---

## 3. Shared contract — illustrative data badge (implemented by A4)

Create `src/data/sources.ts` and `src/components/SourceNote.tsx`:

```ts
export type SourceId = 'dos-q2-2026' | 'mohe-2026' | 'admhec-2026' | 'illustrative';
export interface SourceRef { id: SourceId; labelAr: string; labelEn: string; url?: string; }
export const SOURCES: Record<SourceId, SourceRef>;
export function isIllustrative(id: SourceId): boolean;
```

```tsx
// Renders either a cited source line or the illustrative badge.
export default function SourceNote(props: { source: SourceId; className?: string }): React.ReactElement;
```

Illustrative badge copy — Arabic: «مثال توضيحي • ليست بيانات رسمية»,
English: "Illustrative example • not official data". Style it with the existing
`gov-badge gov-badge-neutral` classes (amber accent is acceptable), small, never shouting.

---

## 4. Work package A1 — Splash & brand

**The bug, verified in the browser at 375×812 on 16 Sep 2026:**
`public/favicon.svg` (= `icon.svg`, 1254×1254) is a *complete* app icon: navy rounded-square
background, white book + pen mark, gold star, and the wordmark «مُرشِدي / MURSHIDI» already drawn
inside it. `src/pages/Splash.tsx` currently renders that SVG at 96px **inside another**
`w-32 h-32 rounded-3xl bg-gov-navy` box and additionally passes `showText variant="wordmark"`,
so `MizanLogo` prints the brand name a second time in `text-gov-navy` on top of the navy tile —
invisible — while the flex row pushes that duplicate text outside the tile on the left. On top of
that, the skip button, the progress pills and the whole back/next action bar all render during the
logo phase, so there is no clean brand moment at all.

**Deliver:**

1. A real brand splash as its own component `src/components/BrandSplash.tsx`:
   the SVG mark alone, centred, sized ~132px, **no outer coloured box, no duplicate wordmark**
   (the SVG already has it), on a white field with the existing `.gov-strip` at the top.
   Beneath it: the tagline, and at the bottom the national line
   («المملكة الأردنيّة الهاشميّة» / «وزارة التعليم العالي والبحث العلمي») using the existing
   `HashemiteEmblem` component. A restrained entry animation: mark fades + scales from 0.92 → 1
   over ~500ms, tagline fades in ~200ms later, then a slow gold hairline progress bar completes
   over the remaining hold. Total hold 1600–2000ms. Respect `prefers-reduced-motion`.
2. `Splash.tsx` renders `<BrandSplash/>` alone during the brand phase — the skip button, the
   indicator pills and the action bar must be **completely absent** (not just transparent) until
   the slides phase begins.
3. Returning users (already onboarded) still see the brand splash briefly, then go to `/home`;
   they must never see the onboarding slides again.
4. The four onboarding slides stay, but every stat value in them must be sourced or removed —
   check §0 rule 1. `100K`, `26.4%`, `50K+`, `600+ graduates` are currently unsourced claims in
   `src/i18n/ns/splash.ts`/`core.ts` copy; replace with figures you can attribute in-copy, or drop
   the stat pair for that slide. You own `src/i18n/ns/splash.ts`; the four `splash.*` keys that
   already live in `src/i18n/core.ts` may be **overridden** by redefining the same key in your
   namespace (namespaces are spread after core).
5. Native: keep the Android 12+ splash working. Re-run `node scripts/generate-splash.mjs` after any
   asset change so `android/app/src/main/res/**/splash.png` matches. Set
   `capacitor.config.ts` `appId` to `jo.vcoders.murshidi` and `appName` to `مُرشِدي`.
   Add `@capacitor/splash-screen` (`npm i @capacitor/splash-screen`), configure
   `launchAutoHide: false` + `backgroundColor: '#FFFFFF'`, and hide it from `BrandSplash` on mount
   so there is no white flash between the native splash and the web splash. Guard the import so
   the web build still works outside Capacitor.
6. `index.html`: `<title>` and meta description must not claim a Ministry partnership. Replace
   «بالشراكة مع وزارة التعليم العالي والبحث العلمي» with a factual line such as
   «تعتمد على البيانات المنشورة من وزارة التعليم العالي ودائرة الإحصاءات العامّة».
   Same correction in `package.json` `description` — you own that field only.

---

## 5. Work package A4 — honest data layer

Zaid's decision (16 Sep 2026): **badge, do not delete.** `src/data/majors.ts` carries a header
comment claiming its figures come from "DOS Jordan + Ministry of Higher Education + Akhtaboot/Bayt".
Those per-major salaries, unemployment rates, job-opening counts, 2030 growth percentages and
satisfaction scores are inherited from the April build and are **not** traceable to a published
source. Do not delete them and do not re-source them by guessing.

1. Add a `source: SourceId` field to the `Major` interface and set it honestly per field group.
   Where a whole record is unsourced, mark it `'illustrative'`.
2. Correct the misleading header comment.
3. Every page that renders these numbers must show `<SourceNote source=… />` near them:
   `Home`, `Market`, `Compare`, `Future`, `Stories`, `Scholarships`, `Simulate`, `Alternatives`,
   `ROICalculator`.
4. Where a *real* published figure is available and already in the app's copy (e.g. the
   2025 competitive minimums, DOS Q2 2026 unemployment), cite it explicitly rather than badging it.
5. The acceptance averages (`averageAcceptance`) are the most load-bearing numbers in the app —
   the calculator and the AI both key off them. Leave the values alone, but label them for what
   they are: indicative averages, not the published 2026/2027 competitive minimums, which had not
   been released at the time of writing.

---

## 6. Work package A5 — AI personality test

Keep the existing 12 RIASEC questions and their deterministic scoring — a jury can check
arithmetic, and a deterministic core is the defensible part. Add the AI **on top**:

1. Translate the 12 questions and the six trait names into English in `src/i18n/ns/personality.ts`
   (the page is Arabic-only today) and drive the page from `t()`.
2. After the 12 answers, request **3 adaptive follow-up questions** from `askAi` with `json: true`,
   generated from the student's top two traits, their grade and branch. Render them in the same
   card style with 4 options each. If the AI call fails, skip straight to the report — the test
   must still complete with zero network.
3. Produce an **AI narrative report**: personality pattern, three strengths, two honest cautions,
   and a ranked shortlist of five majors drawn **only** from `majorsData`, each with one sentence
   on why it fits *this* student and a realistic note about their average vs. the major's
   acceptance average. Stream it with `onToken` so it renders progressively.
4. Label it: «تحليل بمساعدة الذكاء الاصطناعي — إرشادي وليس تقييماً نفسيّاً معتمداً» /
   "AI-assisted analysis — guidance, not a certified psychometric assessment."
   Remove the current methodology claim about "نموذج RIASEC المُكيَّف للسياق العربي" and
   "تطابق ذكي لأنماط شخصيّات الخرّيجين الناجحين" — neither is true. Say plainly that this is a
   RIASEC-style interests reflection.
5. Persist the last report per signed-in user (`murshidi.riasec.<userId>`) so Profile can list it.
   Guests get a session-only report.
6. Keep the radar chart. Keep a working "retake" action.

---

## 7. File ownership — do not cross these lines

| Agent | Owns (exclusive write access) |
|---|---|
| **A1 splash** | `src/pages/Splash.tsx`, `src/components/BrandSplash.tsx`*, `src/components/MizanLogo.tsx`, `src/components/HashemiteEmblem.tsx`, `src/i18n/ns/splash.ts`, `scripts/generate-splash.mjs`, `android/**`, `capacitor.config.ts`, `index.html`, `public/**`, `package.json` (description + the `@capacitor/splash-screen` dep only) |
| **A2 ai+chat** | `src/lib/ai/**`*, `src/lib/openrouter.ts`, `src/pages/Chat.tsx`, `src/i18n/ns/ai.ts`, `.env.example` |
| **A3 auth** | `src/lib/account.ts`, `src/lib/activity.ts`*, `src/context/AuthContext.tsx`*, `src/components/RequireAuth.tsx`*, `src/pages/Auth.tsx`, `src/pages/Profile.tsx`, `src/App.tsx`, `src/main.tsx`, `src/components/BottomNav.tsx`, `src/components/PageHeader.tsx`, `src/i18n/ns/auth.ts` |
| **A4 data** | `src/data/majors.ts`, `src/data/sources.ts`*, `src/components/SourceNote.tsx`*, `src/i18n/ns/data.ts`, `src/pages/Home.tsx`, `src/pages/Market.tsx`, `src/pages/Compare.tsx`, `src/pages/Future.tsx`, `src/pages/Stories.tsx`, `src/pages/Scholarships.tsx`, `src/pages/Simulate.tsx`, `src/pages/Alternatives.tsx`, `src/pages/ROICalculator.tsx` |
| **A5 personality** | `src/pages/Personality.tsx`, `src/lib/riasec.ts`*, `src/i18n/ns/personality.ts` |
| orchestrator only | `src/i18n/translations.ts`, `src/i18n/core.ts`, `src/index.css`, `tailwind.config.js`, `docs/**`, `.gitignore`, `vite.config.ts` |

`*` = file does not exist yet, you create it.

**Shared-file requests:** if you need a change in `src/index.css`, `tailwind.config.js` or
`src/i18n/core.ts`, put the exact snippet in your final report under a heading
`NEEDS-ORCHESTRATOR` and carry on without it. Prefer a local `<style>`-free solution:
Tailwind utilities and inline `style` objects are fine.

---

## 8. Definition of done (every agent)

- `npx tsc -b` → 0 errors (repo-wide), `npx eslint .` → 0 errors.
- Your pages render at 375×812 with no horizontal overflow and no console errors.
- Every string bilingual, RTL correct, Arabic renders without mojibake.
- No invented numbers; unsourced figures badged.
- Report back: what changed, what you verified and how, what you could not do, and any
  `NEEDS-ORCHESTRATOR` snippets. Be honest about what you did not test.
