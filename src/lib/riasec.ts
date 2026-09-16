// The interests test: deterministic core, AI layer on top.
//
// Why the split matters. A jury can check arithmetic; it cannot check a model's
// mood. So everything that decides the OUTCOME lives here as plain arithmetic:
// twelve fixed questions, one interest letter and a fixed weight per option, a
// sum, a ranking, and a match index whose formula is printed on the report.
// Run the same answers twice and you get the same report, with no network.
//
// The model adds two things and nothing else:
//   1. three follow-up questions, whose weights are clamped and whose points are
//      shown in their own column so the fixed core stays separately auditable;
//   2. a written commentary — in which EVERY figure it is asked to state is
//      pre-computed here and handed to it verbatim, so it never does arithmetic
//      and never reaches for a number it remembers.
//
// The shortlist is always resolved against src/data/majors.ts, so the model
// cannot introduce a programme that does not exist in the app.
//
// Round two adds the second filter that decides an outcome: the student's own
// row of the Higher Education Council table. A major the Ministry's document
// does not open to this student's track is never presented as a recommendation,
// however well it matches their interests — it is shown separately, named as a
// strong interest match, with the official reason it is closed.

import { majorsData } from '../data/majors';
import type { Major } from '../data/majors';
import type { SourceId } from '../data/sources';
import { categoryLabel, majorName } from './ai/grounding';
import { readStudyPath } from './ai/student';
import { eligibilityFor, isPathComplete, partTwoLabel, pathConstrainsChoices, pathLabel } from './tawjihi';
import type { Eligibility, StudyPath } from './tawjihi';
import type { Lang, TranslationKey } from '../i18n/translations';

export type Trait = 'R' | 'I' | 'A' | 'S' | 'E' | 'C';

export const TRAITS: readonly Trait[] = ['R', 'I', 'A', 'S', 'E', 'C'];

export type TraitScores = Record<Trait, number>;

export interface RiasecOption {
  textKey: TranslationKey;
  trait: Trait;
  weight: number;
}

export interface RiasecQuestion {
  /** 1-based, and the same number used in the i18n keys. */
  n: number;
  textKey: TranslationKey;
  options: RiasecOption[];
}

/**
 * The twelve fixed questions. Traits and weights are carried over unchanged
 * from the April build on purpose: the instrument is the auditable part, so it
 * is not quietly re-tuned in the same round that adds a model to the page.
 */
export const RIASEC_QUESTIONS: RiasecQuestion[] = [
  {
    n: 1,
    textKey: 'personality.q1.text',
    options: [
      { textKey: 'personality.q1.o1', trait: 'I', weight: 3 },
      { textKey: 'personality.q1.o2', trait: 'A', weight: 3 },
      { textKey: 'personality.q1.o3', trait: 'R', weight: 3 },
      { textKey: 'personality.q1.o4', trait: 'E', weight: 3 },
    ],
  },
  {
    n: 2,
    textKey: 'personality.q2.text',
    options: [
      { textKey: 'personality.q2.o1', trait: 'I', weight: 3 },
      { textKey: 'personality.q2.o2', trait: 'A', weight: 3 },
      { textKey: 'personality.q2.o3', trait: 'E', weight: 3 },
      { textKey: 'personality.q2.o4', trait: 'S', weight: 3 },
    ],
  },
  {
    n: 3,
    textKey: 'personality.q3.text',
    options: [
      { textKey: 'personality.q3.o1', trait: 'E', weight: 3 },
      { textKey: 'personality.q3.o2', trait: 'C', weight: 3 },
      { textKey: 'personality.q3.o3', trait: 'A', weight: 3 },
      { textKey: 'personality.q3.o4', trait: 'I', weight: 3 },
    ],
  },
  {
    n: 4,
    textKey: 'personality.q4.text',
    options: [
      { textKey: 'personality.q4.o1', trait: 'I', weight: 3 },
      { textKey: 'personality.q4.o2', trait: 'A', weight: 3 },
      { textKey: 'personality.q4.o3', trait: 'S', weight: 3 },
      { textKey: 'personality.q4.o4', trait: 'E', weight: 3 },
    ],
  },
  {
    n: 5,
    textKey: 'personality.q5.text',
    options: [
      { textKey: 'personality.q5.o1', trait: 'R', weight: 2 },
      { textKey: 'personality.q5.o2', trait: 'I', weight: 2 },
      { textKey: 'personality.q5.o3', trait: 'E', weight: 3 },
      { textKey: 'personality.q5.o4', trait: 'C', weight: 2 },
    ],
  },
  {
    n: 6,
    textKey: 'personality.q6.text',
    options: [
      { textKey: 'personality.q6.o1', trait: 'I', weight: 3 },
      { textKey: 'personality.q6.o2', trait: 'A', weight: 3 },
      { textKey: 'personality.q6.o3', trait: 'C', weight: 3 },
      { textKey: 'personality.q6.o4', trait: 'R', weight: 3 },
    ],
  },
  {
    n: 7,
    textKey: 'personality.q7.text',
    options: [
      { textKey: 'personality.q7.o1', trait: 'E', weight: 3 },
      { textKey: 'personality.q7.o2', trait: 'I', weight: 2 },
      { textKey: 'personality.q7.o3', trait: 'S', weight: 2 },
      { textKey: 'personality.q7.o4', trait: 'A', weight: 2 },
    ],
  },
  {
    n: 8,
    textKey: 'personality.q8.text',
    options: [
      { textKey: 'personality.q8.o1', trait: 'A', weight: 2 },
      { textKey: 'personality.q8.o2', trait: 'R', weight: 2 },
      { textKey: 'personality.q8.o3', trait: 'I', weight: 2 },
      { textKey: 'personality.q8.o4', trait: 'S', weight: 2 },
    ],
  },
  {
    n: 9,
    textKey: 'personality.q9.text',
    options: [
      { textKey: 'personality.q9.o1', trait: 'I', weight: 3 },
      { textKey: 'personality.q9.o2', trait: 'S', weight: 3 },
      { textKey: 'personality.q9.o3', trait: 'E', weight: 3 },
      { textKey: 'personality.q9.o4', trait: 'A', weight: 3 },
    ],
  },
  {
    n: 10,
    textKey: 'personality.q10.text',
    options: [
      { textKey: 'personality.q10.o1', trait: 'R', weight: 3 },
      { textKey: 'personality.q10.o2', trait: 'I', weight: 3 },
      { textKey: 'personality.q10.o3', trait: 'A', weight: 3 },
      { textKey: 'personality.q10.o4', trait: 'S', weight: 3 },
    ],
  },
  {
    n: 11,
    textKey: 'personality.q11.text',
    options: [
      { textKey: 'personality.q11.o1', trait: 'I', weight: 3 },
      { textKey: 'personality.q11.o2', trait: 'S', weight: 3 },
      { textKey: 'personality.q11.o3', trait: 'C', weight: 3 },
      { textKey: 'personality.q11.o4', trait: 'A', weight: 3 },
    ],
  },
  {
    n: 12,
    textKey: 'personality.q12.text',
    options: [
      { textKey: 'personality.q12.o1', trait: 'C', weight: 3 },
      { textKey: 'personality.q12.o2', trait: 'I', weight: 3 },
      { textKey: 'personality.q12.o3', trait: 'A', weight: 3 },
      { textKey: 'personality.q12.o4', trait: 'E', weight: 3 },
    ],
  },
];

