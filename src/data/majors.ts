// ما مصدر هذه الأرقام؟ / Where do these numbers come from?
//
// The per-major figures below (first / 5-year / 10-year salary, unemployment
// rate, job openings, 2030 growth, satisfaction score, tuition and acceptance
// average) are ILLUSTRATIVE. They were inherited from an earlier build and
// could not be traced back to a published release, so every record carries
// `source: 'illustrative'` and every screen that renders them shows the
// illustrative badge next to the number. They are kept — not deleted —
// because they demonstrate how the tools work, and the honest label is worth
// more than an empty screen.
//
// `averageAcceptance` deserves its own warning: it is an indicative average
// used by the ROI calculator and the AI advisor. It is NOT the published
// competitive minimum. The 2026/2027 minimums had not been announced by the
// Unified Admission Coordination Unit when this build was cut.
//
// The one figure in this file that IS traceable is `dosUnemployment` at the
// bottom: the Department of Statistics release of 7 Sep 2026.
// Earlier versions of this header claimed the whole table came from
// "DOS Jordan + Ministry of Higher Education + Akhtaboot/Bayt". It did not.

import type { SourceId } from './sources';

export interface Major {
  id: string;
  nameAr: string;
  nameEn: string;
  icon: string;
  color: string;
  unemploymentRate: number; // % — illustrative, not a DOS series
  firstSalary: number; // JOD/month — illustrative
  fiveYearSalary: number; // illustrative
  tenYearSalary: number; // illustrative
  duration: number; // years
  averageAcceptance: number; // معدّل قبول استرشادي — ليس الحدّ الأدنى التنافسي المعتمد
  yearlyTuitionGov: number; // حكومي — تقديري
  yearlyTuitionPrivate: number; // خاص — تقديري
  matchedPersonality: string[];
  futureGrowth: number; // % growth by 2030 — illustrative
  /**
   * Illustrative count of postings relevant to a graduate of this major in the
   * observatory's reference month — NOT a live board count, and a different
   * quantity from the per-occupation counts in `occupationSeries` below (a major
   * maps onto more than one job title). Where a major does map cleanly onto one
   * tracked occupation — cs, civil-eng, business, nursing, data-science, cyber —
   * the two carry the same number on purpose.
   */
  jobOpeningsLast30Days: number;
  topSkills: string[];
  satisfactionScore: number; // out of 100 — illustrative
  /** Arabic one-liner shown on the major cards. */
  description: string;
  /** The same line in English. Both exist so no screen falls back to Arabic in EN mode. */
  descriptionEn: string;
  category: 'tech' | 'medical' | 'engineering' | 'business' | 'arts' | 'education' | 'science';
  /** Where this record's figures come from. `illustrative` = badge it on screen. */
  source: SourceId;
}

