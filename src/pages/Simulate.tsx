// Career-path simulation.
//
// This screen is arithmetic, not prophecy. Each of the three paths applies one
// fixed multiplier to the major's illustrative first salary, and the page now
// prints that multiplier on screen so a reader can redo the sum. Two things the
// round-one version got wrong are fixed here as well: the timeline no longer
// contradicts itself (the worst path says a year is repeated, so graduation and
// everything after it move a year later, and "ten years after graduation" is
// ten years after *this path's* graduation rather than a fixed 2036), and no
// event names a real university, employer or foreign salary any more.
//
// Every string on the screen comes from src/i18n/ns/data.ts, in both languages.

import { useState } from 'react';
import { RotateCcw, Lightbulb, Star, AlertTriangle, type LucideIcon } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SourceNote from '../components/SourceNote';
import { majorsData, DATASET_SOURCES, type Major } from '../data/majors';
import { useLang } from '../i18n/LangContext';
import { fill } from '../i18n/ns/data';
import type { Lang, TranslationKey } from '../i18n/translations';
import { dec, jod, num } from '../lib/numerals';

type ScenarioType = 'likely' | 'best' | 'worst';
type Translate = (key: TranslationKey) => string;

/** The year a student reading this app today would start a degree. */
const SIM_START_YEAR = 2026;

interface ScenarioShape {
  /** Multiplier on the major's illustrative first salary. */
  first: number;
  /** Multiplier at the mid-career step, three years after the first job. */
  step: number;
  /** Multiplier ten years after graduation. */
  decade: number;
  /** Illustrative graduating average out of 4, with the label the app uses for it. */
  gpa: number;
  gpaLabelKey: TranslationKey;
  /** Years added before graduation on this path. */
  extraYears: number;
  midTitleKey: TranslationKey;
  midDescKey: TranslationKey;
  waitKey: TranslationKey;
  stepTitleKey: TranslationKey;
  stepDescKey: TranslationKey;
  settleTitleKey: TranslationKey;
  settleDescKey: TranslationKey;
  decadeTailKey: TranslationKey;
  verdictKey: TranslationKey;
}

const SHAPES: Record<ScenarioType, ScenarioShape> = {
  best: {
    first: 1.4,
    step: 2.2,
    decade: 4.5,
    gpa: 3.6,
    gpaLabelKey: 'calc.gpa.veryGood',
    extraYears: 0,
    midTitleKey: 'data.sim.ev.mid.best.title',
    midDescKey: 'data.sim.ev.mid.best.desc',
    waitKey: 'data.sim.ev.wait.best',
    stepTitleKey: 'data.sim.ev.step.best.title',
    stepDescKey: 'data.sim.ev.step.best.desc',
    settleTitleKey: 'data.sim.ev.settle.best.title',
    settleDescKey: 'data.sim.ev.settle.best.desc',
    decadeTailKey: 'data.sim.ev.decade.tail.best',
    verdictKey: 'data.sim.verdict.best',
  },
  likely: {
    first: 1,
    step: 1.6,
    decade: 3.2,
    gpa: 3,
    gpaLabelKey: 'calc.gpa.good',
    extraYears: 0,
    midTitleKey: 'data.sim.ev.mid.likely.title',
    midDescKey: 'data.sim.ev.mid.likely.desc',
    waitKey: 'data.sim.ev.wait.likely',
    stepTitleKey: 'data.sim.ev.step.likely.title',
    stepDescKey: 'data.sim.ev.step.likely.desc',
    settleTitleKey: 'data.sim.ev.settle.other.title',
    settleDescKey: 'data.sim.ev.settle.other.desc',
    decadeTailKey: 'data.sim.ev.decade.tail.likely',
    verdictKey: 'data.sim.verdict.likely',
  },
  worst: {
    first: 0.6,
    step: 1.1,
    decade: 2.2,
    gpa: 2.4,
    gpaLabelKey: 'calc.gpa.acceptable',
    extraYears: 1,
    midTitleKey: 'data.sim.ev.mid.worst.title',
    midDescKey: 'data.sim.ev.mid.worst.desc',
    waitKey: 'data.sim.ev.wait.worst',
    stepTitleKey: 'data.sim.ev.step.worst.title',
    stepDescKey: 'data.sim.ev.step.worst.desc',
    settleTitleKey: 'data.sim.ev.settle.other.title',
    settleDescKey: 'data.sim.ev.settle.other.desc',
    decadeTailKey: 'data.sim.ev.decade.tail.worst',
    verdictKey: 'data.sim.verdict.worst',
  },
};

