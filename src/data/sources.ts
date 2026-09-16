// Source registry for every figure Murshidi puts on screen.
//
// Rule of the build: a number is either (a) traceable to a named published
// release, or (b) marked `illustrative` and badged wherever it is rendered.
// There is no third category. If a figure cannot be traced, it stays visible
// but it carries the illustrative badge — we do not dress it up as official.
//
// Verified on 16 Sep 2026 while writing this file:
//  - dos-q2-2026  : DOS press release of 7 Sep 2026, total-population
//                   unemployment 16.1% in Q2 2026 (16.5% in Q2 2025), and
//                   21.0% among Jordanians. The release carries no breakdown
//                   by educational level, so no "graduate unemployment"
//                   figure in this app may be attributed to it.
//  - admhec-2026  : the admission policy's published FLOOR to be allowed to
//                   apply, from Higher Education Council decision 295/2026.
//                   NOT the competitive minimum per specialisation, which for
//                   2026/2027 was still unpublished when this was written; the
//                   minimums had not been announced when this build was cut,
//                   which is why acceptance averages here are labelled
//                   indicative rather than official.

export type SourceId = 'dos-q2-2026' | 'mohe-2026' | 'admhec-2026' | 'illustrative';

export interface SourceRef {
  id: SourceId;
  labelAr: string;
  labelEn: string;
  url?: string;
}

export const SOURCES: Record<SourceId, SourceRef> = {
  'dos-q2-2026': {
    id: 'dos-q2-2026',
    labelAr: 'دائرة الإحصاءات العامّة — مسح قوى العمل، الربع الثاني 2026 (نُشر 7 أيلول 2026)',
    labelEn: 'Dept. of Statistics — Labour Force Survey, Q2 2026 (published 7 Sep 2026)',
    url: 'https://dosweb.dos.gov.jo/unemp_092026/',
  },
  'mohe-2026': {
    id: 'mohe-2026',
    labelAr: 'وزارة التعليم العالي والبحث العلمي — البيانات المنشورة على موقعها',
    labelEn: 'Ministry of Higher Education and Scientific Research — published data',
    url: 'https://www.mohe.gov.jo',
  },
  'admhec-2026': {
    id: 'admhec-2026',
    labelAr: 'مجلس التعليم العالي — السياسة العامّة للقبول 2026/2027 (الحدّ الأدنى للالتحاق)',
    labelEn: 'Higher Education Council — 2026/2027 admission policy (minimum to apply)',
    url: 'https://www.admhec.gov.jo',
  },
  illustrative: {
    id: 'illustrative',
    labelAr: 'مثال توضيحي • ليست بيانات رسمية',
    labelEn: 'Illustrative example • not official data',
  },
};

export function isIllustrative(id: SourceId): boolean {
  return id === 'illustrative';
}