export const majorsData: Major[] = [
  {
    id: 'cs',
    nameAr: 'علوم الحاسوب',
    nameEn: 'Computer Science',
    icon: '💻',
    color: '#22D3EE',
    unemploymentRate: 14,
    firstSalary: 580,
    fiveYearSalary: 1400,
    tenYearSalary: 2800,
    duration: 4,
    averageAcceptance: 84.3,
    yearlyTuitionGov: 2100,
    yearlyTuitionPrivate: 4500,
    matchedPersonality: ['Investigative', 'Conventional'],
    futureGrowth: 67,
    jobOpeningsLast30Days: 1247,
    topSkills: ['Python', 'JavaScript', 'Cloud', 'AI/ML', 'Databases'],
    satisfactionScore: 87,
    description: 'مستقبل واعد، مرونة في العمل عن بُعد، طلب عالٍ محلياً وعالمياً',
    descriptionEn: 'A promising outlook, remote-work flexibility, and strong demand locally and abroad.',
    category: 'tech',
    source: 'illustrative',
  },
  {
    id: 'medicine',
    nameAr: 'الطب البشري',
    nameEn: 'Medicine',
    icon: '⚕️',
    color: '#FB7185',
    unemploymentRate: 8,
    firstSalary: 650,
    fiveYearSalary: 1200,
    tenYearSalary: 2200,
    duration: 6,
    averageAcceptance: 96.5,
    yearlyTuitionGov: 6500,
    yearlyTuitionPrivate: 18000,
    matchedPersonality: ['Investigative', 'Social'],
    futureGrowth: 28,
    jobOpeningsLast30Days: 432,
    topSkills: ['Diagnosis', 'Patient Care', 'Research', 'Surgery'],
    satisfactionScore: 81,
    description: 'مهنة نبيلة وراتب جيد لكن دراسة طويلة وتكاليف مرتفعة',
    descriptionEn: 'A respected profession with solid pay, but long years of study and high costs.',
    category: 'medical',
    source: 'illustrative',
  },
  {
    id: 'pharmacy',
    nameAr: 'الصيدلة',
    nameEn: 'Pharmacy',
    icon: '💊',
    color: '#34D399',
    unemploymentRate: 18,
    firstSalary: 480,
    fiveYearSalary: 850,
    tenYearSalary: 1500,
    duration: 5,
    averageAcceptance: 90.2,
    yearlyTuitionGov: 4200,
    yearlyTuitionPrivate: 9500,
    matchedPersonality: ['Investigative', 'Conventional'],
    futureGrowth: 18,
    jobOpeningsLast30Days: 287,
    topSkills: ['Pharmacology', 'Clinical', 'Research', 'Patient Counseling'],
    satisfactionScore: 72,
    description: 'استقرار وظيفي معقول، فرص للعمل في القطاع الخاص والصناعة',
    descriptionEn: 'Reasonable job stability, with openings in the private sector and in industry.',
    category: 'medical',
    source: 'illustrative',
  },
  {
    id: 'civil-eng',
    nameAr: 'الهندسة المدنية',
    nameEn: 'Civil Engineering',
    icon: '🏗️',
    color: '#FBBF24',
    unemploymentRate: 24,
    firstSalary: 450,
    fiveYearSalary: 800,
    tenYearSalary: 1400,
    duration: 5,
    averageAcceptance: 85.5,
    yearlyTuitionGov: 1700,
    yearlyTuitionPrivate: 4200,
    matchedPersonality: ['Realistic', 'Investigative'],
    futureGrowth: 22,
    jobOpeningsLast30Days: 544,
    topSkills: ['AutoCAD', 'Project Management', 'Structural Analysis', 'Revit'],
    satisfactionScore: 68,
    description: 'فرص في الخليج جيدة، السوق المحلي متذبذب',
    descriptionEn: 'Good openings in the Gulf; the local market moves in cycles.',
    category: 'engineering',
    source: 'illustrative',
  },
  {
    id: 'architecture',
    nameAr: 'الهندسة المعمارية',
    nameEn: 'Architecture',
    icon: '🏛️',
    color: '#A78BFA',
    unemploymentRate: 32,
    firstSalary: 420,
    fiveYearSalary: 750,
    tenYearSalary: 1300,
    duration: 5,
    averageAcceptance: 89.4,
    yearlyTuitionGov: 1900,
    yearlyTuitionPrivate: 4500,
    matchedPersonality: ['Artistic', 'Realistic'],
    futureGrowth: 15,
    jobOpeningsLast30Days: 187,
    topSkills: ['3D Modeling', 'Design', 'Revit', 'Sustainability'],
    satisfactionScore: 64,
    description: 'تخصص جميل لكن سوق محدود، يحتاج إبداعاً وصبراً',
    descriptionEn: 'A rewarding field with a narrow market; it asks for creativity and patience.',
    category: 'engineering',
    source: 'illustrative',
  },
  {
    id: 'media',
    nameAr: 'الإعلام والصحافة',
    nameEn: 'Media & Journalism',
    icon: '📺',
    color: '#FB7185',
    unemploymentRate: 41,
    firstSalary: 320,
    fiveYearSalary: 580,
    tenYearSalary: 950,
    duration: 4,
    averageAcceptance: 65.0,
    yearlyTuitionGov: 1400,
    yearlyTuitionPrivate: 3000,
    matchedPersonality: ['Artistic', 'Social', 'Enterprising'],
    futureGrowth: -12,
    jobOpeningsLast30Days: 98,
    topSkills: ['Digital Marketing', 'Content Creation', 'Video Editing', 'Social Media'],
    satisfactionScore: 52,
    description: 'الإعلام التقليدي يتراجع، الـ digital هو المستقبل — تحتاج تخصصاً تقنياً مع الإعلام',
    descriptionEn: 'Traditional media is shrinking and digital is where it is heading — pair it with a technical skill.',
    category: 'arts',
    source: 'illustrative',
  },
  {
    id: 'law',
    nameAr: 'الحقوق',
    nameEn: 'Law',
    icon: '⚖️',
    color: '#F4D769',
    unemploymentRate: 28,
    firstSalary: 380,
    fiveYearSalary: 700,
    tenYearSalary: 1500,
    duration: 4,
    averageAcceptance: 82.0,
    yearlyTuitionGov: 1500,
    yearlyTuitionPrivate: 3500,
    matchedPersonality: ['Enterprising', 'Social', 'Conventional'],
    futureGrowth: 8,
    jobOpeningsLast30Days: 156,
    topSkills: ['Legal Research', 'Negotiation', 'Public Speaking', 'Writing'],
    satisfactionScore: 65,
    description: 'يتطلب صبراً للوصول للمكاسب، التخصص في الشركات أربح من المحاماة',
    descriptionEn: 'Returns come slowly; corporate practice pays better than general litigation.',
    category: 'business',
    source: 'illustrative',
  },
  {
    id: 'business',
    nameAr: 'إدارة الأعمال',
    nameEn: 'Business Administration',
    icon: '💼',
    color: '#22D3EE',
    unemploymentRate: 32,
    firstSalary: 400,
    fiveYearSalary: 850,
    tenYearSalary: 1700,
    duration: 4,
    averageAcceptance: 78.0,
    yearlyTuitionGov: 1500,
    yearlyTuitionPrivate: 3500,
    matchedPersonality: ['Enterprising', 'Conventional', 'Social'],
    futureGrowth: 14,
    jobOpeningsLast30Days: 893,
    topSkills: ['Excel', 'Strategy', 'Communication', 'Data Analysis'],
    satisfactionScore: 70,
    description: 'تخصص عام، النجاح يعتمد على المهارات الشخصية والشبكة',
    descriptionEn: 'A broad degree; outcomes depend heavily on soft skills and your network.',
    category: 'business',
    source: 'illustrative',
  },
  {
    id: 'nursing',
    nameAr: 'التمريض',
    nameEn: 'Nursing',
    icon: '🏥',
    color: '#34D399',
    unemploymentRate: 11,
    firstSalary: 420,
    fiveYearSalary: 700,
    tenYearSalary: 1100,
    duration: 4,
    averageAcceptance: 75.0,
    yearlyTuitionGov: 2400,
    yearlyTuitionPrivate: 5500,
    matchedPersonality: ['Social', 'Investigative'],
    futureGrowth: 35,
    jobOpeningsLast30Days: 672,
    topSkills: ['Patient Care', 'Critical Thinking', 'Emergency Response'],
    satisfactionScore: 76,
    description: 'طلب عالٍ في الخليج وأوروبا، فرصة سفر ممتازة',
    descriptionEn: 'Strong demand in the Gulf and Europe, and a real route to working abroad.',
    category: 'medical',
    source: 'illustrative',
  },
  {
    id: 'data-science',
    nameAr: 'علم البيانات',
    nameEn: 'Data Science',
    icon: '📊',
    color: '#A78BFA',
    unemploymentRate: 9,
    firstSalary: 750,
    fiveYearSalary: 1700,
    tenYearSalary: 3200,
    duration: 4,
    averageAcceptance: 86.0,
    yearlyTuitionGov: 2400,
    yearlyTuitionPrivate: 4800,
    matchedPersonality: ['Investigative', 'Conventional'],
    futureGrowth: 89,
    jobOpeningsLast30Days: 387,
    topSkills: ['Python', 'SQL', 'Machine Learning', 'Statistics', 'Visualization'],
    satisfactionScore: 91,
    description: 'الأعلى نمواً عالمياً، رواتب ممتازة وفرص remote عالمية',
    descriptionEn: 'Among the fastest-growing fields worldwide, with strong pay and remote openings.',
    category: 'tech',
    source: 'illustrative',
  },
  {
    id: 'cyber',
    nameAr: 'الأمن السيبراني',
    nameEn: 'Cybersecurity',
    icon: '🛡️',
    color: '#67E8F9',
    unemploymentRate: 7,
    firstSalary: 720,
    fiveYearSalary: 1600,
    tenYearSalary: 2900,
    duration: 4,
    averageAcceptance: 85.0,
    yearlyTuitionGov: 2400,
    yearlyTuitionPrivate: 5000,
    matchedPersonality: ['Investigative', 'Realistic'],
    futureGrowth: 78,
    jobOpeningsLast30Days: 341,
    topSkills: ['Network Security', 'Ethical Hacking', 'Cloud Security', 'Cryptography'],
    satisfactionScore: 88,
    description: 'الطلب يتجاوز العرض في الأردن — تخصص نادر مطلوب جداً',
    descriptionEn: 'Demand outstrips supply in Jordan — a scarce and sought-after specialisation.',
    category: 'tech',
    source: 'illustrative',
  },
  {
    id: 'accounting',
    nameAr: 'المحاسبة',
    nameEn: 'Accounting',
    icon: '🧮',
    color: '#FBBF24',
    unemploymentRate: 26,
    firstSalary: 360,
    fiveYearSalary: 720,
    tenYearSalary: 1400,
    duration: 4,
    averageAcceptance: 76.0,
    yearlyTuitionGov: 1500,
    yearlyTuitionPrivate: 3500,
    matchedPersonality: ['Conventional', 'Investigative'],
    futureGrowth: -8,
    jobOpeningsLast30Days: 489,
    topSkills: ['Excel', 'QuickBooks', 'IFRS', 'Tax', 'Audit'],
    satisfactionScore: 62,
    description: 'AI يبتلع المحاسبة التقليدية — تحتاج تخصصاً متقدماً (CPA, CMA)',
    descriptionEn: 'AI is absorbing routine accounting — a professional qualification (CPA, CMA) is what differentiates.',
    category: 'business',
    source: 'illustrative',
  },
];

