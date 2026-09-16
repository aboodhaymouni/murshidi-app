// Alternative post-secondary routes — diplomas, short certificates, bootcamps.
//
// Two honesty rules shape this file. First, the only sourced figure on the page
// is the Department of Statistics unemployment rate at the top; the costs,
// starting salaries and field-level unemployment rates of the tracks below are
// illustrative and every card carries the badge. Second, no track is attributed
// to a named provider or to a named qualification the app cannot cite — the
// round-one version advertised specific platforms and a specific BTEC diploma
// by name, which the app has no published basis to describe.

import { GraduationCap } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SourceNote from '../components/SourceNote';
import { dosUnemployment } from '../data/majors';
import { useLang } from '../i18n/LangContext';
import type { TranslationKey } from '../i18n/translations';
import { jod, pct } from '../lib/numerals';

interface QuickRow {
  id: string;
  nameKey: TranslationKey;
  durationKey: TranslationKey;
  /** Total illustrative cost of the whole route, in JOD. */
  cost: number;
  tone: 'long' | 'short';
}

const QUICK_COMPARE: QuickRow[] = [
  {
    id: 'bachelor',
    nameKey: 'data.alt.quick.bachelor',
    durationKey: 'data.alt.quick.bachelorDur',
    cost: 25000,
    tone: 'long',
  },
  {
    id: 'diploma',
    nameKey: 'data.alt.quick.diploma',
    durationKey: 'data.alt.quick.diplomaDur',
    cost: 5000,
    tone: 'short',
  },
  {
    id: 'certs',
    nameKey: 'data.alt.quick.certs',
    durationKey: 'data.alt.quick.certsDur',
    cost: 1500,
    tone: 'short',
  },
];

interface AlternativeTrack {
  id: string;
  nameKey: TranslationKey;
  descKey: TranslationKey;
  typeKey: TranslationKey;
  durationKey: TranslationKey;
  /** All three figures are illustrative; the card says so. */
  cost: number;
  startSalary: number;
  unemployment: number;
}

const TRACKS: AlternativeTrack[] = [
  {
    id: 'interior',
    nameKey: 'data.alt.item.interior.name',
    descKey: 'data.alt.item.interior.desc',
    typeKey: 'data.alt.type.diploma',
    durationKey: 'data.alt.dur.twoYears',
    cost: 4500,
    startSalary: 380,
    unemployment: 22,
  },
  {
    id: 'cad',
    nameKey: 'data.alt.item.cad.name',
    descKey: 'data.alt.item.cad.desc',
    typeKey: 'data.alt.type.certificate',
    durationKey: 'data.alt.dur.sixMonths',
    cost: 1800,
    startSalary: 450,
    unemployment: 18,
  },
  {
    id: 'fullstack',
    nameKey: 'data.alt.item.fullstack.name',
    descKey: 'data.alt.item.fullstack.desc',
    typeKey: 'data.alt.type.bootcamp',
    durationKey: 'data.alt.dur.nineMonths',
    cost: 2500,
    startSalary: 650,
    unemployment: 8,
  },
  {
    id: 'cyber',
    nameKey: 'data.alt.item.cyber.name',
    descKey: 'data.alt.item.cyber.desc',
    typeKey: 'data.alt.type.diploma',
    durationKey: 'data.alt.dur.twoYears',
    cost: 3800,
    startSalary: 580,
    unemployment: 6,
  },
  {
    id: 'nursing',
    nameKey: 'data.alt.item.nursing.name',
    descKey: 'data.alt.item.nursing.desc',
    typeKey: 'data.alt.type.diploma',
    durationKey: 'data.alt.dur.threeYears',
    cost: 5400,
    startSalary: 380,
    unemployment: 11,
  },
  {
    id: 'career',
    nameKey: 'data.alt.item.career.name',
    descKey: 'data.alt.item.career.desc',
    typeKey: 'data.alt.type.certificate',
    durationKey: 'data.alt.dur.fourToSixMonths',
    cost: 600,
    startSalary: 480,
    unemployment: 15,
  },
];