const SCENARIOS: {
  type: ScenarioType;
  labelKey: TranslationKey;
  /** Illustrative weight, stated as such on screen. Not a measured probability. */
  weight: number;
  icon: LucideIcon;
  tone: 'navy' | 'green' | 'red';
}[] = [
  { type: 'likely', labelKey: 'data.sim.scenario.likely', weight: 60, icon: Lightbulb, tone: 'navy' },
  { type: 'best', labelKey: 'data.sim.scenario.best', weight: 20, icon: Star, tone: 'green' },
  { type: 'worst', labelKey: 'data.sim.scenario.worst', weight: 20, icon: AlertTriangle, tone: 'red' },
];

interface SimEvent {
  id: string;
  year: number;
  title: string;
  description: string;
}

function employerKey(major: Major): TranslationKey {
  if (major.category === 'tech') return 'data.sim.ev.employer.tech';
  if (major.category === 'medical') return 'data.sim.ev.employer.medical';
  return 'data.sim.ev.employer.other';
}

function buildScenario(major: Major, type: ScenarioType, t: Translate, lang: Lang): SimEvent[] {
  const shape = SHAPES[type];
  const majorName = lang === 'ar' ? major.nameAr : major.nameEn;
  const firstSalary = Math.round(major.firstSalary * shape.first);
  const graduation = SIM_START_YEAR + major.duration + shape.extraYears;

  return [
    {
      id: 'start',
      year: SIM_START_YEAR,
      title: t('data.sim.ev.start.title'),
      description: fill(t('data.sim.ev.start.desc'), { major: majorName }),
    },
    {
      id: 'mid',
      year: SIM_START_YEAR + Math.floor(major.duration / 2),
      title: t(shape.midTitleKey),
      description: t(shape.midDescKey),
    },
    {
      id: 'graduation',
      year: graduation,
      title: t('data.sim.ev.grad.title'),
      description: fill(t('data.sim.ev.grad.desc'), {
        gpa: dec(shape.gpa, 1),
        label: t(shape.gpaLabelKey),
      }),
    },
    {
      id: 'first-job',
      year: graduation,
      title: t('data.sim.ev.firstJob.title'),
      description: fill(t('data.sim.ev.firstJob.desc'), {
        wait: t(shape.waitKey),
        employer: t(employerKey(major)),
        salary: jod(firstSalary, lang),
      }),
    },
    {
      id: 'step',
      year: graduation + 3,
      title: t(shape.stepTitleKey),
      description: fill(t(shape.stepDescKey), {
        salary: jod(Math.round(firstSalary * shape.step), lang),
      }),
    },
    {
      id: 'settle',
      year: graduation + 5,
      title: t(shape.settleTitleKey),
      description: t(shape.settleDescKey),
    },
    {
      id: 'decade',
      year: graduation + 10,
      title: t('data.sim.ev.decade.title'),
      description: fill(t('data.sim.ev.decade.desc'), {
        salary: jod(Math.round(firstSalary * shape.decade), lang),
        tail: t(shape.decadeTailKey),
      }),
    },
  ];
}