// Universities data — names, public/private status and city are factual.
export interface University {
  id: string;
  nameAr: string;
  nameEn: string;
  type: 'حكومي' | 'خاص';
  city: string;
  /** Display order in this list only — NOT an official ranking, and not rendered as one. */
  ranking: number;
}

export const universitiesData: University[] = [
  { id: 'ju', nameAr: 'الجامعة الأردنية', nameEn: 'University of Jordan', type: 'حكومي', city: 'عمّان', ranking: 1 },
  { id: 'just', nameAr: 'جامعة العلوم والتكنولوجيا', nameEn: 'JUST', type: 'حكومي', city: 'إربد', ranking: 2 },
  { id: 'yu', nameAr: 'جامعة اليرموك', nameEn: 'Yarmouk University', type: 'حكومي', city: 'إربد', ranking: 3 },
  { id: 'mu', nameAr: 'الجامعة الهاشمية', nameEn: 'Hashemite University', type: 'حكومي', city: 'الزرقاء', ranking: 4 },
  { id: 'mut', nameAr: 'جامعة مؤتة', nameEn: 'Mutah University', type: 'حكومي', city: 'الكرك', ranking: 5 },
  { id: 'aabu', nameAr: 'جامعة آل البيت', nameEn: 'AABU', type: 'حكومي', city: 'المفرق', ranking: 6 },
  { id: 'psut', nameAr: 'جامعة الأميرة سمية', nameEn: 'PSUT', type: 'خاص', city: 'عمّان', ranking: 7 },
  { id: 'gju', nameAr: 'الألمانية الأردنية', nameEn: 'GJU', type: 'خاص', city: 'مأدبا', ranking: 8 },
  { id: 'asu', nameAr: 'جامعة العلوم التطبيقية', nameEn: 'ASU', type: 'خاص', city: 'عمّان', ranking: 9 },
  { id: 'zu', nameAr: 'الزرقاء الأهلية', nameEn: 'Zarqa University', type: 'خاص', city: 'الزرقاء', ranking: 10 },
];