export const CORE_QUESTION_COUNT = RIASEC_QUESTIONS.length;
export const ADAPTIVE_QUESTION_COUNT = 3;

/** Trait name keys, so the page never assembles a translation key from a letter. */
export const TRAIT_KEYS: Record<Trait, { name: TranslationKey; short: TranslationKey; desc: TranslationKey }> = {
  R: { name: 'personality.trait.R', short: 'personality.trait.R.short', desc: 'personality.trait.R.desc' },
  I: { name: 'personality.trait.I', short: 'personality.trait.I.short', desc: 'personality.trait.I.desc' },
  A: { name: 'personality.trait.A', short: 'personality.trait.A.short', desc: 'personality.trait.A.desc' },
  S: { name: 'personality.trait.S', short: 'personality.trait.S.short', desc: 'personality.trait.S.desc' },
  E: { name: 'personality.trait.E', short: 'personality.trait.E.short', desc: 'personality.trait.E.desc' },
  C: { name: 'personality.trait.C', short: 'personality.trait.C.short', desc: 'personality.trait.C.desc' },
};

/** The Holland tags used in src/data/majors.ts, mapped to this module's letters. */
const TAG_TO_TRAIT: Record<string, Trait> = {
  Realistic: 'R',
  Investigative: 'I',
  Artistic: 'A',
  Social: 'S',
  Enterprising: 'E',
  Conventional: 'C',
};

/** Weight of a major's first, second and third interest tag. */
const TAG_WEIGHTS = [1, 0.7, 0.5];

export function emptyScores(): TraitScores {
  return { R: 0, I: 0, A: 0, S: 0, E: 0, C: 0 };
}

export function addScore(scores: TraitScores, trait: Trait, weight: number): TraitScores {
  return { ...scores, [trait]: scores[trait] + weight };
}

export function sumScores(a: TraitScores, b: TraitScores): TraitScores {
  const out = emptyScores();
  for (const trait of TRAITS) out[trait] = a[trait] + b[trait];
  return out;
}

/**
 * Interests ranked high to low. Ties break on the fixed RIASEC letter order so
 * the same answers always produce the same ranking.
 */
export function rankTraits(scores: TraitScores): Trait[] {
  return [...TRAITS].sort((a, b) => scores[b] - scores[a] || TRAITS.indexOf(a) - TRAITS.indexOf(b));
}

export interface MajorMatch {
  major: Major;
  /** 0–100 internal ordering index. Not an admission chance. */
  fit: number;
}

/**
 * Match index = Σ(tagWeight × yourPoints(tag) ÷ yourHighestScore) ÷ Σ(tagWeight).
 *
 * A tag this module does not recognise still counts in the denominator, so a new
 * tag added to majors.ts lowers that major's index instead of silently inflating it.
 */
export function matchMajors(scores: TraitScores): MajorMatch[] {
  const peak = Math.max(1, ...TRAITS.map((trait) => scores[trait]));
  return majorsData
    .map((major) => {
      let weighted = 0;
      let weightSum = 0;
      major.matchedPersonality.forEach((tag, index) => {
        const weight = TAG_WEIGHTS[index] ?? TAG_WEIGHTS[TAG_WEIGHTS.length - 1];
        weightSum += weight;
        const trait = TAG_TO_TRAIT[tag];
        if (trait) weighted += weight * (scores[trait] / peak);
      });
      const fit = weightSum > 0 ? Math.round((weighted / weightSum) * 100) : 0;
      return { major, fit };
    })
    .sort((a, b) => b.fit - a.fit || a.major.id.localeCompare(b.major.id));
}

export const SHORTLIST_SIZE = 5;

/** What the Ministry's table says about a matched major for this student's path. */
export type PathVerdict = 'open' | 'technical' | 'closed' | 'unchecked';

export interface ShortlistEntry extends MajorMatch {
  verdict: PathVerdict;
  /** The tawjihi module's own answer, so the UI can quote its wording verbatim. */
  eligibility: Eligibility;
}

export interface ShortlistResult {
  /**
   * What the app recommends: high-interest majors this student's path actually
   * opens. With no usable path every entry is `unchecked` and the app makes no
   * eligibility claim at all.
   */
  recommended: ShortlistEntry[];
  /**
   * Majors that ranked inside the top five on interest alone but that the
   * official table does not open to this path. Shown, never recommended, always
   * with the reason — a student is owed the fact that their strongest match is
   * closed to them, and owed the reason it is closed.
   */
  blocked: ShortlistEntry[];
  /** True when eligibility was actually checked (a complete academic/vocational path). */
  pathChecked: boolean;
}

function entryFor(match: MajorMatch, path: StudyPath | null): ShortlistEntry {
  const eligibility = eligibilityFor(match.major.id, path);
  const verdict: PathVerdict =
    eligibility.status === 'eligible'
      ? 'open'
      : eligibility.status === 'eligible-technical'
        ? 'technical'
        : eligibility.status === 'not-eligible'
          ? 'closed'
          : 'unchecked';
  return { ...match, verdict, eligibility };
}

/**
 * The five majors the report recommends, and the strong matches the student's
 * track closes off.
 *
 * `path` null, incomplete, or on the previous plan means eligibility is
 * unpublished for every major — the shortlist then falls back to interest order
 * alone and the report says so, rather than inventing a verdict.
 */
