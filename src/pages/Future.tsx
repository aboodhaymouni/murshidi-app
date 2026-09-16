// The "future of jobs" screen.
//
// Exactly one figure on this page is attributed to a published source: the
// World Economic Forum's Future of Jobs Report 2025 headline, quoted at the top
// with a link to the report itself. Everything below it — the demand curve, the
// growth and decline percentages, the emerging-roles list — is illustrative and
// says so, both in the badge beside each block and in the caution note at the
// foot. Nothing on this page is presented as a forecast by any body.

import { TrendingUp, TrendingDown, AlertTriangle, FileText, Sparkles } from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import PageHeader from '../components/PageHeader';
import SourceNote from '../components/SourceNote';
import { futureJobs, DATASET_SOURCES, type FutureJob } from '../data/majors';
import { useLang } from '../i18n/LangContext';
import { fill } from '../i18n/ns/data';
import type { TranslationKey } from '../i18n/translations';
import { num, signedPct } from '../lib/numerals';

const WEF_REPORT_URL = 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/';

/** Index curve, 2024 = 100. Illustrative — it is not a published projection. */
const projections = [
  { year: 2024, ai: 100, traditional: 100, design: 100, security: 100 },
  { year: 2026, ai: 145, traditional: 92, design: 118, security: 138 },
  { year: 2028, ai: 178, traditional: 78, design: 132, security: 158 },
  { year: 2030, ai: 195, traditional: 62, design: 148, security: 178 },
  { year: 2032, ai: 215, traditional: 50, design: 158, security: 195 },
  { year: 2035, ai: 245, traditional: 38, design: 172, security: 215 },
];

const CURVES: { key: 'ai' | 'security' | 'design' | 'traditional'; labelKey: TranslationKey; color: string }[] = [
  { key: 'ai', labelKey: 'data.future.line.ai', color: '#003F7D' },
  { key: 'security', labelKey: 'data.future.line.security', color: '#007A4D' },
  { key: 'design', labelKey: 'data.future.line.design', color: '#A88631' },
  { key: 'traditional', labelKey: 'data.future.line.traditional', color: '#DC2626' },
];

/**
 * Roles that did not exist as job titles a decade ago. Illustrative examples —
 * no published inventory of "new occupations" is cited for this list, which is
 * why the subtitle says so rather than implying a count.
 */
const EMERGING_ROLES: { id: string; nameKey: TranslationKey; sectorKey: TranslationKey }[] = [
  { id: 'prompt', nameKey: 'data.future.job.prompt', sectorKey: 'data.future.cat.ai' },
  { id: 'ai-ethics', nameKey: 'data.future.job.aiEthics', sectorKey: 'data.future.cat.ai' },
  { id: 'vr-content', nameKey: 'data.future.job.vrContent', sectorKey: 'data.sector.tech' },
  { id: 'sustainability', nameKey: 'data.future.job.sustainability', sectorKey: 'data.future.cat.env' },
  { id: 'climate-risk', nameKey: 'data.future.job.climateRisk', sectorKey: 'data.future.cat.env' },
  { id: 'dpo', nameKey: 'data.future.job.dpo', sectorKey: 'data.future.cat.cyber' },
  { id: 'robotics', nameKey: 'data.future.job.robotics', sectorKey: 'data.sector.tech' },
  { id: 'genomics', nameKey: 'data.future.job.genomics', sectorKey: 'data.sector.medical' },
];

