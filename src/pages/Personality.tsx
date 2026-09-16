import { Fragment, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight, FileText, Loader2, Printer, RefreshCcw, RotateCcw, Sparkles, Square, Undo2, WifiOff } from 'lucide-react';
import { PolarGrid, PolarAngleAxis, RadarChart, Radar, ResponsiveContainer } from 'recharts';
import PageHeader from '../components/PageHeader';
import SourceNote from '../components/SourceNote';
import { useAuth } from '../context/AuthContext';
import { useLang } from '../i18n/LangContext';
import type { TranslationKey } from '../i18n/translations';
import { askAi } from '../lib/ai';
import type { AiProfileContext } from '../lib/ai';
import { readStudyPath, safeCity, safeGrade } from '../lib/ai/student';
import { recordActivity } from '../lib/activity';
import { isoDate } from '../lib/numerals';
import { isPathComplete, partTwoLabel, pathLabel } from '../lib/tawjihi';
import {
  ADAPTIVE_QUESTION_COUNT,
  CORE_QUESTION_COUNT,
  REPORT_VERSION,
  RIASEC_QUESTIONS,
  TRAITS,
  TRAIT_KEYS,
  buildAdaptiveRequest,
  buildNarrativeRequest,
  emptyScores,
  loadReport,
  parseAdaptiveQuestions,
  persistReport,
  rankTraits,
  reachFor,
  reachableMajors,
  reportNumber,
  resolveShortlist,
  shortlistFor,
  shortlistSource,
  sumScores,
  tidyText,
} from '../lib/riasec';
import type {
  AdaptiveAnswer,
  AdaptiveQuestion,
  PathVerdict,
  PromptProfile,
  Reach,
  ShortlistEntry,
  StoredReport,
  Trait,
  TraitScores,
} from '../lib/riasec';

type Phase = 'core' | 'preparing' | 'adaptive' | 'report';
type NarrativeState = 'idle' | 'writing' | 'done' | 'stopped' | 'unavailable';

/** Warm/cool badge per reach bucket. Red is used to be clear, not to scold. */
const REACH_BADGE: Record<Reach, string> = {
  within: 'gov-badge gov-badge-success',
  borderline: 'gov-badge gov-badge-warn',
  beyond: 'gov-badge gov-badge-danger',
  unknown: 'gov-badge gov-badge-neutral',
};

const REACH_LABEL_KEYS = {
  within: 'personality.reach.within',
  borderline: 'personality.reach.borderline',
  beyond: 'personality.reach.beyond',
  unknown: 'personality.reach.unknown',
} as const;

/**
 * The path verdict badge. `unchecked` is deliberately neutral and never green:
 * with no path set the app has checked nothing and must not look like it has.
 */
const VERDICT_BADGE: Record<PathVerdict, string> = {
  open: 'gov-badge gov-badge-success',
  technical: 'gov-badge gov-badge-info',
  closed: 'gov-badge gov-badge-danger',
  unchecked: 'gov-badge gov-badge-neutral',
};

const VERDICT_LABEL_KEYS = {
  open: 'personality.path.open',
  technical: 'personality.path.technical',
  closed: 'personality.path.closed',
  unchecked: 'personality.path.unchecked',
} as const;

/** The Ministry's own sentence for this verdict — quoted, never paraphrased. */
function verdictReason(
  entry: ShortlistEntry,
  lang: 'ar' | 'en',
  t: (key: TranslationKey) => string,
): string | null {
  const { eligibility } = entry;
  if (eligibility.status === 'not-eligible') {
    return lang === 'ar' ? eligibility.reasonAr : eligibility.reasonEn;
  }
  if (eligibility.status === 'eligible-technical') {
    return lang === 'ar' ? eligibility.noteAr : eligibility.noteEn;
  }
  if (eligibility.status === 'eligible' && !eligibility.explicit) {
    // The Ministry named a broader college, so the app says «ضمن …» / "within …"
    // and never implies the document named this major by itself. The preposition
    // comes from the dictionary like every other word on screen; the college name
    // inside the quotes stays in the document's own Arabic.
    const within = eligibility.coveredBy ?? eligibility.officialCollege;
    return `${t('tools.elig.within')} «${within}»`;
  }
  return null;
}

/** The amber used by `.gov-badge-warn`, applied inline so the note can wrap. */
const AMBER = { bg: '#FFFBEB', border: '#FDE68A', ink: '#B45309' };

/**
 * Arabic counts a noun differently by size: 3-10 whole units take the plural
 * (سبع نقاط), while one, eleven-and-up and any decimal take the singular
 * (ستّ فاصلة ثلاث نقطة). A single hardcoded word would be wrong half the time.
 */
function pointsKey(value: number, lang: 'ar' | 'en') {
  const plural =
    lang === 'ar' ? Number.isInteger(value) && value >= 3 && value <= 10 : value !== 1;
  return plural ? ('personality.reach.points' as const) : ('personality.reach.point' as const);
}

function isAbortError(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError';
}

