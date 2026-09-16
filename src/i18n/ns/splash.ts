// i18n namespace: splash
// Owner: see docs/BUILD_SPEC.md. Add keys as `'splash.someKey': '…'` in BOTH objects.
// Keys must exist in ar and en with identical key sets.
//
// The honesty rewrite of the four onboarding slides now lives in ./core.ts
// itself, so this namespace no longer shadows any `splash.slide*` key — one key,
// one definition. What stays here is the brand frame's own copy and the labels
// for the stat tiles, whose values are counted at runtime from the app's own
// content (see Splash.tsx) rather than typed in by hand.

export const splashAr = {
  // ── Brand splash (first frame) ──
  'splash.brand.tagline': 'منصّة وطنيّة لدعم قرار اختيار التخصّص الجامعي',
  'splash.brand.ministryRole': 'مصدر البيانات المنشورة · تطبيق إرشادي مستقلّ',
  'splash.brand.loading': 'جارٍ تحضير المنصّة',

  // ── Stat labels (values are counted from the app's own content) ──
  'splash.stat.majors': 'تخصّصاً في قاعدة البيانات',
  'splash.stat.universities': 'جامعة أردنيّة مدرجة',
  'splash.stat.fees': 'دينار رسوم استخدام',
  'splash.stat.languages': 'لغتا الواجهة: عربي وإنجليزي',
  'splash.statsNote': 'أرقام مُحتسبة من محتوى التطبيق نفسه، لا من مصدر خارجي.',
} as const;

export const splashEn = {
  // ── Brand splash (first frame) ──
  'splash.brand.tagline': 'A national platform for the university major decision',
  'splash.brand.ministryRole': 'Published data source · independent guidance app',
  'splash.brand.loading': 'Preparing the platform',

  // ── Stat labels (values are counted from the app's own content) ──
  'splash.stat.majors': 'Majors in the database',
  'splash.stat.universities': 'Jordanian universities listed',
  'splash.stat.fees': 'JOD usage fee',
  'splash.stat.languages': 'Interface languages: Arabic & English',
  'splash.statsNote': 'Counted from the app’s own content, not from an external source.',
} as const;
