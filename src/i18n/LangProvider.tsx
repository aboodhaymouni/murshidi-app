// Holds the current interface language and keeps <html lang/dir> in step with it.
// The context object and the `useLang` hook live in ./LangContext.ts so that this
// module exports a component and nothing else (see the note in that file).
//
// This is the outermost provider in src/main.tsx, which makes it the last place
// in the app that may throw during render. Two consequences are handled here:
//
//  1. The stored-language read is wrapped. `localStorage` is not merely empty in
//     a sandboxed iframe, with site data blocked, or in some private modes — the
//     getter itself throws a SecurityError. Unguarded, that threw out of the
//     state initialiser of the top provider and the whole app rendered a blank
//     white page with nothing in the DOM to explain it.
//  2. Everything below is wrapped in an error boundary, so a future throw
//     anywhere in the tree shows a readable Arabic/English screen with a way
//     back instead of that same blank page.

import { Component, useEffect, useState, type ErrorInfo, type ReactNode } from 'react';
import { translations, type Lang, type TranslationKey } from './translations';
import { LangContext, useLang, LANG_STORAGE_KEY } from './LangContext';

/** Arabic is both the default and the fallback: a throwing getter changes nothing. */
function readStoredLang(): Lang {
  if (typeof window === 'undefined') return 'ar';
  try {
    return window.localStorage.getItem(LANG_STORAGE_KEY) === 'en' ? 'en' : 'ar';
  } catch {
    return 'ar';
  }
}

function translate(lang: Lang, key: TranslationKey): string {
  const dict = translations[lang];
  return (dict as Record<string, string>)[key]
    || (translations.ar as Record<string, string>)[key]
    || key;
}

/**
 * What a crash looks like to the student. It sits inside the language provider,
 * so it is translated like every other screen — and it names no cause it cannot
 * know, offering a reload rather than a diagnosis.
 */
function CrashScreen({ detail }: { detail: string | null }) {
  const { t } = useLang();
  return (
    <div className="min-h-screen bg-gov-bg flex items-center justify-center p-4">
      <div className="gov-card p-6 max-w-md w-full text-start">
        <p className="text-base font-bold text-gov-ink">{t('shell.error.title')}</p>
        <p className="text-[13px] text-gov-body leading-relaxed mt-2">{t('shell.error.body')}</p>
        <p className="text-[12px] text-gov-muted leading-relaxed mt-2">{t('shell.error.kept')}</p>
        {detail && (
          <p className="text-[11px] text-gov-muted mt-3 break-words font-mono" dir="ltr">
            {detail}
          </p>
        )}
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="btn-primary w-full mt-4"
        >
          {t('shell.error.reload')}
        </button>
      </div>
    </div>
  );
}

interface BoundaryState {
  failed: boolean;
  detail: string | null;
}

class AppErrorBoundary extends Component<{ children: ReactNode }, BoundaryState> {
  state: BoundaryState = { failed: false, detail: null };

  static getDerivedStateFromError(error: unknown): BoundaryState {
    // The message is shown only in development; a student gets the plain screen.
    const message = error instanceof Error ? error.message : String(error);
    return { failed: true, detail: import.meta.env.DEV ? message : null };
  }

  componentDidCatch(error: unknown, info: ErrorInfo): void {
    // Nothing leaves the device: this is the browser console, for whoever is
    // debugging the build in front of them.
    console.error('Murshidi: unhandled render error', error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.failed) return <CrashScreen detail={this.state.detail} />;
    return this.props.children;
  }
}

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readStoredLang);

  // Sync HTML attributes whenever language changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem(LANG_STORAGE_KEY, lang);
    } catch {
      // localStorage may be unavailable — the language still applies for this visit
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState((curr) => (curr === 'ar' ? 'en' : 'ar'));

  const t = (key: TranslationKey): string => translate(lang, key);

  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t, dir }}>
      <AppErrorBoundary>{children}</AppErrorBoundary>
    </LangContext.Provider>
  );
}