// ─────────────────────────────────────────────────────────────────────────────
// The job-market observatory — ONE series, everything else derived from it.
//
// The previous build typed the observatory's headline figures by hand and the
// page ended up disagreeing with itself on one screen: a KPI of 4,247 active
// postings above a pie chart whose slices summed to 3,843, above a "+8.4%
// monthly growth" headline that the trend chart underneath refuted.
//
// `occupationSeries` below is now the single source of truth. The active-posting
// total, the month-over-month growth, the sector split, the geographic split and
// both occupation tables are all COMPUTED from it, so that class of contradiction
// is no longer expressible: there is nothing left to hand-correct.
//
// The counts themselves are ILLUSTRATIVE. They are not scraped from any job
// board and not updated live; they exist to show the shape of the observatory,
// and every screen that renders them carries the illustrative badge. The final
// month's counts are also the values carried on `Major.jobOpeningsLast30Days`,
// so the market page and the major cards quote the same number.
// ─────────────────────────────────────────────────────────────────────────────

export type PostingSectorId = 'tech' | 'medical' | 'business' | 'engineering' | 'other';

/** The months of the demo series, oldest first. The last one is the reference month. */
export const POSTING_MONTHS = ['2026-05', '2026-06', '2026-07', '2026-08'] as const;
export type PostingMonth = (typeof POSTING_MONTHS)[number];

