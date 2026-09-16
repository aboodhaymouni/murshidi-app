import { FileText, Info } from 'lucide-react';
import { SOURCES, isIllustrative, type SourceId } from '../data/sources';
import { useLang } from '../i18n/LangContext';

interface Props {
  /** Which registry entry this block of numbers comes from. */
  source: SourceId;
  className?: string;
  /** One extra honest clause, already translated by the caller. */
  note?: string;
  /** Chip form — sits inside a card header, next to the numbers it covers. */
  compact?: boolean;
}

/**
 * Renders either a cited source line or the illustrative badge.
 * It belongs next to the figures it describes, not at the bottom of the page.
 */
export default function SourceNote({ source, className = '', note, compact = false }: Props) {
  const { lang, t } = useLang();
  const ref = SOURCES[source];
  const label = lang === 'ar' ? ref.labelAr : ref.labelEn;

  if (isIllustrative(source)) {
    if (compact) {
      return (
        <span className={`gov-badge gov-badge-warn shrink-0 ${className}`}>
          <Info size={10} strokeWidth={2.4} />
          {t('data.illustrative.short')}
        </span>
      );
    }
    return (
      <div className={`flex flex-wrap items-center gap-x-2 gap-y-1 text-start ${className}`}>
        <span className="gov-badge gov-badge-warn">
          <Info size={11} strokeWidth={2.4} />
          {label}
        </span>
        {note && <span className="text-[10.5px] leading-relaxed text-gov-muted">{note}</span>}
      </div>
    );
  }

  const labelNode = ref.url ? (
    <a
      href={ref.url}
      target="_blank"
      rel="noopener noreferrer"
      className="text-gov-navy font-semibold underline underline-offset-2 decoration-gov-navy/30 hover:decoration-gov-navy"
    >
      {label}
    </a>
  ) : (
    <span className="text-gov-body font-semibold">{label}</span>
  );

  if (compact) {
    return (
      <p className={`text-[10.5px] leading-relaxed text-gov-muted text-start ${className}`}>
        {t('data.sourceLabel')}: {labelNode}
        {note && <span> — {note}</span>}
      </p>
    );
  }

  return (
    <div className={`flex items-start gap-1.5 text-start ${className}`}>
      <FileText size={12} className="text-gov-muted shrink-0 mt-[2px]" />
      <p className="text-[10.5px] leading-relaxed text-gov-muted">
        {t('data.sourceLabel')}: {labelNode}
        {note && <span> — {note}</span>}
      </p>
    </div>
  );
}
