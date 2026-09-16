import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeftRight, Check, ChevronLeft, ChevronRight,
  Info, Printer, ShieldAlert, Wallet,
} from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SourceNote from '../components/SourceNote';
import { majorsData, DATASET_SOURCES, type Major } from '../data/majors';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';
import { governorates, localizeCity } from '../lib/account';
import { recordActivity } from '../lib/activity';
import { dec, isoDate, jod, num, pct } from '../lib/numerals';
import {
  eligibilityFor, isPathComplete, majorsFor, minimumAverageFor, pathLabel,
  type Eligibility, type MinimumAverageAnswer, type StudyPath,
} from '../lib/tawjihi';
import type { TranslationKey } from '../i18n/translations';

type T = (key: TranslationKey) => string;

/** The published floor to be allowed to apply — never the competitive cut-off. */
const GPA_MIN = 60;
const GPA_MAX = 100;
const HOUSING_AND_BOOKS = 1500;

interface ROIResult {
  major: Major;
  /** Tuition + transport + housing/books for ONE year — the figure the budget is compared against. */
  annualCost: number;
  totalCost: number;
  totalIncome: number;
  netROI: number;
  annualReturn: number;
  paybackYears: number;
  /** Above this major's INDICATIVE acceptance average, so public-university fees are assumed. */
  acceptable: boolean;
  /** true when the annual cost is above the budget the student entered in step 1. */
  overBudget: boolean;
  eligibility: Eligibility;
  minPublic: MinimumAverageAnswer | null;
  minPrivate: MinimumAverageAnswer | null;
}

/** Only digits and one decimal point survive a keystroke. Nothing is clamped here. */
function sanitizeNumeric(raw: string): string {
  return raw.replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1').slice(0, 7);
}

function parseNumeric(text: string): number | null {
  const trimmed = text.trim();
  if (!trimmed || trimmed === '.') return null;
  const value = Number(trimmed);
  return Number.isFinite(value) ? value : null;
}

