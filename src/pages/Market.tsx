// The job-market observatory screen.
//
// Round one typed this page's headline figures by hand and the screen ended up
// disagreeing with itself: a KPI of 4,247 active postings sat above a pie whose
// slices summed to 3,843, above a "+8.4% monthly growth" claim that the chart
// directly beneath it refuted.
//
// Nothing here is typed any more. Every number on this screen — the total, the
// month-over-month change, how many occupations grew, both tables, the sector
// split and the governorate split — is read off `occupationSeries` in
// src/data/majors.ts. Making the KPIs disagree with the chart is no longer
// something a careless edit can do; it would need the arithmetic itself to be
// wrong. The counts remain ILLUSTRATIVE and every block says so.

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { TrendingUp, TrendingDown, Coins } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import SourceNote from '../components/SourceNote';
import {
  DATASET_SOURCES,
  POSTING_MONTHS,
  POSTING_REFERENCE_MONTH,
  POSTING_SECTORS,
  governorateSplit,
  jobMarketTrends,
  marketKpis,
  sectorSeries,
  sectorSplit,
  type MarketRow,
  type PostingSectorId,
} from '../data/majors';
import { useLang } from '../i18n/LangContext';
import { fill } from '../i18n/ns/data';
import { jod, num, pct, signedPct } from '../lib/numerals';

/** Chart palette, one colour per sector, shared by the trend chart and the pie. */
const SECTOR_COLOR: Record<PostingSectorId, string> = {
  tech: '#003F7D',
  business: '#A88631',
  medical: '#007A4D',
  engineering: '#1B5594',
  other: '#94A3B8',
};

