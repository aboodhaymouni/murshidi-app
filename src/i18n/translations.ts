export type Lang = 'ar' | 'en';

export const translations = {
  ar: {
    'app.name': 'مُرشِدي',
    'app.tagline': 'قرار أكاديمي أوضح',
    'nav.home': 'الرئيسيّة',
    'nav.calculator': 'الكلفة',
    'nav.market': 'السوق',
    'nav.consultation': 'الدليل',
    'nav.profile': 'ملفّي',
  },
  en: {
    'app.name': 'Murshidi',
    'app.tagline': 'A clearer academic decision',
    'nav.home': 'Home',
    'nav.calculator': 'Costs',
    'nav.market': 'Market',
    'nav.consultation': 'Guide',
    'nav.profile': 'Profile',
  },
} as const;

export type TranslationKey = keyof typeof translations.ar;