/** The month every "current" figure on the market screen refers to. */
export const POSTING_REFERENCE_MONTH: PostingMonth = POSTING_MONTHS[POSTING_MONTHS.length - 1];

export interface OccupationSeries {
  id: string;
  nameAr: string;
  nameEn: string;
  sector: PostingSectorId;
  /** One posting count per entry of POSTING_MONTHS, in the same order. */
  counts: readonly number[];
}

export const occupationSeries: readonly OccupationSeries[] = [
  { id: 'software-dev', nameAr: 'مطوّر برمجيات', nameEn: 'Software Developer', sector: 'tech', counts: [880, 946, 1014, 1247] },
  { id: 'accountant', nameAr: 'محاسب', nameEn: 'Accountant', sector: 'business', counts: [742, 784, 827, 893] },
  { id: 'nurse', nameAr: 'ممرّض', nameEn: 'Nurse', sector: 'medical', counts: [498, 532, 570, 672] },
  { id: 'civil-engineer', nameAr: 'مهندس مدني', nameEn: 'Civil Engineer', sector: 'engineering', counts: [588, 574, 561, 544] },
  { id: 'data-analyst', nameAr: 'محلّل بيانات', nameEn: 'Data Analyst', sector: 'tech', counts: [196, 228, 263, 387] },
  { id: 'security-specialist', nameAr: 'متخصّص أمن سيبراني', nameEn: 'Cybersecurity Specialist', sector: 'tech', counts: [158, 189, 224, 341] },
  { id: 'legacy-accountant', nameAr: 'محاسب تقليدي', nameEn: 'Bookkeeping Clerk', sector: 'business', counts: [328, 297, 266, 234] },
  { id: 'bank-clerk', nameAr: 'موظّف بنك', nameEn: 'Bank Teller', sector: 'business', counts: [312, 277, 242, 189] },
  { id: 'journalist', nameAr: 'صحفي', nameEn: 'Journalist', sector: 'other', counts: [92, 79, 68, 47] },
  { id: 'data-entry', nameAr: 'مُدخل بيانات', nameEn: 'Data Entry Clerk', sector: 'other', counts: [104, 84, 67, 28] },
];

/** Rounded to one decimal so no renderer can print a 14-digit float. */
function round1(value: number): number {
  return Math.round(value * 10) / 10;
}

/**
 * A single occupation at the reference month, with its month-over-month change.
 * The name is carried in both languages, because the market and home screens
 * both render it and neither may fall back to Arabic in English mode.
 */
export interface MarketRow {
  id: string;
  nameAr: string;
  nameEn: string;
  sector: PostingSectorId;
  count: number;
  /** % change against the previous month of the same series. */
  change: number;
}

/** Every tracked occupation at the reference month. Derived — never typed by hand. */
export const marketSnapshot: readonly MarketRow[] = occupationSeries.map((o) => {
  const count = o.counts[o.counts.length - 1];
  const previous = o.counts[o.counts.length - 2];
  return {
    id: o.id,
    nameAr: o.nameAr,
    nameEn: o.nameEn,
    sector: o.sector,
    count,
    change: round1(((count - previous) / previous) * 100),
  };
});

/** Total tracked postings per month — the series the growth headline is read off. */
export const postingTotals: readonly { month: PostingMonth; total: number }[] =
  POSTING_MONTHS.map((month, i) => ({
    month,
    total: occupationSeries.reduce((sum, o) => sum + o.counts[i], 0),
  }));

/** Display order of the sectors. One list, so the chart, the pie and its legend agree. */
export const POSTING_SECTORS = ['tech', 'business', 'medical', 'engineering', 'other'] as const;

