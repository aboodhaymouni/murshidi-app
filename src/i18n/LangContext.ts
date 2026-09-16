// The language context object and the `useLang` hook.
//
// The provider that fills this context lives in ./LangProvider.tsx. The split is
// deliberate: a module that exports both a component and a hook cannot be
// hot-replaced in place by React Fast Refresh, which is what
// `react-refresh/only-export-components` reports. Keeping the context and the
// hook in a component-free module fixes that at the cause — every screen still
// imports `useLang` from '../i18n/LangContext' exactly as before.

import { createContext, useContext } from 'react';
import type { Lang, TranslationKey } from './translations';

export interface LangContextValue {
  lang: Lang;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey) => string;
  dir: 'rtl' | 'ltr';
}

export const LANG_STORAGE_KEY = 'murshidi.lang';

export const LangContext = createContext<LangContextValue>({
  lang: 'ar',
  setLang: () => {},
  toggleLang: () => {},
  t: (k) => k,
  dir: 'rtl',
});

export const useLang = () => useContext(LangContext);