export default function Market() {
  const { t, lang, dir } = useLang();
  const illustrative = DATASET_SOURCES.jobMarketTrends;
  const rtl = dir === 'rtl';

  const occupationName = (row: MarketRow) => (lang === 'ar' ? row.nameAr : row.nameEn);
  const referenceMonth = t(`data.month.long.${POSTING_REFERENCE_MONTH}`);

  // One row per month, one numeric field per sector — the stacked areas add up
  // to the monthly total, which is the same total the first KPI shows.
  const trendData = POSTING_MONTHS.map((month, i) => {
    const row: Record<string, string | number> = { month: t(`data.month.short.${month}`) };
    for (const s of sectorSeries) row[s.sector] = s.counts[i];
    return row;
  });

  const growthUp = marketKpis.monthlyGrowth >= 0;

  return (
    <div className="min-h-screen bg-gov-bg pb-24">
      <PageHeader title={t('data.market.title')} subtitle={t('data.market.subtitle')} />

      {/* Headline indicators — all three read off the series below */}
      <div className="bg-white border-b border-gov-line px-4 py-3">
        <p className="text-[11px] text-gov-muted mb-2">
          {t('data.market.referenceMonth')}:{' '}
          <span className="font-semibold text-gov-ink">{referenceMonth}</span>
        </p>
        <div className="grid grid-cols-3 gap-3">
          <Indicator
            label={t('data.market.kpi.postings')}
            value={num(marketKpis.activePostings)}
            sub={referenceMonth}
          />
          <Indicator
            label={t('data.market.kpi.growth')}
            value={signedPct(marketKpis.monthlyGrowth, 1)}
            sub={t('data.market.kpi.growthSub')}
            tone={growthUp ? 'ok' : 'danger'}
          />
          <Indicator
            label={t('data.market.kpi.growing')}
            value={num(marketKpis.growingCount)}
            sub={fill(t('data.market.kpi.growingSub'), { total: num(marketKpis.trackedCount) })}
          />
        </div>
        <SourceNote className="mt-3" source={illustrative} note={t('data.market.notice')} />
        <p className="text-[10.5px] leading-relaxed text-gov-muted mt-2 text-start">
          {t('data.market.derived')}
        </p>
      </div>

      {/* Monthly trend — stacked, so the top edge is the monthly total */}
      <div className="p-4">
        <div className="gov-card p-4">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h3 className="gov-section-title">{t('data.market.trendTitle')}</h3>
            <SourceNote source={illustrative} compact />
          </div>
          <p className="text-[11px] text-gov-muted mb-3">{t('data.market.trendSub')}</p>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={trendData} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
              <XAxis
                dataKey="month"
                reversed={rtl}
                tick={{ fill: '#374151', fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                tickFormatter={(v: number) => num(v)}
                orientation={rtl ? 'right' : 'left'}
                tick={{ fill: '#374151', fontSize: 10 }}
                tickLine={false}
                width={38}
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
              {POSTING_SECTORS.map((sector) => (
                <Area
                  key={sector}
                  type="monotone"
                  dataKey={sector}
                  stackId="postings"
                  name={t(`data.sector.${sector}`)}
                  stroke={SECTOR_COLOR[sector]}
                  fill={SECTOR_COLOR[sector]}
                  fillOpacity={0.22}
                  strokeWidth={2}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Occupations growing this month */}
      <div className="px-4">
        <h3 className="gov-section-title mb-2 flex items-center gap-2">
          <TrendingUp size={14} className="text-gov-ok shrink-0" />
          {t('data.market.topHiring')}
          <SourceNote source={illustrative} compact className="ms-auto" />
        </h3>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr>
                <th className="w-8">{t('data.col.rank')}</th>
                <th>{t('data.col.occupation')}</th>
                <th className="text-end">{t('data.col.postings')}</th>
                <th className="text-end w-16">{t('data.col.change')}</th>
              </tr>
            </thead>
            <tbody>
              {jobMarketTrends.topHiring.map((job, i) => (
                <tr key={job.id}>
                  <td className="text-gov-muted tabular">{num(i + 1)}</td>
                  <td className="font-medium text-gov-ink">{occupationName(job)}</td>
                  <td className="text-end tabular">{num(job.count)}</td>
                  <td className="text-end tabular font-semibold text-gov-ok">
                    {signedPct(job.change, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Occupations in decline */}
      <div className="px-4 mt-4">
        <h3 className="gov-section-title mb-2 flex items-center gap-2">
          <TrendingDown size={14} className="text-gov-danger shrink-0" />
          {t('data.market.declining')}
          <SourceNote source={illustrative} compact className="ms-auto" />
        </h3>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr>
                <th>{t('data.col.occupation')}</th>
                <th className="text-end">{t('data.col.postings')}</th>
                <th className="text-end w-16">{t('data.col.change')}</th>
              </tr>
            </thead>
            <tbody>
              {jobMarketTrends.declining.map((job) => (
                <tr key={job.id}>
                  <td className="font-medium text-gov-ink">{occupationName(job)}</td>
                  <td className="text-end tabular">{num(job.count)}</td>
                  <td className="text-end tabular font-semibold text-gov-danger">
                    {signedPct(job.change, 1)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-[10.5px] leading-relaxed text-gov-muted mt-1.5 text-start">
          {t('data.market.tableTotal')}: <span className="tabular font-semibold">{num(marketKpis.activePostings)}</span>
        </p>
      </div>

      {/* Highest-paying skills */}
      <div className="px-4 mt-4">
        <h3 className="gov-section-title mb-2 flex items-center gap-2">
          <Coins size={14} className="text-gov-gold shrink-0" />
          {t('data.market.topPaying')}
          <SourceNote source={illustrative} compact className="ms-auto" />
        </h3>
        <div className="gov-card overflow-hidden">
          <table className="gov-table">
            <thead>
              <tr>
                <th className="w-8">{t('data.col.rank')}</th>
                <th>{t('data.col.skill')}</th>
                <th className="text-end">{t('data.col.avgPay')}</th>
              </tr>
            </thead>
            <tbody>
              {jobMarketTrends.topPaying.map((s, i) => (
                <tr key={s.id}>
                  <td className="text-gov-muted tabular">{num(i + 1)}</td>
                  <td className="font-medium text-gov-ink">{lang === 'ar' ? s.nameAr : s.nameEn}</td>
                  <td className="text-end tabular font-semibold whitespace-nowrap">
                    {jod(s.salary, lang)} / {t('common.month')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two splits of the same reference-month total */}
      <div className="px-4 mt-4 grid grid-cols-2 gap-3">
        <div className="gov-card p-3">
          <div className="flex items-center justify-between gap-1 mb-2">
            <h4 className="text-xs font-bold text-gov-ink">{t('data.market.sectorSplit')}</h4>
            <SourceNote source={illustrative} compact />
          </div>
          <ResponsiveContainer width="100%" height={130}>
            <PieChart>
              <Pie
                data={sectorSplit.map((s) => ({ ...s, name: t(`data.sector.${s.sector}`) }))}
                cx="50%"
                cy="50%"
                innerRadius={28}
                outerRadius={50}
                paddingAngle={2}
                dataKey="count"
                nameKey="name"
                isAnimationActive={false}
              >
                {sectorSplit.map((s) => (
                  <Cell key={s.sector} fill={SECTOR_COLOR[s.sector]} stroke="#FFFFFF" strokeWidth={1.5} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="space-y-1 mt-2">
            {sectorSplit.map((s) => (
              <div key={s.sector} className="flex items-center gap-1.5 text-[10px]">
                <span className="w-2 h-2 rounded-sm shrink-0" style={{ background: SECTOR_COLOR[s.sector] }} />
                <span className="text-gov-body flex-1 min-w-0 truncate">{t(`data.sector.${s.sector}`)}</span>
                <span className="text-gov-ink font-semibold tabular">{num(s.count)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="gov-card p-3">
          <div className="flex items-center justify-between gap-1 mb-2">
            <h4 className="text-xs font-bold text-gov-ink">{t('data.market.geoSplit')}</h4>
            <SourceNote source={illustrative} compact />
          </div>
          <div className="space-y-2">
            {governorateSplit.map((g) => (
              <div key={g.id}>
                <div className="flex items-center justify-between gap-1 text-[10px] mb-1">
                  <span className="text-gov-body min-w-0 truncate">{t(`data.gov.${g.id}`)}</span>
                  <span className="font-semibold text-gov-ink tabular shrink-0">
                    {pct(g.share, 0)} · {num(g.count)}
                  </span>
                </div>
                <div className="h-1.5 bg-gov-bg rounded-sm overflow-hidden">
                  <div className="h-full bg-gov-navy rounded-sm" style={{ width: `${g.share}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="text-[10px] leading-relaxed text-gov-muted mt-2">{t('data.market.geoNote')}</p>
        </div>
      </div>

      {/* Source */}
      <div className="px-4 mt-4">
        <div className="bg-gov-bg-soft border border-gov-line rounded-gov p-3">
          <SourceNote source={illustrative} note={t('data.note.postings')} />
        </div>
      </div>
    </div>
  );
}

function Indicator({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: 'ok' | 'danger';
}) {
  const valueTone =
    tone === 'ok' ? 'text-gov-ok' : tone === 'danger' ? 'text-gov-danger' : 'text-gov-ink';
  return (
    <div className="min-w-0">
      <p className="text-[10px] text-gov-muted leading-snug">{label}</p>
      <p className={`text-base font-bold tabular mt-0.5 ${valueTone}`}>{value}</p>
      <p className="text-[10px] text-gov-muted leading-snug">{sub}</p>
    </div>
  );
}