export function shortlistFor(scores: TraitScores, path: StudyPath | null): ShortlistResult {
  const ranked = matchMajors(scores);
  const usable = isPathComplete(path) ? path : null;

  if (!usable) {
    return {
      recommended: ranked.slice(0, SHORTLIST_SIZE).map((match) => entryFor(match, null)),
      blocked: [],
      pathChecked: false,
    };
  }

  const entries = ranked.map((match) => entryFor(match, usable));
  const recommended = entries
    .filter((entry) => entry.verdict === 'open' || entry.verdict === 'technical')
    .slice(0, SHORTLIST_SIZE);
  // "Strong match" is defined by the interest ranking alone: these are the
  // majors that would have made the top five had the table not closed them.
  const blocked = entries.slice(0, SHORTLIST_SIZE).filter((entry) => entry.verdict === 'closed');

  return { recommended, blocked, pathChecked: true };
}

/** One `SourceId` covering a set of majors: their shared one, else the weaker claim. */
export function shortlistSource(matches: MajorMatch[]): SourceId {
  const first = matches[0]?.major.source;
  if (!first) return 'illustrative';
  return matches.every((m) => m.major.source === first) ? first : 'illustrative';
}

export type Reach = 'within' | 'borderline' | 'beyond' | 'unknown';

export interface ReachInfo {
  reach: Reach;
  /** Student's average minus the major's indicative acceptance average, 1 decimal. */
  delta: number | null;
}

/** Margin, in Tawjihi points, inside which an average counts as borderline. */
const BORDERLINE_MARGIN = 2;

export function reachFor(grade: number | null | undefined, acceptance: number): ReachInfo {
  if (typeof grade !== 'number' || !Number.isFinite(grade)) return { reach: 'unknown', delta: null };
  const delta = Math.round((grade - acceptance) * 10) / 10;
  if (delta >= BORDERLINE_MARGIN) return { reach: 'within', delta };
  if (delta >= -BORDERLINE_MARGIN) return { reach: 'borderline', delta };
  return { reach: 'beyond', delta };
}

export const REACHABLE_LIMIT = 5;

/**
 * What this student's average actually reaches, ordered by how well it matches
 * their interests. This is the answer to the question the app exists for — a 78
 * who wants medicine needs a real list, not a slogan — and it is computed here
 * so it is on screen with no network and so the model can only name from it.
 *
 * With a usable path the list is narrowed again by the official table: a major
 * their average reaches but their track does not open is not within reach.
 */
export function reachableMajors(
  grade: number | null,
  scores: TraitScores,
  path: StudyPath | null = null,
): MajorMatch[] {
  if (typeof grade !== 'number' || !Number.isFinite(grade)) return [];
  // Only a path with a published college table may narrow the list. A
  // previous-plan branch has none, so it filters nothing rather than filtering
  // everything away.
  const usable = pathConstrainsChoices(path) ? path : null;
  return matchMajors(scores)
    .filter((match) => reachFor(grade, match.major.averageAcceptance).reach !== 'beyond')
    .filter((match) => {
      if (!usable) return true;
      const status = eligibilityFor(match.major.id, usable).status;
      return status === 'eligible' || status === 'eligible-technical';
    })
    .slice(0, REACHABLE_LIMIT);
}

// ───────────────────────── adaptive follow-up questions ─────────────────────────

export interface AdaptiveOption {
  text: string;
  trait: Trait;
  weight: number;
}

export interface AdaptiveQuestion {
  text: string;
  options: AdaptiveOption[];
}

/** What the model asked and what the student picked — stored so the report can show both. */
export interface AdaptiveAnswer {
  question: string;
  chosen: string;
  trait: Trait;
  weight: number;
}

const MAX_Q_CHARS = 140;
const MAX_OPTION_CHARS = 80;
const ADAPTIVE_OPTION_COUNT = 4;