export default function Alternatives() {
  const { t, lang } = useLang();

  return (
    <div className="min-h-screen bg-gov-bg pb-24">
      <PageHeader title={t('data.alt.title')} subtitle={t('data.alt.subtitle')} />

      {/* Intro — the one sourced figure on this page */}
      <div className="bg-white border-b border-gov-line p-4">
        <div className="bg-gov-bg-soft border-s-4 border-s-gov-green rounded-gov p-3">
          <div className="flex items-start gap-2">
            <GraduationCap size={16} className="text-gov-green shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-gov-green mb-1">
                {t('data.alt.messageTitle')}
              </p>
              <p className="text-xs text-gov-body leading-relaxed">{t('data.alternatives.message')}</p>
              <p className="text-xs text-gov-ink font-semibold mt-2">
                {t('data.alternatives.context')}:{' '}
                <span className="tabular">{pct(dosUnemployment.jordanians, 1)}</span>{' '}
                <span className="font-normal text-gov-muted">({t('data.dos.period')})</span>
              </p>
              <SourceNote className="mt-1.5" source={dosUnemployment.source} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick comparison */}
      <div className="p-4">
        <h3 className="gov-section-title mb-2 flex items-center gap-2">
          {t('data.alt.quickCompare')}
          <SourceNote source="illustrative" compact className="ms-auto" />
        </h3>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('data.alt.col.track')}</th>
                <th className="text-end">{t('data.alt.col.duration')}</th>
                <th className="text-end">{t('data.alt.col.cost')}</th>
              </tr>
            </thead>
            <tbody>
              {QUICK_COMPARE.map((row) => (
                <tr key={row.id}>
                  <td className="font-medium text-gov-ink">{t(row.nameKey)}</td>
                  <td
                    className={`text-end tabular ${
                      row.tone === 'long' ? 'text-gov-danger' : 'text-gov-ok'
                    }`}
                  >
                    {t(row.durationKey)}
                  </td>
                  <td className="text-end tabular font-semibold whitespace-nowrap">
                    {jod(row.cost, lang)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* The tracks themselves */}
      <div className="px-4">
        <h3 className="gov-section-title mb-2">{t('data.alt.available')}</h3>
        <div className="space-y-3">
          {TRACKS.map((a) => (
            <div key={a.id} className="gov-card overflow-hidden">
              <div className="px-4 py-3 border-b border-gov-line flex items-center justify-between gap-2">
                <h4 className="text-sm font-bold text-gov-ink leading-tight flex-1 min-w-0">
                  {t(a.nameKey)}
                </h4>
                <SourceNote source="illustrative" compact />
                <span className="gov-badge gov-badge-info shrink-0">{t(a.typeKey)}</span>
              </div>
              <div className="p-4">
                <p className="text-xs text-gov-body leading-relaxed mb-3">{t(a.descKey)}</p>
                <table className="gov-table">
                  <tbody>
                    <tr>
                      <td className="text-gov-muted">{t('data.alt.row.duration')}</td>
                      <td className="text-end font-semibold">{t(a.durationKey)}</td>
                    </tr>
                    <tr>
                      <td className="text-gov-muted">{t('data.alt.row.cost')}</td>
                      <td className="text-end font-semibold tabular whitespace-nowrap">
                        {jod(a.cost, lang)}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-gov-muted">{t('data.alt.row.startSalary')}</td>
                      <td className="text-end font-semibold tabular whitespace-nowrap">
                        {jod(a.startSalary, lang)} / {t('common.month')}
                      </td>
                    </tr>
                    <tr>
                      <td className="text-gov-muted">{t('data.alt.row.unemployment')}</td>
                      <td
                        className={`text-end font-semibold tabular ${
                          a.unemployment < 15 ? 'text-gov-ok' : 'text-gov-warn'
                        }`}
                      >
                        {pct(a.unemployment, 0)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Source */}
      <div className="px-4 mt-4">
        <div className="bg-gov-bg-soft border border-gov-line rounded-gov p-3">
          <SourceNote source="illustrative" note={t('data.note.alternatives')} />
        </div>
      </div>
    </div>
  );
}