export default function Simulate() {
  const { t, lang } = useLang();
  const illustrative = DATASET_SOURCES.majors;
  const [selected, setSelected] = useState<Major | null>(null);
  const [scenario, setScenario] = useState<ScenarioType>('likely');

  const majorName = (m: Major) => (lang === 'ar' ? m.nameAr : m.nameEn);
  const majorAltName = (m: Major) => (lang === 'ar' ? m.nameEn : m.nameAr);

  if (!selected) {
    return (
      <div className="min-h-screen bg-gov-bg pb-24">
        <PageHeader title={t('data.sim.title')} subtitle={t('data.sim.pickSubtitle')} />

        <div className="p-4">
          <div className="bg-gov-bg-soft border border-gov-line rounded-gov p-3 mb-3">
            <p className="text-xs text-gov-body leading-relaxed">{t('data.simulate.intro')}</p>
            <SourceNote className="mt-2" source={illustrative} note={t('data.note.simulation')} />
          </div>

          <p className="gov-section-title mb-2">{t('data.sim.pickTitle')}</p>
          <div className="gov-card divide-y divide-gov-line">
            {majorsData.map((m) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelected(m)}
                className="w-full px-4 py-3 text-start hover:bg-gov-bg-soft"
              >
                <p className="text-sm font-semibold text-gov-ink">{majorName(m)}</p>
                <p className="text-[11px] text-gov-muted mt-0.5">{majorAltName(m)}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const shape = SHAPES[scenario];
  const active = SCENARIOS.find((s) => s.type === scenario) ?? SCENARIOS[0];
  const events = buildScenario(selected, scenario, t, lang);

  return (
    <div className="min-h-screen bg-gov-bg pb-24">
      <PageHeader
        title={fill(t('data.sim.titleFor'), { major: majorName(selected) })}
        subtitle={t('data.sim.subtitle')}
        right={
          <button
            type="button"
            onClick={() => setSelected(null)}
            aria-label={t('data.sim.reset')}
            title={t('data.sim.reset')}
            className="w-9 h-9 rounded-md border border-gov-line flex items-center justify-center text-gov-body shrink-0"
          >
            <RotateCcw size={14} />
          </button>
        }
      />

      {/* Scenario tabs */}
      <div className="bg-white border-b border-gov-line p-3">
        <div className="grid grid-cols-3 gap-2">
          {SCENARIOS.map((s) => {
            const isActive = scenario === s.type;
            const accent =
              s.tone === 'green'
                ? 'border-gov-green text-gov-green'
                : s.tone === 'red'
                  ? 'border-gov-danger text-gov-danger'
                  : 'border-gov-navy text-gov-navy';
            return (
              <button
                key={s.type}
                type="button"
                aria-pressed={isActive}
                onClick={() => setScenario(s.type)}
                className={`p-2.5 rounded-gov border text-center transition-colors min-h-[44px] ${
                  isActive ? `bg-white ${accent} border-2` : 'border-gov-line text-gov-muted bg-white'
                }`}
              >
                <s.icon size={16} className="mx-auto mb-1" />
                <p className="text-[11px] font-semibold leading-snug">{t(s.labelKey)}</p>
                <p className="text-[10px] mt-0.5 opacity-80 tabular">
                  {fill(t('data.sim.weight'), { percent: num(s.weight) })}
                </p>
              </button>
            );
          })}
        </div>
        <p className="text-[10.5px] leading-relaxed text-gov-body mt-2.5 text-start">
          {fill(t('data.sim.basis'), {
            salary: jod(selected.firstSalary, lang),
            factor: dec(shape.first, 1),
          })}
        </p>
        <SourceNote className="mt-2" source={illustrative} note={t('data.simulate.probabilityNote')} />
      </div>

      {/* Timeline */}
      <div className="p-4">
        <div className="flex items-center justify-between gap-2 mb-3">
          <p className="gov-section-title">{t('data.sim.timeline')}</p>
          <SourceNote source={illustrative} compact />
        </div>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr>
                <th className="w-16">{t('data.sim.col.year')}</th>
                <th>{t('data.sim.col.event')}</th>
              </tr>
            </thead>
            <tbody>
              {events.map((e) => (
                <tr key={e.id}>
                  <td className="text-gov-navy font-bold tabular align-top">{e.year}</td>
                  <td>
                    <p className="font-semibold text-gov-ink">{e.title}</p>
                    <p className="text-[12px] text-gov-body leading-relaxed mt-1">{e.description}</p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Verdict */}
      <div className="px-4">
        <div className="gov-card p-4 border-s-4 border-s-gov-navy">
          <p className="text-[11px] font-semibold text-gov-navy mb-1">{t('data.sim.verdictTitle')}</p>
          <p className="text-sm text-gov-ink leading-relaxed">
            {fill(t(shape.verdictKey), {
              major: majorName(selected),
              percent: num(active.weight),
            })}
          </p>
        </div>
      </div>

      {/* Source */}
      <div className="px-4 mt-3">
        <div className="bg-gov-bg-soft border border-gov-line rounded-gov p-3">
          <p className="text-[11px] text-gov-body leading-relaxed mb-2 text-start">
            {t('data.simulate.intro')}
          </p>
          <SourceNote source={illustrative} note={t('data.note.simulation')} />
        </div>
      </div>
    </div>
  );
}
