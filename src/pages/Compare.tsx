import { useState, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar,
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Legend,
} from 'recharts';
import { Info, X } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SourceNote from '../components/SourceNote';
import { majorsData, DATASET_SOURCES, type Major } from '../data/majors';
import { useLang } from '../i18n/LangContext';
import { useAuth } from '../context/AuthContext';
import { jod, num, pct, signedPct } from '../lib/numerals';
import {
  eligibilityFor, isPathComplete, minimumAverageFor, pathLabel,
  type Eligibility, type StudyPath,
} from '../lib/tawjihi';
import type { TranslationKey } from '../i18n/translations';

const COLORS = ['#003F7D', '#007A4D', '#A88631'];

export default function Compare() {
  const { t, lang, dir } = useLang();
  const rtl = dir === 'rtl';
  const { user } = useAuth();
  const illustrative = DATASET_SOURCES.majors;
  const path: StudyPath | null = user?.path ?? null;
  const pathKnown = isPathComplete(path);

  const [selected, setSelected] = useState<Major[]>([
    majorsData.find((m) => m.id === 'cs')!,
    majorsData.find((m) => m.id === 'medicine')!,
    majorsData.find((m) => m.id === 'media')!,
  ]);
  const [picker, setPicker] = useState<number | null>(null);

  const nameOf = (m: Major) => (lang === 'ar' ? m.nameAr : m.nameEn);

  // Series are keyed on the major id, never on the display name: two majors
  // could share a label, and a duplicated dataKey silently merges two series
  // into one line on the chart.
  const radarAxes: { key: TranslationKey; value: (m: Major) => number }[] = [
    { key: 'tools.compare.axis.salary', value: (m) => (m.firstSalary / 800) * 100 },
    { key: 'tools.compare.axis.growth', value: (m) => m.futureGrowth + 30 },
    { key: 'tools.compare.axis.employment', value: (m) => 100 - m.unemploymentRate },
    { key: 'tools.compare.axis.satisfaction', value: (m) => m.satisfactionScore },
    { key: 'tools.compare.axis.speed', value: (m) => 100 - m.duration * 15 },
    { key: 'tools.compare.axis.affordability', value: (m) => 100 - m.yearlyTuitionGov / 100 },
  ];

  const radarData = radarAxes.map((axis) => {
    const obj: Record<string, string | number> = { category: t(axis.key) };
    selected.forEach((m) => {
      obj[m.id] = Math.max(0, Math.min(100, axis.value(m)));
    });
    return obj;
  });

  const salaryData = [
    { year: t('tools.compare.year1'), ...selected.reduce((a, m) => ({ ...a, [m.id]: m.firstSalary }), {}) },
    { year: t('tools.compare.year5'), ...selected.reduce((a, m) => ({ ...a, [m.id]: m.fiveYearSalary }), {}) },
    { year: t('tools.compare.year10'), ...selected.reduce((a, m) => ({ ...a, [m.id]: m.tenYearSalary }), {}) },
  ];

  const replace = (idx: number, m: Major) => {
    const next = [...selected];
    next[idx] = m;
    setSelected(next);
    setPicker(null);
  };

  // A major already in the comparison must not be offered again: picking it
  // twice produced duplicate React keys and a radar comparing a major with
  // itself. The slot being edited stays available so "change" can be cancelled
  // by re-choosing the same major.
  const pickable = picker === null
    ? []
    : majorsData.filter((m) => !selected.some((s, i) => s.id === m.id && i !== picker));

  return (
    <div className="min-h-screen bg-gov-bg pb-24">
      <PageHeader title={t('tools.compare.title')} subtitle={t('tools.compare.subtitle')} />

      {/* Selected majors */}
      <div className="bg-white border-b border-gov-line p-4">
        <div className="flex items-center justify-between gap-2 mb-2">
          <p className="gov-section-title">{t('tools.compare.selectedTitle')}</p>
          <SourceNote source={illustrative} compact />
        </div>
        <div className="grid grid-cols-3 gap-2">
          {selected.map((m, i) => (
            <button
              key={m.id}
              onClick={() => setPicker(i)}
              className="border border-gov-line rounded-gov p-2.5 text-start hover:bg-gov-bg-soft transition-colors"
              style={{ borderTopColor: COLORS[i], borderTopWidth: 2 }}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-[10px] font-semibold tabular" style={{ color: COLORS[i] }}>
                  #{num(i + 1)}
                </span>
                <span className="text-[10px] text-gov-muted">{t('tools.compare.change')}</span>
              </div>
              <p className="text-xs font-bold text-gov-ink leading-tight">{nameOf(m)}</p>
              <p className="text-[10px] text-gov-muted mt-1">
                {t('tools.compare.unemploymentShort')} {pct(m.unemploymentRate, 1)}
              </p>
              <div className="mt-1.5">
                <EligibilityBadge eligibility={eligibilityFor(m.id, path)} t={t} />
              </div>
            </button>
          ))}
        </div>

        {/* Whose table is being answered here. */}
        <p className="text-[11px] text-gov-muted mt-3 text-start">
          {t('tools.path.label')}:{' '}
          <span className="font-semibold text-gov-body">
            {pathKnown ? pathLabel(path, lang) : t('tools.path.unset')}
          </span>
        </p>
        {!pathKnown && (
          <div className="mt-2">
            <p className="text-[11px] text-gov-body leading-relaxed text-start">{t('tools.path.setPrompt')}</p>
            <Link to="/profile/edit" className="btn-secondary mt-2 inline-flex">
              {t('tools.path.setCta')}
            </Link>
          </div>
        )}
        {path?.track === 'legacy' && (
          <p className="text-[11px] text-gov-body leading-relaxed mt-2 text-start">{t('tools.path.legacyLine')}</p>
        )}
      </div>

      {/* Comparison table */}
      <div className="p-4">
        <div className="gov-card overflow-x-auto">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('tools.compare.criterion')}</th>
                {selected.map((m) => (
                  <th key={m.id} className="text-center">{nameOf(m)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <Row
                label={t('tools.compare.eligibilityRow')}
                values={selected.map((m) => (
                  <EligibilityBadge key={m.id} eligibility={eligibilityFor(m.id, path)} t={t} />
                ))}
              />
              <Row
                label={t('tools.compare.minRowPublic')}
                values={selected.map((m) => {
                  const min = minimumAverageFor(m.id, 'public');
                  return min ? pct(min.percent, 0) : t('tools.min.none');
                })}
              />
              <Row
                label={t('tools.compare.minRowPrivate')}
                values={selected.map((m) => {
                  const min = minimumAverageFor(m.id, 'private');
                  return min ? pct(min.percent, 0) : t('tools.min.none');
                })}
              />
              <Row label={t('data.acceptance.label')} values={selected.map((m) => num(m.averageAcceptance))} />
              <Row
                label={t('tools.compare.duration')}
                values={selected.map((m) => `${num(m.duration)} ${t('calc.years')}`)}
              />
              <Row
                label={t('tools.compare.tuitionGov')}
                values={selected.map((m) => jod(m.yearlyTuitionGov, lang))}
              />
              <Row
                label={t('tools.compare.tuitionPrivate')}
                values={selected.map((m) => jod(m.yearlyTuitionPrivate, lang))}
              />
              <Row
                label={t('data.unemployment.label')}
                values={selected.map((m) => pct(m.unemploymentRate, 1))}
                colorFn={(_, i) => {
                  const n = selected[i].unemploymentRate;
                  if (n < 15) return 'text-gov-ok';
                  if (n < 30) return 'text-gov-warn';
                  return 'text-gov-danger';
                }}
              />
              <Row label={t('tools.compare.firstSalary')} values={selected.map((m) => jod(m.firstSalary, lang))} />
              <Row label={t('tools.compare.salary5')} values={selected.map((m) => jod(m.fiveYearSalary, lang))} />
              <Row label={t('tools.compare.salary10')} values={selected.map((m) => jod(m.tenYearSalary, lang))} />
              <Row
                label={t('tools.compare.growth2030')}
                values={selected.map((m) => signedPct(m.futureGrowth, 0))}
                colorFn={(_, i) => {
                  const n = selected[i].futureGrowth;
                  if (n >= 30) return 'text-gov-ok';
                  if (n >= 0) return 'text-gov-navy';
                  return 'text-gov-danger';
                }}
              />
              <Row
                label={t('tools.compare.postings30')}
                values={selected.map((m) => num(m.jobOpeningsLast30Days))}
              />
              <Row
                label={t('tools.compare.satisfaction')}
                values={selected.map((m) => `${num(m.satisfactionScore)}/100`)}
              />
            </tbody>
          </table>

          {/* The floor is not the cut-off. This sits directly under the two
              minimum rows, because that is where the confusion happens. */}
          <div className="px-3 py-2.5 bg-gov-bg-soft border-t border-gov-line">
            <div className="flex items-start gap-1.5">
              <Info size={12} className="text-gov-navy shrink-0 mt-0.5" />
              <div className="min-w-0 text-start">
                <p className="text-[11px] font-semibold text-gov-ink">{t('tools.min.notCompetitiveShort')}</p>
                <p className="text-[11px] text-gov-body leading-relaxed mt-0.5">{t('tools.min.competitive')}</p>
              </div>
            </div>
            <SourceNote className="mt-1.5" source="admhec-2026" note={t('tools.min.source')} compact />
            <SourceNote className="mt-1" source="admhec-2026" note={t('tools.min.historical')} compact />
            <SourceNote className="mt-1.5" source="mohe-2026" note={t('tools.path.sourceLine')} compact />
            <div className="mt-2 pt-2 border-t border-gov-line">
              <SourceNote source={illustrative} note={t('data.note.majorFigures')} />
              <p className="text-[10.5px] text-gov-muted leading-relaxed mt-1.5 text-start">
                {t('data.note.acceptance')}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Radar chart */}
      <div className="px-4">
        <div className="gov-card p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="gov-section-title">{t('tools.compare.radarTitle')}</h3>
            <SourceNote source={illustrative} compact />
          </div>
          <p className="text-[11px] text-gov-muted mb-3 text-start">{t('tools.compare.radarSubtitle')}</p>
          <ResponsiveContainer width="100%" height={260}>
            <RadarChart data={radarData}>
              <PolarGrid stroke="#E5E7EB" />
              <PolarAngleAxis dataKey="category" tick={{ fill: '#374151', fontSize: 10 }} />
              {selected.map((m, i) => (
                <Radar
                  key={m.id}
                  name={nameOf(m)}
                  dataKey={m.id}
                  stroke={COLORS[i]}
                  fill={COLORS[i]}
                  fillOpacity={0.15}
                  strokeWidth={1.8}
                />
              ))}
              <Legend wrapperStyle={{ fontSize: 11, paddingTop: 8 }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Salary growth */}
      <div className="px-4 mt-4">
        <div className="gov-card p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="gov-section-title">{t('tools.compare.salaryTitle')}</h3>
            <SourceNote source={illustrative} compact />
          </div>
          <p className="text-[11px] text-gov-muted mb-3 text-start">{t('tools.compare.salarySubtitle')}</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={salaryData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="year"
                reversed={rtl}
                tick={{ fill: '#374151', fontSize: 11 }}
              />
              <YAxis
                orientation={rtl ? 'right' : 'left'}
                tick={{ fill: '#374151', fontSize: 10 }}
                tickFormatter={(v: number) => num(v)}
                width={44}
              />
              <Tooltip
                formatter={(v) => (typeof v === 'number' ? jod(v, lang) : String(v ?? ''))}
                contentStyle={{
                  direction: dir,
                  fontSize: 11,
                  textAlign: rtl ? 'right' : 'left',
                  borderRadius: 6,
                  border: '1px solid #E5E7EB',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              {selected.map((m, i) => (
                <Bar key={m.id} name={nameOf(m)} dataKey={m.id} fill={COLORS[i]} radius={[4, 4, 0, 0]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Source footer */}
      <div className="px-4 mt-4">
        <div className="bg-gov-bg-soft border border-gov-line rounded-gov p-3">
          <SourceNote source={illustrative} note={t('data.note.majorFigures')} />
        </div>
      </div>

      {/* Picker modal */}
      {picker !== null && (
        <div
          className="fixed inset-0 z-50 bg-gov-ink/40 flex items-end animate-fade-in"
          onClick={() => setPicker(null)}
        >
          <div
            className="w-full max-w-md mx-auto bg-white rounded-t-xl p-4 max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3 pb-3 border-b border-gov-line">
              <h3 className="text-base font-bold text-gov-ink">{t('tools.compare.pickTitle')}</h3>
              <button
                onClick={() => setPicker(null)}
                className="w-11 h-11 rounded-md border border-gov-line flex items-center justify-center text-gov-body"
                aria-label={t('btn.cancel')}
              >
                <X size={14} />
              </button>
            </div>
            {pickable.length === 0 ? (
              <p className="text-[12px] text-gov-muted leading-relaxed text-start py-4">
                {t('tools.compare.allPicked')}
              </p>
            ) : (
              <div className="divide-y divide-gov-line">
                {pickable.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => replace(picker, m)}
                    className="w-full px-2 py-3 text-start hover:bg-gov-bg-soft"
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-semibold text-gov-ink">{nameOf(m)}</p>
                      <EligibilityBadge eligibility={eligibilityFor(m.id, path)} t={t} />
                    </div>
                    <p className="text-[11px] text-gov-muted mt-0.5">
                      {t('data.acceptance.label')} {num(m.averageAcceptance)} ·{' '}
                      {t('data.unemployment.label')} {pct(m.unemploymentRate, 1)}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function EligibilityBadge({
  eligibility, t,
}: {
  eligibility: Eligibility;
  t: (key: TranslationKey) => string;
}) {
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

function Row({
  label,
  values,
  colorFn,
}: {
  label: string;
  values: ReactNode[];
  colorFn?: (v: ReactNode, index: number) => string;
}) {
  return (
    <tr>
      <td className="text-gov-muted">{label}</td>
      {values.map((v, i) => (
        <td
          key={i}
          className={`text-center font-semibold tabular ${colorFn ? colorFn(v, i) : 'text-gov-ink'}`}
        >
          {v}
        </td>
      ))}
    </tr>
  );
}
