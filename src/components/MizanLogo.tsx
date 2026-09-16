import { useLang } from '../i18n/LangContext';

interface Props {
  size?: number;
  showText?: boolean;
  variant?: 'mark' | 'wordmark';
  className?: string;
}

/**
 * The Murshidi app icon (`public/favicon.svg`) rendered inline.
 *
 * The SVG is a complete lockup: navy rounded square, white book-and-pen mark,
 * gold star AND the «مُرشِدي / MURSHIDI» wordmark. Never place it on top of a
 * coloured tile, and only enable `showText` where the icon is small enough that
 * its own wordmark is unreadable (headers at ≤40px on a white surface) — on a
 * brand-sized mark the HTML text is a duplicate. See BrandSplash.tsx.
 */
export default function MizanLogo({ size = 48, showText = false, variant = 'mark', className }: Props) {
  const { t } = useLang();
  const base = import.meta.env.BASE_URL || '/';
  const logoSrc = `${base}favicon.svg`.replace(/\/{2,}/g, '/');
  return (
    <div className={`flex items-center gap-2.5${className ? ` ${className}` : ''}`}>
      <img
        src={logoSrc}
        alt={t('app.name')}
        width={size}
        height={size}
        draggable={false}
        decoding="async"
        style={{
          width: size,
          height: size,
          borderRadius: Math.round(size * 0.18),
          display: 'block',
          flexShrink: 0,
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