/** Strips the markdown a chat model reaches for even when told not to. */
export function tidyText(raw: string): string {
  return raw
    .replace(/\r\n/g, '\n')
    .replace(/\*\*/g, '')
    .replace(/__/g, '')
    .replace(/^[ \t]{0,3}#{1,6}[ \t]*/gm, '')
    .replace(/^[ \t]{0,3}[*\-–—][ \t]+/gm, '• ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function tidyOneLine(raw: unknown, max: number): string {
  if (typeof raw !== 'string') return '';
  const text = tidyText(raw).replace(/\s+/g, ' ').trim();
  return text.length > max ? `${text.slice(0, max - 1).trimEnd()}…` : text;
}

/** Pulls the first JSON object or array out of a reply that may carry prose or fences. */
function extractJson(raw: string): unknown {
  const text = raw.trim().replace(/^```(?:json)?/i, '').replace(/```$/, '').trim();
  try {
    return JSON.parse(text);
  } catch {
    /* fall through to the bracket scan */
  }
  const starts = [text.indexOf('{'), text.indexOf('[')].filter((i) => i >= 0);
  if (starts.length === 0) return null;
  const start = Math.min(...starts);
  const closer = text[start] === '{' ? '}' : ']';
  const end = text.lastIndexOf(closer);
  if (end <= start) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

function isTrait(value: unknown): value is Trait {
  return typeof value === 'string' && (TRAITS as readonly string[]).includes(value);
}

function clampWeight(value: unknown): number {
  const n = typeof value === 'number' ? value : Number(value);
  if (!Number.isFinite(n)) return 2;
  return Math.min(3, Math.max(1, Math.round(n)));
}

/**
 * Turns a model reply into follow-up questions, or returns [] and lets the page
 * go straight to the report. Anything malformed is dropped rather than repaired:
 * a half-parsed question would put an unexplained point on a student's tally.
 */
export function parseAdaptiveQuestions(raw: string): AdaptiveQuestion[] {
  const data = extractJson(raw);
  const list = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { questions?: unknown }).questions)
      ? ((data as { questions: unknown[] }).questions)
      : [];

  const out: AdaptiveQuestion[] = [];
  for (const entry of list) {
    if (!entry || typeof entry !== 'object') continue;
    const shaped = entry as { text?: unknown; question?: unknown; options?: unknown };
    const text = tidyOneLine(shaped.text ?? shaped.question, MAX_Q_CHARS);
    if (!text || !Array.isArray(shaped.options)) continue;

    const options: AdaptiveOption[] = [];
    const seen = new Set<string>();
    for (const rawOption of shaped.options) {
      if (!rawOption || typeof rawOption !== 'object') continue;
      const shapedOption = rawOption as { text?: unknown; label?: unknown; trait?: unknown; weight?: unknown };
      const optionText = tidyOneLine(shapedOption.text ?? shapedOption.label, MAX_OPTION_CHARS);
      const trait = shapedOption.trait;
      if (!optionText || !isTrait(trait) || seen.has(optionText)) continue;
      seen.add(optionText);
      options.push({ text: optionText, trait, weight: clampWeight(shapedOption.weight) });
    }

    if (options.length < ADAPTIVE_OPTION_COUNT) continue;
    out.push({ text, options: options.slice(0, ADAPTIVE_OPTION_COUNT) });
    if (out.length === ADAPTIVE_QUESTION_COUNT) break;
  }

  return out.length === ADAPTIVE_QUESTION_COUNT ? out : [];
}

// ───────────────────────────────── prompts ─────────────────────────────────

export interface PromptProfile {
  lang: Lang;
  grade: number | null;
  /**
   * The student's track and field. Labels are resolved through `pathLabel`, so
   * the prompt layer still holds no UI strings and no free text the student
   * typed ever reaches a prompt — see src/lib/ai/student.ts.
   */
  path: StudyPath | null;
}

function traitLabelForPrompt(trait: Trait, lang: Lang): string {
  const ar: Record<Trait, string> = {
    R: 'الواقعي/العملي',
    I: 'الاستقصائي/التحليلي',
    A: 'الفنّي/الإبداعي',
    S: 'الاجتماعي',
    E: 'المبادِر/الريادي',
    C: 'التقليدي/المنظّم',
  };
  const en: Record<Trait, string> = {
    R: 'Realistic',
    I: 'Investigative',
    A: 'Artistic',
    S: 'Social',
    E: 'Enterprising',
    C: 'Conventional',
  };
  return `${trait} (${lang === 'ar' ? ar[trait] : en[trait]})`;
}

function tallyLines(core: TraitScores, adaptive: TraitScores, lang: Lang): string[] {
  return rankTraits(sumScores(core, adaptive)).map((trait) => {
    const total = core[trait] + adaptive[trait];
    return lang === 'ar'
      ? `${traitLabelForPrompt(trait, lang)}: ${total} (ثابتة ${core[trait]} + متابعة ${adaptive[trait]})`
      : `${traitLabelForPrompt(trait, lang)}: ${total} (fixed ${core[trait]} + follow-up ${adaptive[trait]})`;
  });
}

function profileLines(profile: PromptProfile): string[] {
  const { lang, grade, path } = profile;
  const track = path && isPathComplete(path) ? path.track : null;

  if (lang === 'ar') {
    const lines = [
      typeof grade === 'number'
        ? `معدّل التوجيهي: ${grade}`
        : 'معدّل التوجيهي: غير مُدخَل — لا تخمّنه ولا تفترض رقماً.',
      `مسار الطالب: ${path ? pathLabel(path, 'ar') : 'غير محدّد'}`,
    ];
    if (track === 'academic' || track === 'vocational') {
      lines.push(
        `احتساب معدّله: 30% امتحان الصف الحادي عشر + 70% ${partTwoLabel(track, 'ar')}.`,
        'لا تصف الـ70% في المسار المهني بأنّها امتحان وطنيّ كتابيّ؛ هي تقييمات وحدات عمليّة.',
      );
    }
    return lines;
  }

  const lines = [
    typeof grade === 'number'
      ? `Tawjihi average: ${grade}`
      : 'Tawjihi average: not entered — do not guess it and do not assume a figure.',
    `Study path: ${path ? pathLabel(path, 'en') : 'not set'}`,
  ];
  if (track === 'academic' || track === 'vocational') {
    lines.push(
      `How their average is built: 30% the grade-11 national exam + 70% ${partTwoLabel(track, 'en')}.`,
      'Never describe the vocational 70% as a written national exam; it is practical unit assessment.',
    );
  }
  return lines;
}

export interface AdaptiveRequest {
  system: string;
  user: string;
}

/**
 * Asks for three follow-up questions as strict JSON. The model is given the
 * twelve fixed question texts so it does not simply ask them again, and is
 * barred from figures, majors and anything diagnostic — a follow-up question is
 * allowed to probe an interest, not to label a student.
 */
export function buildAdaptiveRequest(
  core: TraitScores,
  profile: PromptProfile,
  askedQuestions: string[],
): AdaptiveRequest {
  const { lang } = profile;
  const top = rankTraits(core).slice(0, 2).map((trait) => traitLabelForPrompt(trait, lang));

  const system =
    lang === 'ar'
      ? [
          'أنت مصمّم أسئلة داخل تطبيق إرشاد جامعي أردني. مهمّتك الوحيدة توليد ثلاثة أسئلة متابعة',
          'تميّز بين ميول طالب توجيهي، ثمّ إخراجها بصيغة JSON فقط.',
          '',
          'قواعد ملزمة:',
          '1. اكتب الأسئلة والخيارات بالعربيّة الفصيحة المبسّطة.',
          '2. ثلاثة أسئلة بالضبط، ولكلّ سؤال أربعة خيارات بالضبط.',
          '3. كلّ خيار يحمل حرف ميل واحداً من R I A S E C ووزناً صحيحاً من 1 إلى 3.',
          '4. ركّز على التمييز بين الميلين الأعلى لدى الطالب: اجعل كلّ سؤال موقفاً يوميّاً ملموساً',
          '   يفرّق بينهما فعليّاً، لا سؤالاً عامّاً عن التفضيل.',
          '5. لا تكرّر أيّ سؤال من أسئلة الاختبار المرفقة ولا صياغة قريبة منها.',
          '6. طول السؤال أقلّ من 90 حرفاً، وطول الخيار أقلّ من 60 حرفاً.',
          '7. ممنوع ذكر أيّ رقم أو معدّل أو اسم تخصّص أو اسم جامعة.',
          '8. ممنوع وصف الطالب أو تشخيصه؛ أنت تسأل فقط.',
          '9. أخرج JSON صالحاً فقط، بلا أيّ نصّ قبله أو بعده وبلا تعليقات، بهذا الشكل بالضبط:',
          '{"questions":[{"text":"…","options":[{"text":"…","trait":"I","weight":3},{"text":"…","trait":"A","weight":3},{"text":"…","trait":"S","weight":2},{"text":"…","trait":"C","weight":2}]}]}',
        ].join('\n')
      : [
          'You write questions inside a Jordanian university-guidance app. Your only task is to',
          'generate three follow-up questions that separate a Tawjihi student\'s interests, and to',
          'return them as JSON only.',
          '',
          'Binding rules:',
          '1. Write the questions and options in plain English.',
          '2. Exactly three questions, each with exactly four options.',
          '3. Every option carries one RIASEC letter from R I A S E C and an integer weight 1–3.',
          '4. Focus on separating the student\'s two strongest interests: make each question a',
          '   concrete everyday situation that actually tells them apart, not a generic preference.',
          '5. Do not repeat any of the test questions supplied, or a close paraphrase of one.',
          '6. Keep a question under 90 characters and an option under 60.',
          '7. Never mention a number, an average, a major, or a university.',
          '8. Never describe or diagnose the student; you are only asking.',
          '9. Output valid JSON only, with no text before or after it and no comments, exactly like:',
          '{"questions":[{"text":"…","options":[{"text":"…","trait":"I","weight":3},{"text":"…","trait":"A","weight":3},{"text":"…","trait":"S","weight":2},{"text":"…","trait":"C","weight":2}]}]}',
        ].join('\n');

  const user =
    lang === 'ar'
      ? [
          'نقاط الطالب بعد الأسئلة الاثنتي عشرة الثابتة:',
          ...tallyLines(core, emptyScores(), lang),
          '',
          `الميلان الأعلى المطلوب التمييز بينهما: ${top.join(' و')}.`,
          ...profileLines(profile),
          '',
          'أسئلة الاختبار الثابتة (لا تكرّرها):',
          ...askedQuestions.map((text, index) => `${index + 1}) ${text}`),
        ].join('\n')
      : [
          'The student\'s scores after the twelve fixed questions:',
          ...tallyLines(core, emptyScores(), lang),
          '',
          `The two strongest interests to separate: ${top.join(' and ')}.`,
          ...profileLines(profile),
          '',
          'The fixed test questions (do not repeat these):',
          ...askedQuestions.map((text, index) => `${index + 1}) ${text}`),
        ].join('\n');

  return { system, user };
}

export interface NarrativeRequest {
  system: string;
  user: string;
}

/** The pre-computed gap sentence. The model is never asked to subtract anything. */
function gapPhrase(grade: number | null, acceptance: number, lang: Lang): string {
  const { reach, delta } = reachFor(grade, acceptance);
  if (reach === 'unknown' || delta === null) {
    return lang === 'ar' ? 'لا مقارنة (لا يوجد معدّل مُدخَل)' : 'no comparison (no average entered)';
  }
  const gap = Math.abs(delta);
  if (reach === 'beyond') {
    return lang === 'ar'
      ? `معدّل الطالب أقلّ من معدّل القبول الاسترشادي بـ ${gap} نقطة`
      : `the student's average is ${gap} points below this indicative acceptance average`;
  }
  if (reach === 'borderline') {
    return lang === 'ar'
      ? `معدّل الطالب على الحدّ تماماً (فرق ${gap} نقطة)`
      : `the student's average is right on the line (${gap} points apart)`;
  }
  return lang === 'ar'
    ? `معدّل الطالب أعلى بـ ${gap} نقطة`
    : `the student's average is ${gap} points above it`;
}

/** The degree the student's own path yields for this major, in the Ministry's words. */
function verdictPhrase(entry: ShortlistEntry, lang: Lang): string {
  const { eligibility } = entry;
  if (eligibility.status === 'eligible') {
    const within = eligibility.coveredBy ?? eligibility.officialCollege;
    if (eligibility.explicit) {
      return lang === 'ar'
        ? `يفتحه مسار الطالب ضمن كليّة «${eligibility.officialCollege}» (بكالوريوس أكاديمي)`
        : `the student's path opens it under the college «${eligibility.officialCollege}» (academic bachelor)`;
    }
    return lang === 'ar'
      ? `يفتحه مسار الطالب «ضمن ${within}» — الجدول سمّى كليّة أوسع ولم يسمّ التخصّص بذاته`
      : `the student's path opens it “within ${within}” — the table names a broader college, not this major itself`;
  }
  if (eligibility.status === 'eligible-technical') {
    return lang === 'ar'
      ? `متاح لمساره بدرجة البكالوريوس التقني/التطبيقي ضمن «${eligibility.officialCollege}» — سمِّ الدرجة كاملة ولا تختصرها إلى «بكالوريوس»`
      : `open to their path as a technical/applied bachelor within «${eligibility.officialCollege}» — name the degree in full, never just “bachelor's”`;
  }
  if (eligibility.status === 'not-eligible') {
    return lang === 'ar' ? eligibility.reasonAr : eligibility.reasonEn;
  }
  return lang === 'ar'
    ? 'لم يُتحقّق من إتاحته لمساره (المسار غير محدّد أو غير مشمول بالجدول المنشور) — لا تقل إنّه متاح أو غير متاح'
    : 'eligibility not checked (no path set, or not covered by the published table) — do not say it is or is not open to them';
}

function shortlistLines(matches: ShortlistEntry[], profile: PromptProfile): string[] {
  const { lang, grade } = profile;
  return matches.map((entry, index) => {
    const { major, fit } = entry;
    const parts =
      lang === 'ar'
        ? [
            `${index + 1}) ${majorName(major, lang)}`,
            `مؤشّر الانسجام ${fit}`,
            `معدّل القبول الاسترشادي ${major.averageAcceptance}`,
            gapPhrase(grade, major.averageAcceptance, lang),
            `المدّة ${major.duration} سنوات`,
            `الرسوم الحكوميّة ${major.yearlyTuitionGov} د.أ للسنة`,
            `المجال ${categoryLabel(major.category, lang)}`,
            verdictPhrase(entry, lang),
          ]
        : [
            `${index + 1}) ${majorName(major, lang)}`,
            `match index ${fit}`,
            `indicative acceptance average ${major.averageAcceptance}`,
            gapPhrase(grade, major.averageAcceptance, lang),
            `${major.duration} years`,
            `public tuition ${major.yearlyTuitionGov} JOD/year`,
            `field ${categoryLabel(major.category, lang)}`,
            verdictPhrase(entry, lang),
          ];
    return parts.join(' | ');
  });
}

/**
 * The strong matches the official table closes off. They are handed to the model
 * as something to explain, explicitly separated from the list it may recommend
 * from, with the Ministry's own reason attached to each one.
 */
function blockedLines(blocked: ShortlistEntry[], profile: PromptProfile): string[] {
  const { lang, path } = profile;
  if (blocked.length === 0) return [];
  const pathName = path ? pathLabel(path, lang) : '';
  return [
    '',
    lang === 'ar'
      ? `تخصّصات جاءت ضمن أعلى خمس نتائج في الميول لكنّ مسار الطالب (${pathName}) لا يفتحها في الجدول الرسميّ.`
        + ' اذكرها باعتبارها ميلاً حقيقيّاً لديه، واشرح سبب إغلاقها كما هو وارد، ثمّ وجّهه إلى القائمة'
        + ' المعتمدة أعلاه. ممنوع منعاً باتّاً أن ترشّح أيّاً منها أو توحي بأنّها ممكنة بمعدّل أعلى:'
      : `Majors that landed in the top five on interest but that the student's path (${pathName}) does not`
        + ' open per the official table. Name them as a genuine interest, explain why they are closed'
        + ' using the reason given, then point back to the approved list above. Never recommend one and'
        + ' never imply a higher average could open it:',
    ...blocked.map(
      (entry, index) =>
        `${index + 1}) ${majorName(entry.major, lang)} | ${
          lang === 'ar' ? `مؤشّر الانسجام ${entry.fit}` : `match index ${entry.fit}`
        } | ${verdictPhrase(entry, lang)}`,
    ),
  ];
}

/**
 * The written report.
 *
 * Two properties are doing the honesty work here. First, the shortlist is fixed
 * by the app and handed over by name, so the model orders nothing and can name
 * nothing that is not in src/data/majors.ts and open to the student's path. Second, every figure it may
 * state — the averages and the gap to the student's own average — is already
 * computed in the prompt, so "be realistic" is a writing instruction rather than
 * an arithmetic one.
 */
export function buildNarrativeRequest(
  core: TraitScores,
  adaptive: TraitScores,
  adaptiveAnswers: AdaptiveAnswer[],
  matches: ShortlistEntry[],
  blocked: ShortlistEntry[],
  profile: PromptProfile,
): NarrativeRequest {
  const { lang } = profile;
  const totals = sumScores(core, adaptive);
  const top = rankTraits(totals).slice(0, 3).map((trait) => traitLabelForPrompt(trait, lang));

  const system =
    lang === 'ar'
      ? [
          'أنت «المرشد الأكاديمي» في تطبيق مُرشِدي الأردني. تكتب الآن قراءة إرشاديّة لنتيجة اختبار',
          'ميول بأسلوب RIASEC لطالب توجيهي. لست مرشداً نفسيّاً معتمداً، ولا تمثّل وزارة التعليم العالي',
          'ولا أيّ جهة رسميّة، ولا تُصدر تشخيصاً ولا تستخدم لغة التشخيص النفسي.',
          '',
          'اكتب بالعربيّة الفصيحة المبسّطة، بنصّ عادي بلا Markdown وبلا رموز تعبيريّة،',
          'من 180 إلى 260 كلمة، وبهذه البنية وبهذه العناوين:',
          '1) نمط ميولك — ثلاث إلى أربع جمل تصف ما تقوله إجاباته، ومرّة واحدة جملة تقول إنّ هذا',
          '   مؤشّر ميول وليس قياس قدرات ولا تقييماً نفسيّاً معتمداً.',
          '2) ثلاث نقاط قوّة — كلّ واحدة جملة واحدة مبنيّة على نقاطه لا على المجاملة.',
          '3) تحفّظان — ما الذي قد يتعبه في هذا المسار، بصراحة وباحترام.',
          '4) التخصّصات المعتمدة — جميعها، بالترتيب نفسه وبالأسماء نفسها حرفيّاً كما وردت في القائمة',
          '   المرفقة (عددها قد يقلّ عن خمسة لأنّ القائمة مصفّاة على ما يفتحه مسار الطالب)،',
          '   ولكلّ تخصّص جملة عن سبب انسجامه مع ميوله تحديداً، وجملة واقعيّة عن معدّله مقابل معدّل',
          '   القبول الاسترشادي منقولة من القائمة.',
          '5) الخطوة التالية — سطر واحد يشير إلى أداة داخل التطبيق: حاسبة عائد التعليم، أو مقارنة',
          '   التخصّصات، أو المسارات البديلة، أو الاستشارة الأكاديميّة.',
          '',
          'قواعد ملزمة:',
          '- ممنوع ذكر أيّ تخصّص خارج القائمة المرفقة، وممنوع اختراع اسم برنامج أو جامعة أو شهادة.',
          '- كلّ رقم تكتبه منقول حرفيّاً من القائمة المرفقة. لا تحسب ولا تقرّب ولا تستعِن بذاكرتك.',
          '- لا تذكر راتباً ولا نسبة بطالة ولا عدد وظائف ولا نسبة نموّ — لا تملك هذه الأرقام.',
          '- قل مرّة واحدة إنّ معدّلات القبول المذكورة استرشاديّة وليست الحدّ التنافسي الرسمي 2026/2027.',
          '- الواقعيّة قبل التشجيع: حين يكون معدّل الطالب أقلّ من معدّل القبول الاسترشادي، قل ذلك',
          '  صراحةً بالفارق كما ورد في القائمة، ثمّ اذكر ما الذي يبلغه معدّله فعليّاً من القائمة نفسها.',
          '  ممنوع «اجتهد وستصل» و«لا شيء مستحيل» و«كلّ الأبواب مفتوحة». الصدق المحدّد أنفع من',
          '  التشجيع العامّ — ومن دون إهانة ولا تثبيط: اذكر البديل الواقعي بدل إغلاق الباب.',
          '- إن لم يكن للطالب معدّل مُدخَل فلا تخمّنه، واطلب منه إدخاله في ملفّه ليصبح التحليل أدقّ.',
          '- ممنوع أن ترشّح تخصّصاً لا يفتحه مسار الطالب في جدول مجلس التعليم العالي المرفق. إن كان',
          '  التخصّص الذي يميل إليه مغلقاً بسبب مساره فاذكر قيد المسار أوّلاً وصراحةً — قبل المعدّل',
          '  وقبل الكلفة — لأنّ المعدّل لا يفتح كليّة لا يسمح بها جدول المسار أصلاً، ثمّ اعرض البديل',
          '  الحقيقي من القائمة المعتمدة.',
          '- اقتبس أسماء الكليّات بصياغتها الرسميّة كما وردت، ولا تترجمها ولا تختصرها. وإذا كان',
          '  التخصّص مندرجاً ضمن كليّة أوسع فقل «ضمن …» ولا توحِ بأنّ الوثيقة سمّته بذاته.',
          '- لا تخلط بين البكالوريوس الأكاديمي والبكالوريوس التقني/التطبيقي والدبلوم المتوسط؛ ثلاث',
          '  درجات مختلفة، سمِّ كلّاً منها باسمه كما ورد في القائمة.',
          '- لا تبدأ بمجاملة افتتاحيّة ولا بتلخيص لما ستفعله؛ ابدأ بالعنوان الأوّل مباشرة.',
        ].join('\n')
      : [
          'You are the academic advisor inside the Jordanian app Murshidi. You are writing a guidance',
          'reading of a RIASEC-style interests result for a Tawjihi student. You are not a licensed',
          'counsellor, you do not represent the Ministry of Higher Education or any official body, and',
          'you issue no diagnosis and use no clinical language.',
          '',
          'Write in plain English, plain text with no Markdown and no emoji, 180–260 words, using',
          'exactly this structure and these headings:',
          '1) Your interests pattern — three or four sentences on what the answers say, including one',
          '   sentence stating that this is an interests indicator, not an aptitude measure and not a',
          '   certified psychometric assessment.',
          '2) Three strengths — one sentence each, grounded in the scores rather than in flattery.',
          '3) Two cautions — what may wear this student down on this path, honestly and respectfully.',
          '4) The approved majors — all of them, in the same order and with the exact names given in the',
          '   list below (there may be fewer than five: the list is filtered to what the path opens),',
          '   one sentence per major on why it fits THIS student\'s interests, plus one realistic',
          '   sentence about their average against the indicative acceptance average, taken from the list.',
          '5) Next step — one line pointing at a tool inside the app: the Education ROI Calculator,',
          '   Compare Majors, Alternative Paths, or the Academic Advisor chat.',
          '',
          'Binding rules:',
          '- Never name a major outside the supplied list, and never invent a programme, university or',
          '  qualification.',
          '- Every figure you write is copied verbatim from the supplied list. Do not compute, round or',
          '  recall anything.',
          '- State no salary, unemployment rate, vacancy count or growth rate — you do not hold them.',
          '- Say once that the acceptance averages quoted are indicative, not the official 2026/2027',
          '  competitive minimums.',
          '- Realism before encouragement: where the student\'s average is below an indicative acceptance',
          '  average, say so plainly with the gap exactly as given, then name what their average does',
          '  reach from the same list. Never write "work hard and you will get there", "nothing is',
          '  impossible" or "every door is open". Specific honesty is more use than general',
          '  encouragement — without insulting or discouraging them: name the realistic alternative',
          '  instead of closing the door.',
          '- If the student has no average entered, do not guess it; ask them to add it to their profile',
          '  so the analysis gets sharper.',
          '- Never recommend a major the student\'s path does not open in the supplied Higher Education',
          '  Council table. Where the major they lean towards is closed by their track, say so first and',
          '  plainly — before the average and before the cost — because an average cannot open a college',
          '  the track table does not list at all, then name the real alternative from the approved list.',
          '- Quote college names in the official wording exactly as supplied; do not translate or shorten',
          '  them. Where a major sits under a broader college, write “within …” and never imply the',
          '  document named the major itself.',
          '- Never merge an academic bachelor, a technical/applied bachelor and an intermediate diploma.',
          '  They are three different qualifications; name each as the list names it.',
          '- Do not open with a compliment or a summary of what you are about to do; start at heading one.',
        ].join('\n');

  const adaptiveBlock =
    adaptiveAnswers.length > 0
      ? [
          '',
          lang === 'ar' ? 'أسئلة المتابعة وإجاباته:' : 'The follow-up questions and their answers:',
          ...adaptiveAnswers.map(
            (answer, index) =>
              `${index + 1}) ${answer.question} → ${lang === 'ar' ? 'اختار' : 'chose'}: ${answer.chosen}`,
          ),
        ]
      : [
          '',
          lang === 'ar'
            ? 'لم تُستخدم أسئلة متابعة في هذه المحاولة؛ اعتمد على الأسئلة الاثنتي عشرة الثابتة وحدها.'
            : 'No follow-up questions were used this time; rely on the twelve fixed questions alone.',
        ];

  const reachable = reachableMajors(profile.grade, totals, profile.path);
  const reachableBlock =
    reachable.length > 0
      ? [
          '',
          lang === 'ar'
            ? 'التخصّصات التي يبلغها معدّل الطالب فعليّاً (من جدول التطبيق، مرتّبة حسب انسجامها مع'
              + ' ميوله). عند ذكر بديل واقعي اختر من هذه القائمة وحدها:'
            : 'The majors this student\'s average actually reaches (from the app table, ordered by fit).'
              + ' When naming a realistic alternative, choose only from this list:',
          ...reachable.map(({ major, fit }, index) =>
            lang === 'ar'
              ? `${index + 1}) ${majorName(major, lang)} | معدّل القبول الاسترشادي ${major.averageAcceptance} | مؤشّر الانسجام ${fit}`
              : `${index + 1}) ${majorName(major, lang)} | indicative acceptance average ${major.averageAcceptance} | match index ${fit}`,
          ),
        ]
      : [
          '',
          typeof profile.grade === 'number'
            ? lang === 'ar'
              ? 'لا يبلغ معدّل الطالب المعدّل الاسترشادي لأيّ تخصّص في جدول التطبيق. قل ذلك بوضوح'
                + ' واحترام، ووجّهه إلى صفحة «المسارات البديلة» (دبلوم مهني وBTEC وجسور الانتقال)'
                + ' بدل أن تخترع خياراً.'
              : 'This student\'s average reaches none of the majors in the app table. Say so clearly and'
                + ' respectfully and point them at the Alternative Paths page (vocational diplomas, BTEC,'
                + ' bridging routes) rather than inventing an option.'
            : lang === 'ar'
              ? 'لا يوجد معدّل مُدخَل، فلا تصنّف أيّ تخصّص على أنّه في متناوله أو خارج متناوله.'
              : 'No average was entered, so do not label any major as within or beyond their reach.',
        ];

  const user =
    lang === 'ar'
      ? [
          'بيانات الطالب:',
          ...profileLines(profile),
          '',
          'نقاط الميول (مجموع الأسئلة الثابتة وأسئلة المتابعة):',
          ...tallyLines(core, adaptive, lang),
          `الميول الأعلى بالترتيب: ${top.join(' ثمّ ')}.`,
          ...adaptiveBlock,
          '',
          'القائمة النهائيّة — تخصّصات رتّبها التطبيق حسابيّاً من بيانات التطبيق نفسه، وصُفّيت على',
          'ما يفتحه مسار الطالب في الجدول الرسميّ. اكتب عنها بهذا الترتيب وبهذه الأسماء حرفيّاً،',
          'ولا تضف ولا تستبدل ولا تحذف أيّ تخصّص:',
          ...shortlistLines(matches, profile),
          ...blockedLines(blocked, profile),
          ...reachableBlock,
        ].join('\n')
      : [
          'Student details:',
          ...profileLines(profile),
          '',
          'Interest scores (fixed questions plus follow-ups):',
          ...tallyLines(core, adaptive, lang),
          `Strongest interests in order: ${top.join(', then ')}.`,
          ...adaptiveBlock,
          '',
          'The final list — majors the app ranked arithmetically from its own dataset and then filtered',
          'to what the student’s path opens in the official table. Write about them in this order and',
          'with these exact names; add nothing, swap nothing, drop nothing:',
          ...shortlistLines(matches, profile),
          ...blockedLines(blocked, profile),
          ...reachableBlock,
        ].join('\n');

  return { system, user };
}

// ──────────────────────────────── persistence ────────────────────────────────

const REPORT_PREFIX = 'murshidi.riasec.';
const GUEST_SCOPE = 'guest';

/**
 * Bump when the stored shape changes; an older record is then ignored, not
 * misread. v4 replaced the pre-2023 `branch` with the two-track `StudyPath` and
 * added the blocked-match list, so a v3 record cannot be read forward: its
 * branch value says nothing about which colleges the new table opens.
 */
export const REPORT_VERSION = 4;

export interface StoredReport {
  version: number;
  /** ISO. src/lib/activity.ts reads this field to date the profile's report row. */
  at: string;
  lang: Lang;
  coreScores: TraitScores;
  adaptiveScores: TraitScores;
  adaptiveAnswers: AdaptiveAnswer[];
  adaptiveUsed: boolean;
  top: Trait[];
  /** The recommended majors as issued: ids and their match index. */
  shortlist: { id: string; fit: number }[];
  /** Strong interest matches the student's path does not open, as issued. */
  blocked: { id: string; fit: number }[];
  grade: number | null;
  /**
   * The path identifiers, not their labels. A report taken with the English
   * interface and reopened in Arabic has to show «الحقل الصحّي», not "Health",
   * so labels are resolved at render time and only the identity is stored.
   */
  path: StudyPath | null;
  /** '' when the written analysis was never produced. */
  narrative: string;
  narrativeModel: string;
}

/** Signed-in students keep their report; a guest's lasts for the tab session only. */
function storageFor(userId: string | null): Storage | null {
  try {
    return userId ? window.localStorage : window.sessionStorage;
  } catch {
    return null;
  }
}

function reportKey(userId: string | null): string {
  return `${REPORT_PREFIX}${userId ?? GUEST_SCOPE}`;
}

function isScores(value: unknown): value is TraitScores {
  if (!value || typeof value !== 'object') return false;
  const record = value as Record<string, unknown>;
  return TRAITS.every((trait) => typeof record[trait] === 'number' && Number.isFinite(record[trait]));
}

/** Reads an `{id, fit}` list out of storage, dropping anything malformed. */
function readIdList(value: unknown): { id: string; fit: number }[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) =>
    entry && typeof entry === 'object' && typeof (entry as { id?: unknown }).id === 'string'
      ? [
          {
            id: (entry as { id: string }).id,
            fit: typeof (entry as { fit?: unknown }).fit === 'number' ? (entry as { fit: number }).fit : 0,
          },
        ]
      : [],
  );
}

