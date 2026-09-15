import { useLang } from '../i18n/LangContext';

interface Props {
  size?: number;
  showText?: boolean;
  variant?: 'mark' | 'wordmark';
}

// Murshidi small inline logo (mark only) — matches the full SVG logo
export default function MizanLogo({ size = 48, showText = false, variant = 'mark' }: Props) {
  const { t } = useLang();
  return (
    <div className="flex items-center gap-2.5">
      <img
        src="/favicon.svg"
        alt={t('app.name')}
        width={size}
        height={size}
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.18),
          display: 'block',
        }}
      />

      {showText && (
        <div className="flex flex-col leading-tight">
          <span className="text-base font-bold text-gov-navy">{t('app.name')}</span>
          {variant === 'wordmark' && (
            <span className="text-[10px] text-gov-muted">{t('app.tagline')}</span>
          )}
        </div>
      )}
    </div>
  );
}