export default function ROICalculator() {
  const { t, lang, dir } = useLang();
  const { user } = useAuth();
  const NextIcon = dir === 'rtl' ? ChevronLeft : ChevronRight;
  // One governorate list for the whole app, so the calculator cannot drift from
  // the one the profile stores, and switching language cannot strand the value.
  const cities = governorates(lang);
  const path: StudyPath | null = user?.path ?? null;
  const pathKnown = isPathComplete(path);

  const [step, setStep] = useState<0 | 1 | 2>(0);

  // The average is held as TEXT, not as a number.
  //
  // The previous model clamped to 60–100 inside onChange, so a student typing
  // "62" was pushed through "6" → 100 on the first keystroke and every result
  // below was silently computed for a different student. The field now keeps
  // exactly what was typed (minus non-numerics), and the range is enforced on
  // blur and at compute time, where the student can see it happen.
  const profileGrade = typeof user?.grade === 'number' && Number.isFinite(user.grade) ? user.grade : null;
  const [gpaText, setGpaText] = useState(() => (profileGrade !== null ? String(profileGrade) : '85'));
  const [budgetText, setBudgetText] = useState('5000');
  const [city, setCity] = useState<string>(() => user?.city || governorates('ar')[0]);
  const [selectedMajors, setSelectedMajors] = useState<string[]>([]);
  // The report is stamped when the student asks for results, not while
  // rendering — reading the clock during render makes the component impure.
  const [issuedAt, setIssuedAt] = useState<number | null>(null);

  const gpaTyped = parseNumeric(gpaText);
  const gpaValid = gpaTyped !== null && gpaTyped >= GPA_MIN && gpaTyped <= GPA_MAX;
  const gpa = gpaValid ? gpaTyped : null;

  const budgetTyped = parseNumeric(budgetText);
  const budget = budgetTyped !== null && budgetTyped > 0 ? budgetTyped : null;

  const clampGpa = (value: number) =>
    Math.min(GPA_MAX, Math.max(GPA_MIN, Math.round(value * 10) / 10));

  const nudgeGpa = (delta: number) => {
    const base = gpaTyped ?? 85;
    setGpaText(String(clampGpa(base + delta)));
  };

  const nudgeBudget = (delta: number) => {
    const base = budgetTyped ?? 0;
    setBudgetText(String(Math.max(0, Math.round(base + delta))));
  };

  const toggleMajor = (id: string) => {
    setSelectedMajors((prev) => {
      if (prev.includes(id)) return prev.filter((x) => x !== id);
      if (prev.length >= 3) return prev;
      return [...prev, id];
    });
  };

  /** Swap a major the student's track does not open for one it does. */
  const swapMajor = (blockedId: string, replacementId: string) => {
    setSelectedMajors((prev) => {
      if (prev.includes(replacementId)) return prev.filter((x) => x !== blockedId);
      return prev.map((x) => (x === blockedId ? replacementId : x));
    });
  };

  const results: ROIResult[] = useMemo(() => {
    if (step !== 2 || gpa === null) return [];
    return selectedMajors
      .map((id) => {
        const m = majorsData.find((x) => x.id === id)!;
        const yearlyTuition = gpa >= m.averageAcceptance ? m.yearlyTuitionGov : m.yearlyTuitionPrivate;
        const transport = localizeCity(city, 'en') === 'Amman' ? 800 : 2000;
        const annualCost = yearlyTuition + transport + HOUSING_AND_BOOKS;
        const totalCost = annualCost * m.duration;
        const employmentProb = 1 - m.unemploymentRate / 100;
        const tenYearIncome =
          (((m.firstSalary + m.fiveYearSalary) / 2) * 12 * 5 +
            ((m.fiveYearSalary + m.tenYearSalary) / 2) * 12 * 5) *
          employmentProb;
        const netROI = tenYearIncome - totalCost;
        const annualReturn = (Math.pow(tenYearIncome / totalCost, 1 / 10) - 1) * 100;
        return {
          major: m,
          annualCost,
          totalCost,
          totalIncome: tenYearIncome,
          netROI,
          annualReturn,
          paybackYears: totalCost / (m.firstSalary * 12 * employmentProb),
          acceptable: gpa >= m.averageAcceptance,
          overBudget: budget !== null && annualCost > budget,
          eligibility: eligibilityFor(m.id, path),
          minPublic: minimumAverageFor(m.id, 'public', gpa),
          minPrivate: minimumAverageFor(m.id, 'private', gpa),
        };
      })
      .sort((a, b) => b.netROI - a.netROI);
  }, [step, selectedMajors, gpa, city, budget, path]);

  const overBudgetResults = results.filter((r) => r.overBudget);

  return (
    <div className="min-h-screen bg-gov-bg pb-24">
      <PageHeader title={t('calc.title')} subtitle={t('calc.subtitle')} />

      {/* Stepper */}
      <div className="bg-white border-b border-gov-line px-4 py-3">
        <div className="flex items-center gap-2">
          {[
            { n: 1, l: t('calc.step.data') },
            { n: 2, l: t('calc.step.majors') },
            { n: 3, l: t('calc.step.results') },
          ].map((s, i) => (
            <div key={s.n} className="flex items-center gap-2 flex-1">
              <div
                className={`w-6 h-6 rounded-full text-[11px] font-bold flex items-center justify-center ${
                  i <= step ? 'bg-gov-navy text-white' : 'bg-gov-bg text-gov-muted border border-gov-line'
                }`}
              >
                {i < step ? <Check size={12} /> : s.n}
              </div>
              <span className={`text-[11px] ${i <= step ? 'text-gov-ink font-semibold' : 'text-gov-muted'}`}>
                {s.l}
              </span>
              {i < 2 && <div className={`flex-1 h-px ${i < step ? 'bg-gov-navy' : 'bg-gov-line'}`} />}
            </div>
          ))}
        </div>
      </div>

      {/* Step 0: Form */}
      {step === 0 && (
        <div className="p-4 space-y-3">
          <div className="gov-card p-4">
            <h3 className="text-sm font-bold text-gov-ink mb-3 text-start">{t('calc.basicInfo')}</h3>

            {/* Average — free text, clamped on blur */}
            <div className="mb-4">
              <label className="gov-label" htmlFor="calc-gpa">{t('calc.gpa')}</label>
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => nudgeGpa(-1)}
                  className="w-12 rounded-md border border-gov-line bg-white text-gov-navy text-xl font-bold hover:bg-gov-bg-soft active:bg-gov-bg transition-colors"
                  aria-label={t('tools.calc.gpa.decrease')}
                >
                  −
                </button>
                <input
                  id="calc-gpa"
                  type="text"
                  inputMode="decimal"
                  autoComplete="off"
                  value={gpaText}
                  onChange={(e) => setGpaText(sanitizeNumeric(e.target.value))}
                  onBlur={() => {
                    if (gpaTyped !== null) setGpaText(String(clampGpa(gpaTyped)));
                  }}
                  aria-invalid={!gpaValid}
                  className="gov-input flex-1 text-center font-bold text-xl tabular"
                />
                <button
                  type="button"
                  onClick={() => nudgeGpa(1)}
                  className="w-12 rounded-md border border-gov-line bg-white text-gov-navy text-xl font-bold hover:bg-gov-bg-soft active:bg-gov-bg transition-colors"
                  aria-label={t('tools.calc.gpa.increase')}
                >
                  +
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1.5">
                <p className="gov-hint text-start">{t('calc.gpa.range')}</p>
                {gpaValid && (
                  <p className="text-[11px] font-semibold text-gov-navy">
                    {gpa! >= 95 ? t('calc.gpa.excellent')
                      : gpa! >= 85 ? t('calc.gpa.veryGood')
                      : gpa! >= 75 ? t('calc.gpa.good')
                      : gpa! >= 65 ? t('calc.gpa.acceptable')
                      : t('calc.gpa.low')}
                  </p>
                )}
              </div>
              {!gpaValid && (
                <p className="text-[11px] font-semibold text-gov-danger mt-1 text-start" role="alert">
                  {t('tools.calc.gpa.invalid')}
                </p>
              )}
              {profileGrade !== null && (
                <p className="text-[10.5px] text-gov-muted mt-1 text-start">{t('tools.calc.gpa.fromProfile')}</p>
              )}
            </div>

            {/* Budget — free text, read by the results */}
            <div className="mb-4">
              <label className="gov-label" htmlFor="calc-budget">{t('calc.budget')}</label>
              <div className="flex items-stretch gap-2">
                <button
                  type="button"
                  onClick={() => nudgeBudget(-500)}
                  className="w-12 rounded-md border border-gov-line bg-white text-gov-navy text-xl font-bold hover:bg-gov-bg-soft active:bg-gov-bg transition-colors"
                  aria-label={t('tools.calc.budget.decrease')}
                >
                  −
                </button>
                <input
                  id="calc-budget"
                  type="text"
                  inputMode="numeric"
                  autoComplete="off"
                  value={budgetText}
                  onChange={(e) => setBudgetText(sanitizeNumeric(e.target.value))}
                  onBlur={() => {
                    if (budgetTyped !== null) setBudgetText(String(Math.max(0, Math.round(budgetTyped))));
                  }}
                  className="gov-input flex-1 text-center font-bold text-xl tabular"
                />
                <button
                  type="button"
                  onClick={() => nudgeBudget(500)}
                  className="w-12 rounded-md border border-gov-line bg-white text-gov-navy text-xl font-bold hover:bg-gov-bg-soft active:bg-gov-bg transition-colors"
                  aria-label={t('tools.calc.budget.increase')}
                >
                  +
                </button>
              </div>
              <div className="flex items-center justify-between gap-2 mt-1.5">
                <p className="gov-hint text-start">{t('calc.budget.includes')}</p>
                <p className="text-[11px] font-semibold text-gov-navy tabular">{jod(budget, lang)}</p>
              </div>
              <p className="text-[10.5px] text-gov-muted leading-relaxed mt-1 text-start">
                {t('tools.calc.budget.note')}
              </p>
              {/* Quick presets */}
              <div className="flex gap-1.5 mt-2">
                {[2000, 5000, 10000, 18000].map((v) => (
                  <button
                    key={v}
                    type="button"
                    onClick={() => setBudgetText(String(v))}
                    className={`flex-1 px-2 py-1.5 rounded-md text-[11px] font-semibold border transition-colors ${
                      budget === v
                        ? 'bg-gov-navy text-white border-gov-navy'
                        : 'bg-white text-gov-body border-gov-line hover:bg-gov-bg-soft'
                    }`}
                  >
                    {num(v / 1000)}K
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="gov-label" htmlFor="calc-city">{t('calc.governorate')}</label>
              <select
                id="calc-city"
                value={localizeCity(city, lang)}
                onChange={(e) => setCity(e.target.value)}
                className="gov-input"
              >
                {cities.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </div>
          </div>

          <button onClick={() => setStep(1)} disabled={!gpaValid} className="btn-primary w-full">
            {t('calc.btn.continueToMajors')}
            <NextIcon size={16} />
          </button>
        </div>
      )}

      {/* Step 1: Pick majors */}
      {step === 1 && (
        <div className="p-4">
          <div className="bg-gov-bg-soft border border-gov-line rounded-gov p-3 mb-3">
            <p className="text-xs text-gov-body text-start">
              {t('calc.pickMajors')}{' '}
              <span className="font-bold tabular">{num(selectedMajors.length)}/3 {t('calc.selected')}</span>
            </p>
          </div>

          <div className="gov-card divide-y divide-gov-line">
            {majorsData.map((m) => {
              const sel = selectedMajors.includes(m.id);
              const aboveIndicative = gpa !== null && gpa >= m.averageAcceptance;
              const displayName = lang === 'ar' ? m.nameAr : m.nameEn;
              const secondaryName = lang === 'ar' ? m.nameEn : m.nameAr;
              return (
                <label
                  key={m.id}
                  className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gov-bg-soft"
                >
                  <input
                    type="checkbox"
                    checked={sel}
                    onChange={() => toggleMajor(m.id)}
                    disabled={!sel && selectedMajors.length >= 3}
                    className="w-4 h-4 accent-gov-navy shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gov-ink">{displayName}</p>
                      <EligibilityBadge eligibility={eligibilityFor(m.id, path)} t={t} />
                    </div>
                    <p className="text-[11px] text-gov-muted mt-0.5 text-start">
                      {secondaryName} · {num(m.duration)} {t('calc.years')} · {pct(m.unemploymentRate, 1)}
                    </p>
                    <p className="text-[10.5px] text-gov-muted mt-0.5 text-start">
                      {aboveIndicative
                        ? t('tools.calc.eligibleIndicative')
                        : `${t('calc.minRequired')} ${num(m.averageAcceptance)}`}
                    </p>
                  </div>
                </label>
              );
            })}
          </div>

          <SourceNote
            className="mt-3"
            source={DATASET_SOURCES.majors}
            note={t('data.note.acceptance')}
          />

          <div className="flex gap-2 mt-4">
            <button onClick={() => setStep(0)} className="btn-secondary flex-1">{t('btn.back')}</button>
            <button
              onClick={() => {
                setIssuedAt(Date.now());
                recordActivity('calculation');
                setStep(2);
              }}
              disabled={selectedMajors.length === 0}
              className="btn-primary flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {t('btn.showResults')}
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Results */}
      {step === 2 && (
        <div className="p-4 space-y-3">
          {/* Reference */}
          <div className="gov-card p-3 flex items-center justify-between gap-2 text-[11px]">
            <div className="text-gov-muted text-start">
              <p>{t('calc.report')}: {issuedAt ? `MRSH-${Math.floor(issuedAt / 1000)}` : '—'}</p>
              <p>{t('calc.reportDate')}: {isoDate(issuedAt ? new Date(issuedAt) : null)}</p>
            </div>
            <button onClick={() => window.print()} className="btn-ghost text-[11px] no-print">
              <Printer size={12} />
              {t('btn.print')}
            </button>
          </div>

          {/* The Ministry's table, BEFORE the money maths. */}
          <TrackCheck
            results={results}
            path={path}
            pathKnown={pathKnown}
            gpa={gpa}
            onSwap={swapMajor}
            t={t}
            lang={lang}
          />

          {/* Budget verdict — the step-1 control is read here, and nowhere else. */}
          {budget !== null && results.length > 0 && (
            <div
              className={`gov-card p-4 border-s-4 ${
                overBudgetResults.length ? 'border-s-gov-warn' : 'border-s-gov-green'
              }`}
            >
              <div className="flex items-start gap-2">
                <Wallet
                  size={16}
                  className={`shrink-0 mt-0.5 ${overBudgetResults.length ? 'text-gov-warn' : 'text-gov-green'}`}
                />
                <div className="flex-1 min-w-0 text-start">
                  <p className="text-sm font-bold text-gov-ink">
                    {overBudgetResults.length ? t('tools.calc.budget.overTitle') : t('tools.calc.budget.within')}
                  </p>
                  <p className="text-[11px] text-gov-muted mt-0.5">
                    {t('calc.budget')}: <span className="tabular font-semibold">{jod(budget, lang)}</span>
                  </p>
                  {overBudgetResults.length > 0 && (
                    <ul className="mt-2 space-y-1">
                      {overBudgetResults.map((r) => (
                        <li key={r.major.id} className="text-[11px] text-gov-body">
                          <span className="font-semibold">{lang === 'ar' ? r.major.nameAr : r.major.nameEn}</span>
                          {' — '}
                          {t('tools.calc.budget.over')}{' '}
                          <span className="tabular font-semibold">{jod(r.annualCost - budget, lang)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="text-[10.5px] text-gov-muted leading-relaxed mt-2">
                    {t('tools.calc.budget.note')}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recommendation */}
          {results.length > 0 && (
            <div className="gov-card p-4 border-s-4 border-s-gov-green">
              <div className="flex items-start gap-2">
                <div className="w-7 h-7 rounded-md bg-gov-green/10 flex items-center justify-center text-gov-green shrink-0">
                  <Check size={15} />
                </div>
                <div className="flex-1 min-w-0 text-start">
                  <p className="text-[11px] font-semibold text-gov-green">{t('calc.recommendation')}</p>
                  <h3 className="text-base font-bold text-gov-ink mt-1">
                    {lang === 'ar' ? results[0].major.nameAr : results[0].major.nameEn} — {t('calc.highestReturn')}
                  </h3>
                  <p className="text-xs text-gov-body mt-1.5 leading-relaxed">
                    {t('calc.expectedROI')}: <strong className="tabular">{jod(results[0].netROI, lang)}</strong>,
                    {' '}{t('calc.annualReturn')} <span className="tabular">{pct(results[0].annualReturn, 1)}</span>.
                  </p>
                  <SourceNote className="mt-2" source={DATASET_SOURCES.majors} />
                </div>
              </div>
            </div>
          )}

          {/* Detailed cards */}
          {results.map((r, i) => (
            <ResultRow key={r.major.id} r={r} rank={i + 1} t={t} lang={lang} />
          ))}

          {/* Source disclosure */}
          <div className="bg-gov-bg-soft border border-gov-line rounded-gov p-3">
            <p className="text-[11px] font-semibold text-gov-body text-start">{t('calc.methodology')}:</p>
            <p className="text-[11px] text-gov-muted leading-relaxed text-start mt-0.5">
              {t('tools.calc.methodBody')}
            </p>
            <SourceNote className="mt-2" source={DATASET_SOURCES.majors} note={t('data.note.roi')} />
            <p className="text-[10.5px] text-gov-muted leading-relaxed mt-1.5 text-start">
              {t('data.note.acceptance')}
            </p>
          </div>

          <button onClick={() => setStep(0)} className="btn-secondary w-full no-print">
            {t('btn.startNew')}
          </button>
        </div>
      )}
    </div>
  );
}

/* ────────────────────────────────────────────────────────────────────────── */

function EligibilityBadge({ eligibility, t }: { eligibility: Eligibility; t: T }) {
  if (eligibility.status === 'eligible') {
    return <span className="gov-badge gov-badge-success">{t('tools.elig.eligible')}</span>;
  }
  if (eligibility.status === 'eligible-technical') {
    return <span className="gov-badge gov-badge-info">{t('tools.elig.technical')}</span>;
  }
  if (eligibility.status === 'not-eligible') {
    return <span className="gov-badge gov-badge-warn">{t('tools.elig.blocked')}</span>;
  }
  return <span className="gov-badge gov-badge-neutral">{t('tools.elig.unpublished')}</span>;
}

/**
 * The Ministry's own table, answered for THIS student, before a single dinar is
 * discussed. The sentence this block exists to produce is
 * `tools.elig.trackBinding.*`: when the average clears the published floor but
 * the track does not open the college, the constraint is the track — and no
 * amount of studying changes it after the end of grade 9.
 */
function TrackCheck({
  results, path, pathKnown, gpa, onSwap, t, lang,
}: {
  results: ROIResult[];
  path: StudyPath | null;
  pathKnown: boolean;
  gpa: number | null;
  onSwap: (blockedId: string, replacementId: string) => void;
  t: T;
  lang: 'ar' | 'en';
}) {
  const reachable = useMemo(() => {
    if (!pathKnown) return { eligible: [], technical: [], blocked: [], unknown: [] };
    return majorsFor(path);
  }, [path, pathKnown]);

  if (results.length === 0) return null;

  const alternatives = [...reachable.eligible, ...reachable.technical]
    .filter((id) => !results.some((r) => r.major.id === id))
    .map((id) => majorsData.find((m) => m.id === id))
    .filter((m): m is Major => Boolean(m));

  const blocked = results.filter((r) => r.eligibility.status === 'not-eligible');

  return (
    <div className="gov-card overflow-hidden">
      <div className="px-4 py-3 bg-gov-bg-soft border-b border-gov-line">
        <div className="flex items-center gap-2">
          <ShieldAlert size={15} className="text-gov-navy shrink-0" />
          <h3 className="text-sm font-bold text-gov-ink text-start">{t('tools.elig.trackCheckTitle')}</h3>
        </div>
        <p className="text-[11px] text-gov-muted mt-1 text-start">
          {t('tools.path.label')}:{' '}
          <span className="font-semibold text-gov-body">
            {pathKnown ? pathLabel(path, lang) : t('tools.path.unset')}
          </span>
        </p>
      </div>

      {!pathKnown && (
        <div className="px-4 py-3 border-b border-gov-line">
          <p className="text-[12px] text-gov-body leading-relaxed text-start">{t('tools.path.setPrompt')}</p>
          <Link to="/profile/edit" className="btn-secondary mt-2 inline-flex">
            {t('tools.path.setCta')}
          </Link>
        </div>
      )}

      {path?.track === 'legacy' && (
        <div className="px-4 py-3 border-b border-gov-line">
          <p className="text-[12px] text-gov-body leading-relaxed text-start">{t('tools.path.legacyLine')}</p>
        </div>
      )}

      <div className="divide-y divide-gov-line">
        {results.map((r) => {
          const e = r.eligibility;
          const meetsFloor = r.minPublic?.meets === true;
          const trackIsBinding = e.status === 'not-eligible' && meetsFloor;
          return (
            <div key={r.major.id} className="px-4 py-3 text-start">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-sm font-bold text-gov-ink">
                  {lang === 'ar' ? r.major.nameAr : r.major.nameEn}
                </p>
                <EligibilityBadge eligibility={e} t={t} />
              </div>

              {e.status === 'eligible' && (
                <p className="text-[11px] text-gov-muted mt-1">
                  {t('tools.elig.officialName')}: <span className="font-semibold text-gov-body">{e.officialCollege}</span>
                  {!e.explicit && e.coveredBy && <> · {t('tools.elig.within')} «{e.coveredBy}»</>}
                </p>
              )}

              {e.status === 'eligible-technical' && (
                <>
                  <p className="text-[11px] text-gov-muted mt-1">
                    {t('tools.elig.officialName')}:{' '}
                    <span className="font-semibold text-gov-body">{e.officialCollege}</span>
                  </p>
                  <p className="text-[11px] text-gov-body leading-relaxed mt-1">
                    {lang === 'ar' ? e.noteAr : e.noteEn}
                  </p>
                  <p className="text-[10.5px] text-gov-muted mt-1">
                    {t('tools.elig.degreeLabel')}: {t('tools.elig.degree.technical')}
                  </p>
                </>
              )}

              {(e.status === 'not-eligible' || e.status === 'unpublished') && (
                <p className="text-[11px] text-gov-body leading-relaxed mt-1">
                  {lang === 'ar' ? e.reasonAr : e.reasonEn}
                </p>
              )}

              {trackIsBinding && (
                <div className="mt-2 rounded-gov border border-gov-warn/40 bg-gov-warn/5 p-3">
                  <div className="flex items-start gap-2">
                    <AlertTriangle size={14} className="text-gov-warn shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <p className="text-[12.5px] font-bold text-gov-ink">{t('tools.elig.trackBinding.title')}</p>
                      <p className="text-[11.5px] text-gov-body leading-relaxed mt-1">
                        {t('tools.elig.trackBinding.body')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* The published floor, next to the student's own average. */}
              <MinimumBlock r={r} gpa={gpa} t={t} lang={lang} />
            </div>
          );
        })}
      </div>

      {blocked.length > 0 && pathKnown && (
        <div className="px-4 py-3 border-t border-gov-line bg-gov-bg-soft">
          <p className="text-[12px] font-bold text-gov-ink text-start">{t('tools.elig.alternativesTitle')}</p>
          {alternatives.length === 0 ? (
            <p className="text-[11px] text-gov-muted leading-relaxed mt-1 text-start">
              {t('tools.elig.alternativesEmpty')}
            </p>
          ) : (
            <>
              <p className="text-[10.5px] text-gov-muted mt-0.5 text-start">{t('tools.elig.alternativesHint')}</p>
              <div className="flex flex-wrap gap-1.5 mt-2">
                {alternatives.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => onSwap(blocked[0].major.id, m.id)}
                    className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-md border border-gov-line bg-white text-[11px] font-semibold text-gov-navy hover:bg-white/60 active:bg-gov-bg transition-colors"
                  >
                    <ArrowLeftRight size={11} />
                    {lang === 'ar' ? m.nameAr : m.nameEn}
                  </button>
                ))}
              </div>
            </>
          )}
          <p className="text-[10.5px] text-gov-muted leading-relaxed mt-2 text-start">
            {t('tools.elig.exploreNote')}
          </p>
        </div>
      )}

      <div className="px-4 py-3 border-t border-gov-line">
        <SourceNote source="mohe-2026" note={t('tools.path.sourceLine')} />
        <SourceNote className="mt-1.5" source="admhec-2026" note={t('tools.min.source')} />
        <SourceNote className="mt-1.5" source="admhec-2026" note={t('tools.min.historical')} />
        <p className="text-[10.5px] text-gov-muted leading-relaxed mt-1.5 text-start">
          {t('tools.path.changeNote')}
        </p>
      </div>
    </div>
  );
}

/**
 * الحدّ الأدنى للالتحاق (published, decision 295/2026) against the student's own
 * average — and, every single time, the statement that الحدّ الأدنى التنافسي for
 * 2026/2027 has not been published. The two are different numbers and the app
 * never lets one stand in for the other.
 */
function MinimumBlock({ r, gpa, t, lang }: { r: ROIResult; gpa: number | null; t: T; lang: 'ar' | 'en' }) {
  if (!r.minPublic && !r.minPrivate) {
    return <p className="text-[10.5px] text-gov-muted mt-2">{t('tools.min.none')}</p>;
  }
  return (
    <div className="mt-2 rounded-gov border border-gov-line bg-white p-3">
      <p className="text-[11.5px] font-bold text-gov-ink text-start">{t('tools.min.title')}</p>
      <div className="grid grid-cols-3 gap-2 mt-2">
        <Cell label={t('tools.min.public')} value={r.minPublic ? pct(r.minPublic.percent, 0) : '—'} />
        <Cell label={t('tools.min.private')} value={r.minPrivate ? pct(r.minPrivate.percent, 0) : '—'} />
        <Cell label={t('tools.min.yours')} value={gpa === null ? '—' : dec(gpa, gpa % 1 === 0 ? 0 : 1)} />
      </div>
      {r.minPublic && (
        <p
          className={`text-[11px] font-semibold mt-2 text-start ${
            r.minPublic.meets === true ? 'text-gov-ok' : r.minPublic.meets === false ? 'text-gov-warn' : 'text-gov-muted'
          }`}
        >
          {r.minPublic.meets === null
            ? t('tools.min.needGrade')
            : r.minPublic.meets
              ? t('tools.min.meets')
              : t('tools.min.short')}
        </p>
      )}
      {/* The tier wording exists only in the decision's own Arabic. Translating
          it would put an official-sounding English phrase on screen that appears
          in no published document, so the decision's own sentence is quoted
          verbatim in both languages — the same treatment /field gives the
          Ministry's college names — and the English UI says why it is Arabic.
          Dropping the line in English, which is what this screen used to do,
          hid the one sentence that tells a student which tier they are in. */}
      {r.minPublic && (
        <p className="text-[10.5px] text-gov-muted mt-1 text-start">
          {t('tools.min.tier')}:{' '}
          <bdi lang="ar" dir="rtl">{r.minPublic.tierAr}</bdi>
        </p>
      )}
      {r.minPublic && lang === 'en' && (
        <p className="text-[10px] text-gov-muted leading-relaxed mt-0.5 text-start">
          {t('field.min.arabicWording')}
        </p>
      )}
      <div className="mt-2 rounded-md bg-gov-bg-soft border border-gov-line p-2.5">
        <div className="flex items-start gap-1.5">
          <Info size={12} className="text-gov-navy shrink-0 mt-0.5" />
          <div className="min-w-0 text-start">
            <p className="text-[11px] font-semibold text-gov-ink">{t('tools.min.notCompetitiveShort')}</p>
            <p className="text-[11px] text-gov-body leading-relaxed mt-0.5">{t('tools.min.competitive')}</p>
          </div>
        </div>
      </div>
      <p className="text-[10.5px] text-gov-muted leading-relaxed mt-1.5 text-start">
        {t('tools.min.subjectFloor')}
      </p>
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-gov-line px-2 py-1.5 text-center">
      <p className="text-[10px] text-gov-muted leading-tight">{label}</p>
      <p className="text-[15px] font-bold text-gov-ink tabular mt-0.5 leading-none">{value}</p>
    </div>
  );
}

function ResultRow({ r, rank, t, lang }: {
  r: ROIResult;
  rank: number;
  t: T;
  lang: 'ar' | 'en';
}) {
  const degreeLabel =
    r.eligibility.status === 'eligible-technical'
      ? t('tools.elig.degree.technical')
      : r.eligibility.status === 'eligible'
        ? t('tools.elig.degree.bachelor')
        : null;

  return (
    <div className="gov-card overflow-hidden">
      <div className="px-4 py-3 bg-gov-bg-soft border-b border-gov-line flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="w-6 h-6 rounded-md bg-gov-navy text-white text-[11px] font-bold flex items-center justify-center shrink-0 tabular">
            {num(rank)}
          </span>
          <div className="min-w-0 text-start">
            <p className="text-sm font-bold text-gov-ink">{lang === 'ar' ? r.major.nameAr : r.major.nameEn}</p>
            <p className="text-[10px] text-gov-muted">
              {r.acceptable ? t('calc.govAccepted') : t('calc.privateOnly')}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <EligibilityBadge eligibility={r.eligibility} t={t} />
          {r.overBudget && (
            <span className="gov-badge gov-badge-warn">
              <AlertTriangle size={10} />
              {t('tools.calc.budget.overShort')}
            </span>
          )}
        </div>
      </div>

      <table className="gov-table">
        <tbody>
          {degreeLabel && (
            <tr>
              <td className="text-gov-muted">{t('tools.elig.degreeLabel')}</td>
              <td className="text-end font-semibold">{degreeLabel}</td>
            </tr>
          )}
          <tr>
            <td className="text-gov-muted">{t('tools.min.title')}</td>
            <td className="text-end font-semibold tabular">
              {r.minPublic ? pct(r.minPublic.percent, 0) : '—'}
              <span className="block text-[10px] font-normal text-gov-muted">
                {t('tools.min.notCompetitiveShort')}
              </span>
            </td>
          </tr>
          <tr>
            <td className="text-gov-muted">{t('calc.minRequired')}</td>
            <td className="text-end font-semibold tabular">{num(r.major.averageAcceptance)}</td>
          </tr>
          <tr>
            <td className="text-gov-muted">{t('calc.duration')}</td>
            <td className="text-end font-semibold tabular">{num(r.major.duration)} {t('calc.years')}</td>
          </tr>
          <tr>
            <td className="text-gov-muted">{t('tools.calc.budget.annual')}</td>
            <td className={`text-end font-semibold tabular ${r.overBudget ? 'text-gov-warn' : 'text-gov-ink'}`}>
              {jod(r.annualCost, lang)}
              {/* Which fee schedule the figure above assumes — derived from the
                  INDICATIVE acceptance average, not from an admission decision. */}
              <span className="block text-[10px] font-normal text-gov-muted">
                {r.acceptable ? t('calc.govAccepted') : t('calc.privateOnly')}
              </span>
            </td>
          </tr>
          <tr>
            <td className="text-gov-muted">{t('calc.totalCost')}</td>
            <td className="text-end font-semibold tabular">{jod(r.totalCost, lang)}</td>
          </tr>
          <tr>
            <td className="text-gov-muted">{t('calc.unemploymentRate')}</td>
            <td className={`text-end font-semibold tabular ${r.major.unemploymentRate > 25 ? 'text-gov-danger' : r.major.unemploymentRate > 15 ? 'text-gov-warn' : 'text-gov-ok'}`}>
              {pct(r.major.unemploymentRate, 1)}
            </td>
          </tr>
          <tr>
            <td className="text-gov-muted">{t('calc.firstSalary')}</td>
            <td className="text-end font-semibold tabular">{jod(r.major.firstSalary, lang)}/{t('common.month')}</td>
          </tr>
          <tr>
            <td className="text-gov-muted">{t('calc.tenYearSalary')}</td>
            <td className="text-end font-semibold tabular">{jod(r.major.tenYearSalary, lang)}/{t('common.month')}</td>
          </tr>
          <tr className="bg-gov-bg-soft">
            <td className="text-gov-body font-semibold">{t('calc.netROI10y')}</td>
            <td className={`text-end font-bold tabular text-base ${r.netROI > 0 ? 'text-gov-ok' : 'text-gov-danger'}`}>
              {r.netROI > 0 ? '+' : ''}{jod(r.netROI, lang)}
            </td>
          </tr>
          <tr className="bg-gov-bg-soft">
            <td className="text-gov-body font-semibold">{t('calc.annualReturnRate')}</td>
            <td className="text-end font-bold tabular text-gov-navy">{pct(r.annualReturn, 2)}</td>
          </tr>
          <tr className="bg-gov-bg-soft">
            <td className="text-gov-body font-semibold">{t('calc.paybackPeriod')}</td>
            <td className="text-end font-bold tabular text-gov-ink">{dec(r.paybackYears, 1)} {t('calc.year')}</td>
          </tr>
        </tbody>
      </table>

      <div className="px-4 py-2.5 border-t border-gov-line">
        <SourceNote source={r.major.source} />
      </div>
    </div>
  );
}
