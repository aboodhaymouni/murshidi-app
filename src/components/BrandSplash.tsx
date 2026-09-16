import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { useLang } from '../i18n/LangContext';
import HashemiteEmblem from './HashemiteEmblem';

/**
 * The first frame of the app.
 *
 * `public/favicon.svg` is a FINISHED 1254×1254 lockup — navy rounded square,
 * white book-and-pen mark, gold star and the «مُرشِدي / MURSHIDI» wordmark are
 * all drawn inside it. It is therefore placed on a plain white field with
 * nothing behind it: no second coloured tile, and the wordmark is never
 * repeated as HTML text (BUILD_SPEC §4.1).
 *
 * Motion is deliberately flat — a single ease-out settle, no bounce, no spring,
 * no spinner — and every transition is dropped when the visitor asks for
 * reduced motion.
 */

/** Total time the brand frame is held before `onDone` fires. */
const HOLD_MS = 1800;

const MARK_SIZE = 132;
const MARK_DURATION = 520;
const TAGLINE_DELAY = 260;
const TAGLINE_DURATION = 420;
const FOOTER_DELAY = 460;
const FOOTER_DURATION = 420;
const BAR_DELAY = 620;
const BAR_DURATION = 1080; // 620 + 1080 = 1700ms — the hairline lands just before the hold ends
const EASE = 'cubic-bezier(0.22, 0.61, 0.36, 1)'; // ease-out, never overshoots

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);

  return reduced;
}

interface Props {
  /** Fired once the brand frame has been held for its full duration. */
  onDone?: () => void;
}

export default function BrandSplash({ onDone }: Props) {
  const { t } = useLang();
  const reduced = usePrefersReducedMotion();
  const [entered, setEntered] = useState(false);

  const onDoneRef = useRef(onDone);
  useEffect(() => {
    onDoneRef.current = onDone;
  }, [onDone]);

  const base = import.meta.env.BASE_URL || '/';
  const markSrc = `${base}favicon.svg`.replace(/\/{2,}/g, '/');

  // Flip to the settled state on the frame after mount so the CSS transitions
  // run. The timer is a fallback: a page opened in a background tab never gets
  // a rAF callback, and the splash must still end up in its settled state.
  useEffect(() => {
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => setEntered(true));
    });
    const fallback = setTimeout(() => setEntered(true), 120);
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
      clearTimeout(fallback);
    };
  }, []);

  // Hand the screen over once the brand moment has been held.
  useEffect(() => {
    const timer = setTimeout(() => onDoneRef.current?.(), HOLD_MS);
    return () => clearTimeout(timer);
  }, []);

  // Dismiss the native Android/iOS splash as soon as this frame paints, so the
  // hand-off from the system splash to the web splash has no white flash.
  // Guarded: on a plain web build neither plugin call runs.
  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { Capacitor } = await import('@capacitor/core');
        if (cancelled || !Capacitor.isNativePlatform()) return;
        const { SplashScreen } = await import('@capacitor/splash-screen');
        if (cancelled) return;
        await SplashScreen.hide({ fadeOutDuration: 250 });
      } catch {
        // Running outside Capacitor, or the plugin is unavailable — nothing to hide.
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const settled = reduced || entered;

  const fade = (delay: number, duration: number): CSSProperties =>
    reduced
      ? {}
      : {
          transitionProperty: 'opacity, transform',
          transitionDuration: `${duration}ms`,
          transitionDelay: `${delay}ms`,
          transitionTimingFunction: EASE,
        };

  return (
    <div className="min-h-screen w-full flex flex-col bg-white" role="status">
      <div className="gov-strip" />

      {/* ── Brand mark + tagline ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-8 safe-top">
        <img
          src={markSrc}
          alt={t('app.name')}
          width={MARK_SIZE}
          height={MARK_SIZE}
          draggable={false}
          decoding="async"
          style={{
            width: MARK_SIZE,
            height: MARK_SIZE,
            display: 'block',
            opacity: settled ? 1 : 0,
            transform: settled ? 'scale(1)' : 'scale(0.92)',
            filter: 'drop-shadow(0 16px 26px rgba(1, 48, 112, 0.18))',
            ...fade(0, MARK_DURATION),
          }}
        />

        <p
          className="mt-7 max-w-[19rem] text-center text-[13.5px] leading-relaxed text-gov-body"
          style={{
            opacity: settled ? 1 : 0,
            transform: settled ? 'translateY(0)' : 'translateY(6px)',
            ...fade(TAGLINE_DELAY, TAGLINE_DURATION),
          }}
        >
          {t('splash.brand.tagline')}
        </p>

        {/* Gold hairline — fills from the inline-start edge, so it mirrors in RTL. */}
        <div
          aria-hidden="true"
          className="mt-8 overflow-hidden rounded-full"
          style={{ width: 96, height: 2, background: '#E5E7EB' }}
        >
          <div
            style={{
              height: '100%',
              borderRadius: 999,
              background: '#C8A04C',
              width: settled ? '100%' : '0%',
              transition: reduced ? undefined : `width ${BAR_DURATION}ms linear ${BAR_DELAY}ms`,
            }}
          />
        </div>

        <span className="sr-only">{t('splash.brand.loading')}</span>
      </div>

      {/* ── National line ── */}
      <div
        className="px-8"
        style={{
          // `.safe-bottom` in index.css would override a `pb-*` utility, so the
          // safe-area inset and the breathing room are combined here instead.
          paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 28px)',
          opacity: settled ? 1 : 0,
          transform: settled ? 'translateY(0)' : 'translateY(6px)',
          ...fade(FOOTER_DELAY, FOOTER_DURATION),
        }}
      >
        <div className="flex flex-col items-center gap-1.5 text-center">
          <div className="flex items-center gap-2">
            <HashemiteEmblem size={16} />
            <span className="text-[12px] font-semibold text-gov-ink">{t('app.kingdom')}</span>
          </div>
          <span className="text-[11px] text-gov-muted leading-snug">{t('app.ministry')}</span>
          <span className="text-[11px] text-gov-body leading-snug">
            {t('splash.brand.ministryRole')}
          </span>
        </div>
      </div>
    </div>
  );
}