/**
 * The test is remounted per identity, so signing in or out starts a clean run
 * against the right stored report instead of mutating state inside an effect.
 */
export default function Personality() {
  const { user } = useAuth();
  return <InterestsTest key={user?.id ?? 'guest'} />;
}

function InterestsTest() {
  const { lang, dir, t } = useLang();
  const { user } = useAuth();
  const navigate = useNavigate();

  const userId = user?.id ?? null;
  const grade = safeGrade(user?.grade);
  // Read through the same validator the AI layer uses, so the test and the
  // advisor can never disagree about which row of the Ministry's table applies.
  const path = useMemo(() => readStudyPath(user), [user]);

  const [stored] = useState<StoredReport | null>(() => loadReport(userId));
  const [fromStorage, setFromStorage] = useState(stored !== null);

  const [phase, setPhase] = useState<Phase>(stored ? 'report' : 'core');
  const [step, setStep] = useState(0);
  const [coreScores, setCoreScores] = useState<TraitScores>(emptyScores);
  const [coreHistory, setCoreHistory] = useState<{ trait: Trait; weight: number }[]>([]);

  const [adaptiveQuestions, setAdaptiveQuestions] = useState<AdaptiveQuestion[]>([]);
  const [adaptiveScores, setAdaptiveScores] = useState<TraitScores>(emptyScores);
  const [adaptiveAnswers, setAdaptiveAnswers] = useState<AdaptiveAnswer[]>([]);
  const [adaptiveNote, setAdaptiveNote] = useState<'unavailable' | 'skipped' | null>(null);

  const [report, setReport] = useState<StoredReport | null>(stored);
  const [narrative, setNarrative] = useState(stored?.narrative ?? '');
  const [narrativeModel, setNarrativeModel] = useState(stored?.narrativeModel ?? '');
  const [narrativeState, setNarrativeState] = useState<NarrativeState>(() => {
    if (!stored) return 'idle';
    return stored.narrative ? 'done' : 'unavailable';
  });

  const abortRef = useRef<AbortController | null>(null);
  const runRef = useRef(0);

  // A page that leaves the screen must not leave a request running behind it.
  useEffect(
    () => () => {
      runRef.current += 1;
      abortRef.current?.abort();
    },
    [],
  );

  const beginRun = useCallback(() => {
    runRef.current += 1;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    return { id: runRef.current, controller };
  }, []);

  const promptProfile = useMemo<PromptProfile>(
    () => ({ lang, grade, path }),
    [lang, grade, path],
  );

  // No free text from the profile reaches a prompt — see src/lib/ai/student.ts.
  const aiProfile = useMemo<AiProfileContext>(
    () => ({ grade, city: safeCity(user?.city), path, lang }),
    [user?.city, grade, path, lang],
  );

  const runNarrative = useCallback(
    async (base: StoredReport) => {
      const { id, controller } = beginRun();
      setNarrative('');
      setNarrativeModel('');
      setNarrativeState('writing');

      try {
        // The report's own path, not the live profile: a stored report is read
        // back exactly as it was issued.
        const matches = resolveShortlist(base.shortlist, base.path);
        const blocked = resolveShortlist(base.blocked, base.path);
        const request = buildNarrativeRequest(
          base.coreScores,
          base.adaptiveScores,
          base.adaptiveAnswers,
          matches,
          blocked,
          { ...promptProfile, path: base.path },
        );
        const result = await askAi(request.user, {
          system: request.system,
          profile: aiProfile,
          signal: controller.signal,
          maxTokens: 1100,
          onToken: (chunk) => {
            if (runRef.current !== id) return;
            setNarrative((prev) => prev + chunk);
          },
        });
        if (runRef.current !== id) return;

        // `source: 'local'` means every model failed and the AI layer answered
        // from its own rule base — a general advisor reply, not this report. It
        // would read as an answer to a question nobody asked, so it is dropped
        // and the computed report below stands on its own.
        if (result.source === 'local') {
          setNarrative('');
          setNarrativeState('unavailable');
          return;
        }

        const text = tidyText(result.text);
        setNarrative(text);
        setNarrativeModel(result.model);
        setNarrativeState('done');

        const saved: StoredReport = { ...base, narrative: text, narrativeModel: result.model };
        setReport(saved);
        persistReport(userId, saved);
      } catch (error) {
        if (runRef.current !== id) return;
        // A half-written analysis can stop before its cautions, so the partial
        // text is discarded rather than shown as if it were the whole thing.
        setNarrative('');
        setNarrativeState(isAbortError(error) ? 'stopped' : 'unavailable');
      }
    },
    [aiProfile, beginRun, promptProfile, userId],
  );

  const finalize = useCallback(
    (core: TraitScores, adaptive: TraitScores, answers: AdaptiveAnswer[], used: boolean) => {
      const totals = sumScores(core, adaptive);
      // The shortlist is what the student can actually reach. A strong match the
      // official table closes is kept — separately, and with its reason — rather
      // than recommended or silently dropped.
      const result = shortlistFor(totals, path);
      const next: StoredReport = {
        version: REPORT_VERSION,
        at: new Date().toISOString(),
        lang,
        coreScores: core,
        adaptiveScores: adaptive,
        adaptiveAnswers: answers,
        adaptiveUsed: used,
        top: rankTraits(totals).slice(0, 3),
        shortlist: result.recommended.map((entry) => ({ id: entry.major.id, fit: entry.fit })),
        blocked: result.blocked.map((entry) => ({ id: entry.major.id, fit: entry.fit })),
        grade,
        path,
        narrative: '',
        narrativeModel: '',
      };
      setReport(next);
      setFromStorage(false);
      persistReport(userId, next);
      recordActivity('interestsTest');
      setPhase('report');
      void runNarrative(next);
    },
    [grade, lang, path, runNarrative, userId],
  );

  const requestAdaptive = useCallback(
    async (core: TraitScores) => {
      const { id, controller } = beginRun();
      setPhase('preparing');
      try {
        const request = buildAdaptiveRequest(
          core,
          promptProfile,
          RIASEC_QUESTIONS.map((question) => t(question.textKey)),
        );
        const result = await askAi(request.user, {
          system: request.system,
          profile: aiProfile,
          signal: controller.signal,
          json: true,
          maxTokens: 700,
        });
        if (runRef.current !== id) return;

        const questions = result.source === 'ai' ? parseAdaptiveQuestions(result.text) : [];
        if (questions.length === ADAPTIVE_QUESTION_COUNT) {
          setAdaptiveQuestions(questions);
          setPhase('adaptive');
          return;
        }
        setAdaptiveNote('unavailable');
        finalize(core, emptyScores(), [], false);
      } catch (error) {
        if (runRef.current !== id) return;
        if (!isAbortError(error)) setAdaptiveNote('unavailable');
        finalize(core, emptyScores(), [], false);
      }
    },
    [aiProfile, beginRun, finalize, promptProfile, t],
  );

  const answerCore = (trait: Trait, weight: number) => {
    const next: TraitScores = { ...coreScores, [trait]: coreScores[trait] + weight };
    setCoreScores(next);
    setCoreHistory((prev) => [...prev, { trait, weight }]);
    if (step + 1 < CORE_QUESTION_COUNT) {
      setStep(step + 1);
      return;
    }
    void requestAdaptive(next);
  };

  const undoCore = () => {
    const last = coreHistory[coreHistory.length - 1];
    if (!last) return;
    setCoreScores((prev) => ({ ...prev, [last.trait]: prev[last.trait] - last.weight }));
    setCoreHistory((prev) => prev.slice(0, -1));
    setStep((prev) => Math.max(0, prev - 1));
  };

  const answerAdaptive = (question: AdaptiveQuestion, optionIndex: number) => {
    const option = question.options[optionIndex];
    if (!option) return;
    const nextScores: TraitScores = {
      ...adaptiveScores,
      [option.trait]: adaptiveScores[option.trait] + option.weight,
    };
    const nextAnswers: AdaptiveAnswer[] = [
      ...adaptiveAnswers,
      { question: question.text, chosen: option.text, trait: option.trait, weight: option.weight },
    ];
    setAdaptiveScores(nextScores);
    setAdaptiveAnswers(nextAnswers);
    if (nextAnswers.length < adaptiveQuestions.length) return;
    finalize(coreScores, nextScores, nextAnswers, true);
  };

  const undoAdaptive = () => {
    const last = adaptiveAnswers[adaptiveAnswers.length - 1];
    if (!last) return;
    setAdaptiveScores((prev) => ({ ...prev, [last.trait]: prev[last.trait] - last.weight }));
    setAdaptiveAnswers((prev) => prev.slice(0, -1));
  };

  const skipAdaptive = () => {
    runRef.current += 1;
    abortRef.current?.abort();
    setAdaptiveNote('skipped');
    finalize(coreScores, adaptiveScores, adaptiveAnswers, adaptiveAnswers.length > 0);
  };

  const stopNarrative = () => {
    runRef.current += 1;
    abortRef.current?.abort();
    setNarrative('');
    setNarrativeState('stopped');
  };

  const retake = () => {
    runRef.current += 1;
    abortRef.current?.abort();
    setPhase('core');
    setStep(0);
    setCoreScores(emptyScores());
    setCoreHistory([]);
    setAdaptiveQuestions([]);
    setAdaptiveScores(emptyScores());
    setAdaptiveAnswers([]);
    setAdaptiveNote(null);
    setReport(null);
    setFromStorage(false);
    setNarrative('');
    setNarrativeModel('');
    setNarrativeState('idle');
  };

  const ForwardIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;

  if (phase === 'report' && report) {
    return (
      <ReportView
        report={report}
        fromStorage={fromStorage}
        signedIn={userId !== null}
        narrative={narrative}
        narrativeModel={narrativeModel}
        narrativeState={narrativeState}
        adaptiveNote={adaptiveNote}
        onRetake={retake}
        onStopNarrative={stopNarrative}
        onRetryNarrative={() => void runNarrative(report)}
        onAddGrade={() => navigate(userId ? '/profile/edit' : '/auth')}
      />
    );
  }

  if (phase === 'preparing') {
    return (
      <div className="min-h-screen bg-gov-bg pb-24">
        <PageHeader title={t('personality.title')} subtitle={t('personality.adaptive.title')} />
        <div className="p-4">
          <div className="gov-card p-5 text-center">
            <Loader2 size={22} className="mx-auto mb-3 animate-spin text-gov-navy" aria-hidden="true" />
            <p className="text-sm font-semibold text-gov-ink">{t('personality.adaptive.loading')}</p>
            <p className="mt-2 text-[11.5px] leading-relaxed text-gov-muted">
              {t('personality.adaptive.loadingNote')}
            </p>
            <button type="button" onClick={skipAdaptive} className="btn-ghost mt-4 mx-auto">
              {t('personality.adaptive.skip')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'adaptive') {
    const index = adaptiveAnswers.length;
    const question = adaptiveQuestions[index];
    if (!question) return null;
    const progress = ((index + 1) / adaptiveQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-gov-bg pb-24">
        <PageHeader
          title={t('personality.title')}
          subtitle={`${t('personality.adaptive.title')} — ${t('personality.q.label')} ${index + 1} ${t('personality.q.of')} ${adaptiveQuestions.length}`}
        />
        <ProgressBar label={t('personality.progress')} percent={progress} />

        <div className="p-4 space-y-3">
          <div className="gov-card p-4">
            <div
              className="mb-3 flex items-start gap-2 rounded-gov border px-3 py-2"
              style={{ background: AMBER.bg, borderColor: AMBER.border }}
            >
              <Sparkles size={13} className="shrink-0 mt-[3px]" style={{ color: AMBER.ink }} aria-hidden="true" />
              <p className="text-[11px] leading-relaxed text-start" style={{ color: AMBER.ink }}>
                {t('personality.adaptive.badge')}
              </p>
            </div>
            {/* Model output can come back in either script, so its direction is
                detected from the text rather than inherited from the page. */}
            <h2 dir="auto" className="mb-4 text-base font-bold leading-snug text-gov-ink text-start">
              {question.text}
            </h2>
            <div className="space-y-2">
              {question.options.map((option, optionIndex) => (
                <button
                  key={`${option.text}-${optionIndex}`}
                  type="button"
                  onClick={() => answerAdaptive(question, optionIndex)}
                  className="group flex min-h-[48px] w-full items-center justify-between gap-3 rounded-gov border border-gov-line px-4 py-3 text-start transition-colors hover:border-gov-navy hover:bg-gov-bg-soft"
                >
                  <span dir="auto" className="text-sm text-gov-ink text-start">{option.text}</span>
                  <ForwardIcon size={16} className="shrink-0 text-gov-muted group-hover:text-gov-navy" />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {index > 0 && (
              <button type="button" onClick={undoAdaptive} className="btn-ghost">
                <Undo2 size={14} />
                {t('personality.back')}
              </button>
            )}
            <button type="button" onClick={skipAdaptive} className="btn-ghost">
              {t('personality.adaptive.skip')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = RIASEC_QUESTIONS[step];
  const progress = ((step + 1) / CORE_QUESTION_COUNT) * 100;

  return (
    <div className="min-h-screen bg-gov-bg pb-24">
      <PageHeader
        title={t('personality.title')}
        subtitle={`${t('personality.q.label')} ${step + 1} ${t('personality.q.of')} ${CORE_QUESTION_COUNT}`}
      />
      <ProgressBar label={t('personality.progress')} percent={progress} />

      <div className="p-4 space-y-3">
        <div className="gov-card p-4">
          <p className="mb-2 text-[11px] font-semibold text-gov-navy text-start">
            {t('personality.q.label')} {step + 1}
          </p>
          <h2 className="mb-4 text-base font-bold leading-snug text-gov-ink text-start">
            {t(question.textKey)}
          </h2>
          <div className="space-y-2">
            {question.options.map((option) => (
              <button
                key={option.textKey}
                type="button"
                onClick={() => answerCore(option.trait, option.weight)}
                className="group flex min-h-[48px] w-full items-center justify-between gap-3 rounded-gov border border-gov-line px-4 py-3 text-start transition-colors hover:border-gov-navy hover:bg-gov-bg-soft"
              >
                <span className="text-sm text-gov-ink">{t(option.textKey)}</span>
                <ForwardIcon size={16} className="shrink-0 text-gov-muted group-hover:text-gov-navy" />
              </button>
            ))}
          </div>
        </div>

        {step === 0 ? (
          <p className="px-1 text-[11.5px] leading-relaxed text-gov-muted text-start">
            {t('personality.intro.note')}
          </p>
        ) : (
          <button type="button" onClick={undoCore} className="btn-ghost">
            <Undo2 size={14} />
            {t('personality.back')}
          </button>
        )}
      </div>
    </div>
  );
}

function ProgressBar({ label, percent }: { label: string; percent: number }) {
  return (
    <div className="border-b border-gov-line bg-white p-3">
      <div className="mb-1.5 flex items-center justify-between text-[11px] text-gov-muted">
        <span>{label}</span>
        <span className="tabular font-semibold text-gov-ink">{Math.round(percent)}%</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-gov-bg">
        <div className="h-full rounded-full bg-gov-navy transition-all" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

interface ReportViewProps {
  report: StoredReport;
  fromStorage: boolean;
  signedIn: boolean;
  narrative: string;
  narrativeModel: string;
  narrativeState: NarrativeState;
  adaptiveNote: 'unavailable' | 'skipped' | null;
  onRetake: () => void;
  onStopNarrative: () => void;
  onRetryNarrative: () => void;
  onAddGrade: () => void;
}

function ReportView({
  report,
  fromStorage,
  signedIn,
  narrative,
  narrativeModel,
  narrativeState,
  adaptiveNote,
  onRetake,
  onStopNarrative,
  onRetryNarrative,
  onAddGrade,
}: ReportViewProps) {
  const { lang, t } = useLang();

  const totals = useMemo(
    () => sumScores(report.coreScores, report.adaptiveScores),
    [report.coreScores, report.adaptiveScores],
  );
  const ranked = useMemo(() => rankTraits(totals), [totals]);
  const matches = useMemo(
    () => resolveShortlist(report.shortlist, report.path),
    [report.shortlist, report.path],
  );
  const blocked = useMemo(
    () => resolveShortlist(report.blocked, report.path),
    [report.blocked, report.path],
  );
  const reachable = useMemo(
    () => reachableMajors(report.grade, totals, report.path),
    [report.grade, totals, report.path],
  );
  const pathChecked = isPathComplete(report.path);
  const track = report.path?.track;
  const partTwo =
    pathChecked && (track === 'academic' || track === 'vocational') ? partTwoLabel(track, lang) : null;
  const radarData = useMemo(
    () => TRAITS.map((trait) => ({ trait: t(TRAIT_KEYS[trait].short), value: totals[trait] })),
    [totals, t],
  );
  // One numeral system across the app: Latin digits inside Arabic text, the way
  // the Ministry's own publications set their figures (see src/lib/numerals.ts).
  const issued = useMemo(() => isoDate(report.at), [report.at]);

  const top = report.top.length > 0 ? report.top : ranked.slice(0, 3);
  const anyBeyond = matches.some(
    (match) => reachFor(report.grade, match.major.averageAcceptance).reach === 'beyond',
  );

  return (
    <div className="min-h-screen bg-gov-bg pb-24">
      <PageHeader
        title={t('personality.report.title')}
        subtitle={t('personality.report.subtitle')}
        right={
          <div className="flex shrink-0 items-center gap-2">
            {/* The browser's own print dialog saves to PDF on Android and desktop
                alike, so the report leaves the app without a PDF library. */}
            <button
              type="button"
              onClick={() => window.print()}
              aria-label={t('personality.report.print')}
              className="no-print flex h-11 w-11 items-center justify-center rounded-md border border-gov-line text-gov-body hover:bg-gov-bg-soft"
            >
              <Printer size={15} />
            </button>
            <button
              type="button"
              onClick={onRetake}
              aria-label={t('personality.report.retake')}
              className="no-print flex h-11 w-11 items-center justify-center rounded-md border border-gov-line text-gov-body hover:bg-gov-bg-soft"
            >
              <RefreshCcw size={15} />
            </button>
          </div>
        }
      />

      <div className="space-y-3 p-4">
        {/* Header — who this report is about, and what it found */}
        <div className="gov-card p-4">
          <div className="mb-3 flex items-start justify-between gap-3 border-b border-gov-line pb-3">
            <div className="text-start">
              <p className="text-[10px] text-gov-muted">{t('personality.report.id')}</p>
              <p className="tabular text-xs font-bold text-gov-ink">{reportNumber(report.at)}</p>
            </div>
            <div className="text-end">
              <p className="text-[10px] text-gov-muted">{t('personality.report.date')}</p>
              <p className="tabular text-xs font-bold text-gov-ink">{issued}</p>
            </div>
          </div>

          <p className="mb-2 text-[11px] text-gov-muted text-start">{t('personality.report.pattern')}</p>
          <div className="mb-3 flex flex-wrap gap-1.5">
            {top.map((trait) => (
              <span key={trait} className="gov-badge gov-badge-info">
                {t(TRAIT_KEYS[trait].short)}
              </span>
            ))}
          </div>
          <ul className="space-y-1.5">
            {top.map((trait) => (
              <li key={trait} className="text-[11.5px] leading-relaxed text-gov-body text-start">
                <span className="font-semibold text-gov-ink">{t(TRAIT_KEYS[trait].name)}</span>
                {' — '}
                {t(TRAIT_KEYS[trait].desc)}
              </li>
            ))}
          </ul>
          {fromStorage && (
            <p className="mt-3 text-[11px] text-gov-muted text-start">{t('personality.report.previous')}</p>
          )}
        </div>

        {/* AI narrative */}
        <div className="gov-card overflow-hidden">
          <div className="flex items-center justify-between gap-2 border-b border-gov-line bg-gov-bg-soft px-4 py-2.5">
            <div className="flex min-w-0 items-center gap-2">
              <Sparkles size={14} className="shrink-0 text-gov-navy" aria-hidden="true" />
              <p className="gov-section-title truncate">{t('personality.ai.title')}</p>
            </div>
            {narrativeState === 'writing' && (
              <button
                type="button"
                onClick={onStopNarrative}
                className="btn-ghost shrink-0 !min-h-0 !px-2.5 !py-1 !text-[11px]"
              >
                <Square size={10} />
                {t('personality.ai.stop')}
              </button>
            )}
          </div>

          <div className="space-y-3 p-4">
            <div
              className="flex items-start gap-2 rounded-gov border px-3 py-2"
              style={{ background: AMBER.bg, borderColor: AMBER.border }}
            >
              <Sparkles size={13} className="mt-[3px] shrink-0" style={{ color: AMBER.ink }} aria-hidden="true" />
              <p className="text-[11px] leading-relaxed text-start" style={{ color: AMBER.ink }}>
                {t('personality.ai.badge')}
              </p>
            </div>

            {narrativeState === 'writing' && narrative.length === 0 && (
              <p className="flex items-center gap-2 text-[12px] text-gov-muted text-start">
                <Loader2 size={13} className="animate-spin" aria-hidden="true" />
                {t('personality.ai.writing')}
              </p>
            )}

            {narrative.length > 0 && (
              <p
                dir="auto"
                className="whitespace-pre-wrap text-[13px] leading-[1.9] text-gov-body text-start"
              >
                {tidyText(narrative)}
              </p>
            )}

            {(narrativeState === 'unavailable' || narrativeState === 'stopped') && (
              <div className="rounded-gov border border-gov-line bg-gov-bg-soft p-3">
                <div className="flex items-start gap-2">
                  <WifiOff size={13} className="mt-0.5 shrink-0 text-gov-muted" aria-hidden="true" />
                  <p className="text-[11.5px] leading-relaxed text-gov-body text-start">
                    {narrativeState === 'stopped'
                      ? t('personality.ai.stopped')
                      : t('personality.ai.unavailable')}
                  </p>
                </div>
                <button type="button" onClick={onRetryNarrative} className="btn-ghost mt-3">
                  <RotateCcw size={14} />
                  {t('personality.ai.retry')}
                </button>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              {narrativeState === 'done' && narrativeModel && (
                <span className="gov-badge gov-badge-neutral">
                  {t('personality.ai.model')}: {narrativeModel}
                </span>
              )}
            </div>
            <p className="text-[10.5px] leading-relaxed text-gov-muted text-start">
              {t('personality.ai.grounded')}
            </p>
          </div>
        </div>

        {/* Interests map */}
        <div className="gov-card p-4">
          <p className="gov-section-title mb-3 text-start">{t('personality.report.radar')}</p>
          <ResponsiveContainer width="100%" height={220}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="trait" tick={{ fill: '#374151', fontSize: 10 }} />
              <Radar dataKey="value" stroke="#013070" fill="#013070" fillOpacity={0.2} strokeWidth={2} />
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* Shortlist — the app's own ranking, with the average reality check */}
        <div className="gov-card overflow-hidden">
          <div className="border-b border-gov-line bg-gov-bg-soft px-4 py-2.5">
            <p className="gov-section-title text-start">{t('personality.report.shortlist')}</p>
            <p className="mt-0.5 text-[11px] text-gov-muted text-start">
              {t('personality.report.path')}:{' '}
              {pathChecked ? pathLabel(report.path, lang) : t('personality.report.none')}
              {report.grade !== null && (
                <>
                  {' · '}
                  {t('personality.reach.yourAvg')}: <span className="tabular">{report.grade}</span>
                </>
              )}
            </p>
            <p className="mt-1 text-[10.5px] leading-relaxed text-gov-muted text-start">
              {pathChecked ? t('personality.path.filtered') : t('personality.path.unfiltered')}
            </p>
            {/* The two 30/70s are not the same thing: the academic 70% is the
                grade-12 national exam, the vocational 70% is BTEC coursework.
                The label always comes from partTwoLabel so they cannot merge. */}
            {report.grade !== null && partTwo && (
              <p className="mt-1 text-[10.5px] leading-relaxed text-gov-muted text-start">
                {t('personality.path.average')} {partTwo}
              </p>
            )}
          </div>

          <div className="divide-y divide-gov-line">
            {matches.map((entry, index) => {
              const { major, fit, verdict } = entry;
              const { reach, delta } = reachFor(report.grade, major.averageAcceptance);
              const reason = verdictReason(entry, lang, t);
              return (
                <div key={major.id} className="p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 text-start">
                      <p className="text-sm font-semibold text-gov-ink">
                        <span className="tabular">{index + 1}.</span>{' '}
                        {lang === 'ar' ? major.nameAr : major.nameEn}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gov-muted">
                        {t('personality.report.acceptance')}:{' '}
                        <span className="tabular">{major.averageAcceptance}</span>
                      </p>
                    </div>
                    <div className="shrink-0 text-end">
                      <p className="text-[10px] text-gov-muted">{t('personality.report.fit')}</p>
                      <p className="tabular text-sm font-bold text-gov-navy">{fit}</p>
                    </div>
                  </div>

                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <span className={REACH_BADGE[reach]}>{t(REACH_LABEL_KEYS[reach])}</span>
                    {pathChecked && (
                      <span className={VERDICT_BADGE[verdict]}>{t(VERDICT_LABEL_KEYS[verdict])}</span>
                    )}
                    {reach === 'beyond' && delta !== null && (
                      <span className="text-[11px] text-gov-muted">
                        {t('personality.reach.gap')}: <span className="tabular">{Math.abs(delta)}</span>{' '}
                        {t(pointsKey(Math.abs(delta), lang))}
                      </span>
                    )}
                  </div>

                  {pathChecked && reason && (
                    <p className="mt-1.5 text-[11px] leading-relaxed text-gov-muted text-start">{reason}</p>
                  )}

                  <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-gov-bg">
                    <div className="h-full rounded-full bg-gov-navy" style={{ width: `${fit}%` }} />
                  </div>
                </div>
              );
            })}
            {matches.length === 0 && (
              <p className="px-4 py-3 text-[11.5px] leading-relaxed text-gov-body text-start">
                {t('personality.path.noneOpen')}
              </p>
            )}
          </div>

          <div className="space-y-2 border-t border-gov-line px-4 py-3">
            <p className="text-[10.5px] leading-relaxed text-gov-muted text-start">
              {t('personality.report.fitNote')}
            </p>
            {pathChecked && (
              <p className="text-[10.5px] leading-relaxed text-gov-muted text-start">
                {t('personality.path.source')}
              </p>
            )}
            {!pathChecked && (
              <div className="pt-1">
                <p className="text-[11px] leading-relaxed text-gov-body text-start">
                  {t('personality.path.missing')}
                </p>
                <button type="button" onClick={onAddGrade} className="btn-ghost mt-2">
                  {signedIn ? t('personality.path.set') : t('personality.path.signUp')}
                </button>
              </div>
            )}
            <SourceNote source={shortlistSource(matches)} note={t('personality.source.note')} />
            {report.grade === null && (
              <div className="pt-1">
                <p className="text-[11px] leading-relaxed text-gov-body text-start">
                  {t('personality.grade.missing')}
                </p>
                <button type="button" onClick={onAddGrade} className="btn-ghost mt-2">
                  {signedIn ? t('personality.grade.add') : t('personality.grade.signUp')}
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Strong matches the official table closes — shown, never recommended */}
        {pathChecked && blocked.length > 0 && (
          <div className="gov-card overflow-hidden">
            <div className="border-b border-gov-line bg-gov-bg-soft px-4 py-2.5">
              <p className="gov-section-title text-start">{t('personality.blocked.title')}</p>
              <p className="mt-0.5 text-[11px] leading-relaxed text-gov-muted text-start">
                {t('personality.blocked.sub')}
              </p>
            </div>
            <div className="divide-y divide-gov-line">
              {blocked.map((entry) => (
                <div key={entry.major.id} className="px-4 py-2.5 text-start">
                  <div className="flex items-start justify-between gap-3">
                    <p className="text-[13px] font-semibold text-gov-ink">
                      {lang === 'ar' ? entry.major.nameAr : entry.major.nameEn}
                    </p>
                    <span className="shrink-0 text-[11px] text-gov-muted">
                      {t('personality.report.fit')}:{' '}
                      <span className="tabular font-semibold text-gov-navy">{entry.fit}</span>
                    </span>
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-gov-body">
                    {verdictReason(entry, lang, t)}
                  </p>
                </div>
              ))}
            </div>
            <div className="border-t border-gov-line px-4 py-2.5">
              <p className="text-[10.5px] leading-relaxed text-gov-muted text-start">
                {t('personality.blocked.note')}
              </p>
            </div>
          </div>
        )}

        {/* What the average actually reaches — the specific, honest answer */}
        {report.grade !== null && anyBeyond && (
          <div className="gov-card overflow-hidden">
            <div className="border-b border-gov-line bg-gov-bg-soft px-4 py-2.5">
              <p className="gov-section-title text-start">{t('personality.reachable.title')}</p>
              <p className="mt-0.5 text-[11px] text-gov-muted text-start">
                {t('personality.reachable.sub')}
              </p>
              {pathChecked && (
                <p className="mt-0.5 text-[10.5px] leading-relaxed text-gov-muted text-start">
                  {t('personality.reachable.pathNote')}
                </p>
              )}
            </div>
            {reachable.length > 0 ? (
              <>
                <div className="divide-y divide-gov-line">
                  {reachable.map(({ major, fit }) => (
                    <div key={major.id} className="px-4 py-2.5 text-start">
                      <p className="text-[13px] font-semibold text-gov-ink">
                        {lang === 'ar' ? major.nameAr : major.nameEn}
                      </p>
                      <p className="mt-0.5 text-[11px] text-gov-muted">
                        {t('personality.report.acceptance')}:{' '}
                        <span className="tabular">{major.averageAcceptance}</span>
                        {' · '}
                        {t('personality.report.fit')}:{' '}
                        <span className="tabular font-semibold text-gov-navy">{fit}</span>
                      </p>
                    </div>
                  ))}
                </div>
                <div className="border-t border-gov-line px-4 py-2.5">
                  <SourceNote source={shortlistSource(reachable)} compact />
                </div>
              </>
            ) : (
              <p className="px-4 py-3 text-[11.5px] leading-relaxed text-gov-body text-start">
                {t('personality.reachable.none')}
              </p>
            )}
          </div>
        )}

        {/* Score breakdown — the arithmetic, split so the fixed core stays checkable */}
        <div className="gov-card overflow-hidden">
          <div className="border-b border-gov-line bg-gov-bg-soft px-4 py-2.5">
            <p className="gov-section-title text-start">{t('personality.report.tally')}</p>
          </div>
          <div className="px-4 py-3">
            <div className="grid grid-cols-[1fr_3rem_3rem_3rem] items-center gap-y-1 text-[12px]">
              <span className="text-[10px] font-semibold text-gov-muted text-start">
                {t('personality.report.tally.trait')}
              </span>
              <span className="text-[10px] font-semibold text-gov-muted text-end">
                {t('personality.report.tally.core')}
              </span>
              <span className="text-[10px] font-semibold text-gov-muted text-end">
                {t('personality.report.tally.adaptive')}
              </span>
              <span className="text-[10px] font-semibold text-gov-muted text-end">
                {t('personality.report.tally.total')}
              </span>
              {ranked.map((trait) => (
                <Fragment key={trait}>
                  <span className="text-gov-body text-start">{t(TRAIT_KEYS[trait].short)}</span>
                  <span className="tabular text-gov-muted text-end">{report.coreScores[trait]}</span>
                  <span className="tabular text-gov-muted text-end">{report.adaptiveScores[trait]}</span>
                  <span className="tabular font-bold text-gov-ink text-end">{totals[trait]}</span>
                </Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* The follow-ups, quoted back so the AI's contribution is inspectable */}
        {(report.adaptiveAnswers.length > 0 || adaptiveNote !== null) && (
          <div className="gov-card overflow-hidden">
            <div className="border-b border-gov-line bg-gov-bg-soft px-4 py-2.5">
              <p className="gov-section-title text-start">{t('personality.adaptive.answers')}</p>
            </div>
            {report.adaptiveAnswers.length > 0 ? (
              <ol className="divide-y divide-gov-line">
                {report.adaptiveAnswers.map((answer, index) => (
                  <li key={`${answer.question}-${index}`} className="px-4 py-2.5 text-start">
                    <p dir="auto" className="text-[12px] font-semibold leading-relaxed text-gov-ink">
                      {answer.question}
                    </p>
                    <p dir="auto" className="mt-0.5 text-[11.5px] leading-relaxed text-gov-body">
                      {answer.chosen}{' '}
                      <span className="text-gov-muted">
                        ({t(TRAIT_KEYS[answer.trait].short)} +<span className="tabular">{answer.weight}</span>)
                      </span>
                    </p>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="px-4 py-3 text-[11.5px] leading-relaxed text-gov-body text-start">
                {adaptiveNote === 'unavailable'
                  ? t('personality.adaptive.unavailable')
                  : t('personality.adaptive.skipped')}
              </p>
            )}
          </div>
        )}

        {/* Methodology — what this is, stated plainly */}
        <div className="rounded-gov border border-gov-line bg-gov-bg-soft p-3">
          <div className="flex items-start gap-2">
            <FileText size={14} className="mt-0.5 shrink-0 text-gov-muted" aria-hidden="true" />
            <div className="space-y-2 text-start">
              <p className="text-[11px] font-semibold text-gov-ink">{t('personality.method.title')}</p>
              <p className="text-[11px] leading-relaxed text-gov-muted">{t('personality.method.body')}</p>
              <p className="text-[11px] leading-relaxed text-gov-muted">{t('personality.method.adaptive')}</p>
              <p className="text-[11px] leading-relaxed text-gov-muted">{t('personality.method.formula')}</p>
            </div>
          </div>
        </div>

        <p className="px-1 text-[11px] leading-relaxed text-gov-muted text-start">
          {t('personality.disclaimer')}
        </p>
        <p className="px-1 text-[11px] leading-relaxed text-gov-muted text-start">
          {signedIn ? t('personality.report.saved') : t('personality.report.savedGuest')}
        </p>

        <button type="button" onClick={onRetake} className="btn-secondary w-full">
          <RefreshCcw size={15} />
          {t('personality.report.retake')}
        </button>
      </div>
    </div>
  );
}