/** Postings per sector per month, for the stacked trend chart and the pie. */
export const sectorSeries: readonly { sector: PostingSectorId; counts: number[] }[] =
  POSTING_SECTORS.map((sector) => ({
    sector,
    counts: POSTING_MONTHS.map((_, i) =>
      occupationSeries.filter((o) => o.sector === sector).reduce((sum, o) => sum + o.counts[i], 0),
    ),
  }));

/** The sector split of the reference month. Sums to `marketKpis.activePostings` by construction. */
export const sectorSplit: readonly { sector: PostingSectorId; count: number }[] = sectorSeries.map(
  (s) => ({ sector: s.sector, count: s.counts[s.counts.length - 1] }),
);

/**
 * The three headline numbers of the market screen, every one of them read off
 * the series above. Nothing here is a typed constant.
 */
export const marketKpis = {
  /** Total postings across the tracked occupations in the reference month. */
  activePostings: postingTotals[postingTotals.length - 1].total,
  /** Month-over-month change of that total. */
  monthlyGrowth: round1(
    ((postingTotals[postingTotals.length - 1].total - postingTotals[postingTotals.length - 2].total) /
      postingTotals[postingTotals.length - 2].total) *
      100,
  ),
  /** How many of the tracked occupations grew this month, and out of how many. */
  growingCount: marketSnapshot.filter((r) => r.change > 0).length,
  trackedCount: marketSnapshot.length,
};

/**
 * Governorate split of the SAME reference-month total, as published shares.
 * The counts are allocated by largest remainder so they always sum back to
 * `marketKpis.activePostings` — the split can never quietly invent postings.
 */
export type GovernorateShareId = 'amman' | 'irbid' | 'zarqa' | 'aqaba' | 'karak' | 'other';

const GOVERNORATE_SHARES: readonly { id: GovernorateShareId; share: number }[] = [
  { id: 'amman', share: 67 },
  { id: 'irbid', share: 11 },
  { id: 'zarqa', share: 7 },
  { id: 'aqaba', share: 4 },
  { id: 'karak', share: 3 },
  { id: 'other', share: 8 },
];

function allocateByLargestRemainder<T extends string>(
  shares: readonly { id: T; share: number }[],
  total: number,
): { id: T; share: number; count: number }[] {
  const exact = shares.map((s) => ({ ...s, exact: (s.share / 100) * total }));
  const rows = exact.map((s) => ({ id: s.id, share: s.share, count: Math.floor(s.exact) }));
  let remaining = total - rows.reduce((sum, r) => sum + r.count, 0);
  const byRemainder = exact
    .map((s, i) => ({ i, remainder: s.exact - Math.floor(s.exact) }))
    .sort((a, b) => b.remainder - a.remainder);
  for (const entry of byRemainder) {
    if (remaining <= 0) break;
    rows[entry.i].count += 1;
    remaining -= 1;
  }
  return rows;
}

export const governorateSplit = allocateByLargestRemainder(
  GOVERNORATE_SHARES,
  marketKpis.activePostings,
);

/** Top paying skills — ILLUSTRATIVE monthly rates, not a salary survey. */
export const topPayingSkills: readonly { id: string; nameAr: string; nameEn: string; salary: number }[] = [
  { id: 'ai-ml', nameAr: 'مهندس ذكاء اصطناعي وتعلّم آلة', nameEn: 'AI/ML Engineer', salary: 1800 },
  { id: 'cloud', nameAr: 'مهندس معماريّة سحابيّة', nameEn: 'Cloud Architect', salary: 1650 },
  { id: 'sec-lead', nameAr: 'قائد فريق أمن سيبراني', nameEn: 'Cybersecurity Lead', salary: 1400 },
  { id: 'fullstack', nameAr: 'مطوّر ويب متكامل', nameEn: 'Full-Stack Developer', salary: 950 },
  { id: 'ux', nameAr: 'مصمّم تجربة المستخدم', nameEn: 'UX Designer', salary: 750 },
];

// Kept under its original name and shape so pages outside this work package keep
// compiling — but every field is now derived from `occupationSeries` above, so
// the home screen and the market screen cannot disagree about a count either.
export const jobMarketTrends = {
  topHiring: marketSnapshot.filter((r) => r.change > 0).sort((a, b) => b.count - a.count),
  declining: marketSnapshot.filter((r) => r.change <= 0).sort((a, b) => a.change - b.change),
  topPaying: topPayingSkills,
};

