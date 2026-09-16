// Translation registry for Murshidi — Arabic (default) + English.
// The dictionary is composed from ./core plus one module per feature namespace
// (./ns/*), so parallel work on different features never touches one file.

import { coreAr, coreEn } from './core';
import { splashAr, splashEn } from './ns/splash';
import { authAr, authEn } from './ns/auth';
import { aiAr, aiEn } from './ns/ai';
import { personalityAr, personalityEn } from './ns/personality';
import { dataAr, dataEn } from './ns/data';
import { supportAr, supportEn } from './ns/support';
import { toolsAr, toolsEn } from './ns/tools';
import { fieldAr, fieldEn } from './ns/field';

export type Lang = 'ar' | 'en';

export const translations = {
  ar: {
    ...coreAr,
    ...splashAr,
    ...authAr,
    ...aiAr,
    ...personalityAr,
    ...dataAr,
    ...supportAr,
    ...toolsAr,
    ...fieldAr,
  },
  en: {
    ...coreEn,
    ...splashEn,
    ...authEn,
    ...aiEn,
    ...personalityEn,
    ...dataEn,
    ...supportEn,
    ...toolsEn,
    ...fieldEn,
  },
} as const;

export type TranslationKey = keyof typeof translations.ar;