export function loadReport(userId: string | null): StoredReport | null {
  const store = storageFor(userId);
  if (!store) return null;
  try {
    const raw = store.getItem(reportKey(userId));
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<StoredReport>;
    if (parsed.version !== REPORT_VERSION) return null;
    if (!isScores(parsed.coreScores) || !isScores(parsed.adaptiveScores)) return null;
    if (typeof parsed.at !== 'string' || !parsed.at) return null;
    if (!Array.isArray(parsed.shortlist) || !Array.isArray(parsed.top)) return null;
    return {
      version: REPORT_VERSION,
      at: parsed.at,
      lang: parsed.lang === 'en' ? 'en' : 'ar',
      coreScores: parsed.coreScores,
      adaptiveScores: parsed.adaptiveScores,
      adaptiveAnswers: Array.isArray(parsed.adaptiveAnswers) ? parsed.adaptiveAnswers : [],
      adaptiveUsed: parsed.adaptiveUsed === true,
      top: parsed.top.filter(isTrait),
      shortlist: readIdList(parsed.shortlist),
      blocked: readIdList(parsed.blocked),
      grade: typeof parsed.grade === 'number' ? parsed.grade : null,
      // Validated against tawjihi.ts rather than trusted: a hand-edited or
      // half-migrated record must not put a field id the Ministry never
      // published in front of an eligibility verdict.
      path: readStudyPath(parsed),
      narrative: typeof parsed.narrative === 'string' ? parsed.narrative : '',
      narrativeModel: typeof parsed.narrativeModel === 'string' ? parsed.narrativeModel : '',
    };
  } catch {
    return null;
  }
}

export function persistReport(userId: string | null, report: StoredReport): void {
  const store = storageFor(userId);
  if (!store) return;
  try {
    store.setItem(reportKey(userId), JSON.stringify(report));
  } catch {
    /* a full or blocked storage must not break the report on screen */
  }
}

/**
 * Resolves stored major ids against the live dataset; ids that vanished are
 * dropped. The path verdict is recomputed rather than stored, so a report
 * reopened after the student changes their track shows today's truth.
 */
export function resolveShortlist(
  entries: { id: string; fit: number }[],
  path: StudyPath | null,
): ShortlistEntry[] {
  return entries.flatMap((entry) => {
    const major = majorsData.find((candidate) => candidate.id === entry.id);
    return major ? [entryFor({ major, fit: entry.fit }, isPathComplete(path) ? path : null)] : [];
  });
}

/** Stable, human-readable report number derived from the issue time. */
export function reportNumber(at: string): string {
  const stamp = Date.parse(at);
  return `PSY-${Number.isFinite(stamp) ? Math.floor(stamp / 1000) : 0}`;
}
