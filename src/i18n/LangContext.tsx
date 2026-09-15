import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { translations, type Lang, type TranslationKey } from './translations';

interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
}

const LangContext = createContext<LangContextValue>({
  lang: 'ar',
  setLang: () => {},
  toggleLang: () => {},
  t: (k) => k,
  dir: 'rtl',
});

const STORAGE_KEY = 'murshidi.lang';

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    if (typeof window === 'undefined') return 'ar';
    try {
      return window.localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'ar';
    } catch {
      return 'ar';
    }
  });

  // Sync HTML attributes whenever language changes
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const html = document.documentElement;
    html.lang = lang;
    html.dir = lang === 'ar' ? 'rtl' : 'ltr';
    try {
      window.localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // localStorage may be unavailable
    }
  }, [lang]);

  const setLang = (l: Lang) => setLangState(l);
  const toggleLang = () => setLangState((curr) => (curr === 'ar' ? 'en' : 'ar'));

  const t = (key: TranslationKey): string => {
    const dict = translations[lang];
    return (dict as Record<string, string>)[key]
      || (translations.ar as Record<string, string>)[key]
      || key;
  };

  const dir: 'rtl' | 'ltr' = lang === 'ar' ? 'rtl' : 'ltr';

  return (
    <LangContext.Provider value={{ lang, setLang, toggleLang, t, dir }}>
      {children}
    </LangContext.Provider>
  );
}

// This module intentionally exposes its context hook alongside the provider.
// Fast Refresh may reload its consumers; the hook does not retain separate state.
// eslint-disable-next-line react-refresh/only-export-components
export const useLang = () => useContext(LangContext);