export default function Future() {
  const { t, lang, dir } = useLang();
  const illustrative = DATASET_SOURCES.futureJobs;
  const rtl = dir === 'rtl';

  const jobName = (j: FutureJob) => (lang === 'ar' ? j.nameAr : j.nameEn);

  return (
    <div className="min-h-screen bg-gov-bg pb-24">
      <PageHeader title={t('data.future.title')} subtitle={t('data.future.subtitle')} />

      {/* Headline — quoted from a published report, with the citation attached */}
      <div className="bg-white border-b border-gov-line p-4">
        <div className="bg-gov-bg-soft border-s-4 border-s-gov-navy p-3 rounded-gov">
          <p className="text-[11px] font-semibold text-gov-navy mb-1">{t('data.future.wefTitle')}</p>
          <p className="text-sm text-gov-ink leading-relaxed">{t('data.future.wefBody')}</p>
          <p className="flex items-start gap-1.5 mt-2 text-start">
            <FileText size={12} className="text-gov-muted shrink-0 mt-[2px]" />
            <span className="text-[10.5px] leading-relaxed text-gov-muted">
              {t('data.sourceLabel')}:{' '}
              <a
                href={WEF_REPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gov-navy font-semibold underline underline-offset-2 decoration-gov-navy/30 hover:decoration-gov-navy"
              >
                {t('data.future.wefCite')}
              </a>
            </span>
          </p>
        </div>
      </div>

      {/* Illustrative demand curve */}
      <div className="p-4">
        <div className="gov-card p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="gov-section-title">{t('data.future.chartTitle')}</h3>
            <SourceNote source={illustrative} compact />
          </div>
          <p className="text-[11px] text-gov-muted mb-3">{t('data.future.chartSub')}</p>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={projections} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="year"
                reversed={rtl}
                tick={{ fill: '#374151', fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => num(v)}
                orientation={rtl ? 'right' : 'left'}
                tick={{ fill: '#374151', fontSize: 10 }}
                tickLine={false}
                width={34}
              />
              <Tooltip
                contentStyle={{
                  direction: dir,
                  fontSize: 11,
                  textAlign: rtl ? 'right' : 'left',
                  borderRadius: 6,
                  border: '1px solid #E5E7EB',
                }}
              />
              <Legend wrapperStyle={{ fontSize: 11, direction: dir }} />
              {CURVES.map((c) => (
                <Line
                  key={c.key}
                  type="monotone"
                  dataKey={c.key}
                  name={t(c.labelKey)}
                  stroke={c.color}
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Growing */}
      <div className="px-4">
        <h3 className="gov-section-title mb-2 flex items-center gap-2">
          <TrendingUp size={14} className="text-gov-ok shrink-0" />
          {t('data.future.growing')}
          <SourceNote source={illustrative} compact className="ms-auto" />
        </h3>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('data.col.occupation')}</th>
                <th className="text-end w-32">{t('data.future.col.growth')}</th>
              </tr>
            </thead>
            <tbody>
              {futureJobs.growing.map((j) => (
                <tr key={j.id}>
                  <td className="font-medium text-gov-ink">{jobName(j)}</td>
                  <td className="text-end">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-14 h-1.5 bg-gov-bg rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full bg-gov-ok rounded-full"
                          style={{ width: `${Math.min(Math.abs(j.growth), 100)}%` }}
                        />
                      </div>
                      <span className="font-bold tabular text-gov-ok w-12 text-end">
                        {signedPct(j.growth, 0)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Declining */}
      <div className="px-4 mt-4">
        <h3 className="gov-section-title mb-2 flex items-center gap-2">
          <TrendingDown size={14} className="text-gov-danger shrink-0" />
          {t('data.future.declining')}
          <SourceNote source={illustrative} compact className="ms-auto" />
        </h3>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('data.col.occupation')}</th>
                <th className="text-end w-32">{t('data.future.col.decline')}</th>
              </tr>
            </thead>
            <tbody>
              {futureJobs.declining.map((j) => (
                <tr key={j.id}>
                  <td className="font-medium text-gov-ink">{jobName(j)}</td>
                  <td className="text-end">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-14 h-1.5 bg-gov-bg rounded-full overflow-hidden shrink-0">
                        <div
                          className="h-full bg-gov-danger rounded-full"
                          style={{ width: `${Math.min(Math.abs(j.growth), 100)}%` }}
                        />
                      </div>
                      <span className="font-bold tabular text-gov-danger w-12 text-end">
                        {signedPct(j.growth, 0)}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10.5px] leading-relaxed text-gov-muted mt-1.5 text-start">
          {fill(t('data.future.horizon'), { year: futureJobs.growing[0].year })}
        </p>
      </div>

      {/* Emerging roles */}
      <div className="px-4 mt-4">
        <h3 className="gov-section-title mb-1 flex items-center gap-2">
          <Sparkles size={14} className="text-gov-gold shrink-0" />
          {t('data.future.newJobs')}
          <SourceNote source={illustrative} compact className="ms-auto" />
        </h3>
        <p className="text-[11px] text-gov-muted mb-2">{t('data.future.newJobsSub')}</p>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('data.col.occupation')}</th>
                <th className="text-end w-40">{t('data.future.col.sector')}</th>
              </tr>
            </thead>
            <tbody>
              {EMERGING_ROLES.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium text-gov-ink">{t(r.nameKey)}</td>
                  <td className="text-end">
                    <span className="gov-badge gov-badge-info">{t(r.sectorKey)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Caution */}
      <div className="px-4 mt-4">
        <div className="bg-gov-bg-soft border-s-4 border-s-gov-warn rounded-gov p-3">
          <div className="flex items-start gap-2">
            <AlertTriangle size={14} className="text-gov-warn shrink-0 mt-0.5" />
            <div>
              <p className="text-[11px] font-semibold text-gov-warn mb-1">
                {t('data.future.cautionTitle')}
              </p>
              <p className="text-[11px] text-gov-body leading-relaxed">{t('data.future.caution')}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Sources */}
      <div className="px-4 mt-3">
        <div className="bg-gov-bg-soft border border-gov-line rounded-gov p-3">
          <SourceNote source={illustrative} note={t('data.note.projections')} />
        </div>
      </div>
    </div>
  );
}