// Dashboard statistics — ILLUSTRATIVE. The platform is at demo stage, so
// `studentsHelped`, `decisionsImproved`, `jobsScraped` and `totalSavedJOD`
// describe no real usage; `graduateUnemployment` is NOT a DOS series (the
// Q2 2026 release carries no breakdown by educational level). Kept for the
// impact panel, badged wherever shown.
export const nationalStats = {
  totalStudents: 100000,
  graduateUnemployment: 26.4,
  jobsScraped: 50847,
  studentsHelped: 12340,
  decisionsImproved: 8902,
  totalSavedJOD: 2400000,
};

// The one traceable figure in this file.
// Department of Statistics press release, published 7 Sep 2026:
// unemployment for the total population (Jordanians and non-Jordanians)
// fell to 16.1% in Q2 2026 from 16.5% in Q2 2025; among Jordanians it was
// 21.0% against 21.3% a year earlier.
// https://dosweb.dos.gov.jo/unemp_092026/
export const dosUnemployment = {
  totalPopulation: 16.1,
  totalPopulationPrevYear: 16.5,
  jordanians: 21.0,
  jordaniansPrevYear: 21.3,
  periodAr: 'الربع الثاني 2026',
  periodEn: 'Q2 2026',
  source: 'dos-q2-2026' as SourceId,
};

// Future jobs prediction — ILLUSTRATIVE growth percentages. These are not a
// published forecast; the only sourced forward-looking figure in the app is
// the WEF Future of Jobs Report 2025 headline quoted on the Future page.
export interface FutureJob {
  id: string;
  nameAr: string;
  nameEn: string;
  /** % change by `year` — illustrative, not a published forecast. */
  growth: number;
  year: number;
}

export const futureJobs: { growing: FutureJob[]; declining: FutureJob[] } = {
  growing: [
    { id: 'ai-ml', nameAr: 'مهندس ذكاء اصطناعي وتعلّم آلة', nameEn: 'AI/ML Engineer', growth: 89, year: 2030 },
    { id: 'renewables', nameAr: 'أخصّائي طاقة متجدّدة', nameEn: 'Renewable Energy Specialist', growth: 76, year: 2030 },
    { id: 'data-scientist', nameAr: 'عالِم بيانات', nameEn: 'Data Scientist', growth: 71, year: 2030 },
    { id: 'sec-analyst', nameAr: 'محلّل أمن سيبراني', nameEn: 'Cybersecurity Analyst', growth: 67, year: 2030 },
    { id: 'ux', nameAr: 'مصمّم تجربة وواجهة المستخدم', nameEn: 'UX/UI Designer', growth: 58, year: 2030 },
    { id: 'health-informatics', nameAr: 'المعلوماتيّة الصحّيّة', nameEn: 'Health Informatics', growth: 54, year: 2030 },
    { id: 'cloud-architect', nameAr: 'مهندس حلول سحابيّة', nameEn: 'Cloud Solutions Architect', growth: 51, year: 2030 },
  ],
  declining: [
    { id: 'data-entry', nameAr: 'إدخال البيانات', nameEn: 'Data Entry', growth: -67, year: 2030 },
    { id: 'travel-agent', nameAr: 'وكيل سفر', nameEn: 'Travel Agent', growth: -52, year: 2030 },
    { id: 'bank-teller', nameAr: 'موظّف صرّاف في بنك', nameEn: 'Bank Teller', growth: -45, year: 2030 },
    { id: 'print-journalism', nameAr: 'الصحافة المطبوعة', nameEn: 'Print Journalism', growth: -42, year: 2030 },
    { id: 'legacy-accounting', nameAr: 'المحاسبة التقليديّة', nameEn: 'Traditional Accounting', growth: -38, year: 2030 },
    { id: 'translation', nameAr: 'الترجمة العامّة', nameEn: 'Translation (general)', growth: -31, year: 2030 },
  ],
};

// One place a reviewer can read the truth about every dataset in this file.
// Pages import from here so the badge and the data can never drift apart.
export const DATASET_SOURCES = {
  majors: 'illustrative',
  jobMarketTrends: 'illustrative',
  futureJobs: 'illustrative',
  nationalStats: 'illustrative',
  dosUnemployment: 'dos-q2-2026',
} satisfies Record<string, SourceId>;
