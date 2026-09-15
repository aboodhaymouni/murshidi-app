import { ExternalLink, RefreshCw } from 'lucide-react';
import { useLang } from '../i18n/LangContext';
import { usePublicData } from '../data/PublicDataContext';

export default function DataStatus({ sourceId, compact = false }: { sourceId?: string; compact?: boolean }) {
  const { lang } = useLang();
  const { data, loading, refreshing, canRefresh, error, refresh } = usePublicData();
  const ar = lang === 'ar';
  const sources = data.sources.filter(source => !sourceId || source.id === sourceId);
  const autoRefreshSourceIds = new Set(['dos-unemployment', 'tawjihi-2026', 'admhec-programs', 'admhec-cutoffs']);
  const selectionCanRefresh = canRefresh && sources.some(source => autoRefreshSourceIds.has(source.id));
  const labels = {
    live: ar ? 'تم التحقق من المصدر' : 'Source checked',
    snapshot: ar ? 'نسخة موثقة محفوظة' : 'Verified saved copy',
    stale: ar ? 'آخر نسخة محفوظة' : 'Last saved copy',
    unavailable: ar ? 'غير متاح حاليًا' : 'Currently unavailable',
  };
  const date = (value: string | null) => value ? new Date(value).toLocaleDateString(ar ? 'ar-JO' : 'en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : (ar ? 'غير محدد' : 'Not specified');

  return (
    <section className={`rounded-xl border border-gov-line bg-white ${compact ? 'p-3' : 'p-4'} text-xs`} aria-label={ar ? 'المصادر وتحديث البيانات' : 'Sources and data updates'}>
      <div className="flex items-center justify-between gap-3">
        <span className="font-bold text-gov-ink">{ar ? 'بيانات عامة موثقة' : 'Verified public data'}</span>
        {selectionCanRefresh ? <button type="button" onClick={() => void refresh()} disabled={loading || refreshing}
          className="min-h-[44px] flex items-center gap-2 rounded-lg px-3 text-gov-green font-semibold disabled:opacity-60 hover:bg-gov-bg-soft"
          aria-label={ar ? 'التحقق من أحدث البيانات الرسمية' : 'Check the latest official data'}>
          <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
          {refreshing ? (ar ? 'جارٍ التحقق…' : 'Checking…') : (ar ? 'تحديث' : 'Refresh')}
        </button> : <span className="text-gov-muted text-end">{ar ? 'نسخة موثقة مؤرخة' : 'Dated verified copy'}</span>}
      </div>
      <div className="space-y-3">
        {sources.map(source => (
          <div key={source.id} className="leading-relaxed">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
              <a dir="auto" className="inline-flex items-center gap-1 font-semibold text-gov-ink underline decoration-gov-line underline-offset-4" href={source.url} target="_blank" rel="noreferrer">
                {source.titleAr}<ExternalLink size={11} aria-hidden="true" />
              </a>
              <span className={source.status === 'stale' || source.status === 'unavailable' ? 'text-amber-800' : 'text-gov-muted'}>{labels[source.status]}</span>
            </div>
            <p className="text-gov-muted">{ar ? 'فترة البيانات: ' : 'Data period: '}<bdi>{source.referencePeriod}</bdi></p>
            {!compact && <p className="text-gov-muted">{ar ? 'آخر تحقق: ' : 'Last checked: '}{date(source.checkedAt)}{source.publishedAt ? ` · ${ar ? 'النشر: ' : 'Published: '}${date(source.publishedAt)}` : ''}</p>}
            {!compact && !autoRefreshSourceIds.has(source.id) && <p className="text-gov-muted">{ar ? 'تُراجع هذه الخلاصة يدويًا عند صدور نسخة رسمية أحدث.' : 'This summary is reviewed manually when a newer official release appears.'}</p>}
          </div>
        ))}
      </div>
      <p className="sr-only" role="status">{refreshing ? (ar ? 'يجري قراءة المصادر الرسمية، وتبقى البيانات الحالية ظاهرة.' : 'Reading official sources; current data remains visible.') : ''}</p>
      {error && <p role="status" className="mt-3 text-amber-800 leading-relaxed">{ar ? 'تعذّر التحقق من بعض المصادر الآن. ما زالت آخر نسخة موثقة ظاهرة بسنة بياناتها.' : 'Some sources could not be checked. The last verified copy and its original data period remain visible.'}</p>}
    </section>
  );
}
