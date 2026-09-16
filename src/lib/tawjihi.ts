// The new Jordanian Tawjihi system — tracks, fields, programmes, and what each one
// actually opens at university.
//
// Every list this module answers from comes from the Higher Education Council's own
// decision (page dated 8 Sep 2024, effective 2026/2027); the two source PDFs ship in
// docs/sources/ and the transcription lives in docs/tawjihi-2026-official.json.
// Nothing here is inferred beyond what the `explicit` flag admits to.

import {
  ACADEMIC_FIELDS,
  VOCATIONAL_PROGRAMS,
  MAJOR_ELIGIBILITY,
  ADMISSION_MINIMUMS,
  TAWJIHI_SOURCE,
  type AcademicFieldRecord,
  type VocationalProgramRecord,
  type MajorMinimumAverage,
} from './tawjihi.data';

export { TAWJIHI_SOURCE, ADMISSION_MINIMUMS };
export type { AcademicFieldRecord, VocationalProgramRecord, MajorMinimumAverage };

export type TrackId = 'academic' | 'vocational' | 'legacy';

export type AcademicFieldId =
  | 'health'
  | 'engineering'
  | 'science-tech'
  | 'languages-social'
  | 'law-sharia'
  | 'business';

export type VocationalProgramId =
  | 'engineering'
  | 'construction'
  | 'it'
  | 'art-design'
  | 'beauty'
  | 'creative-media'
  | 'travel-tourism'
  | 'hospitality'
  | 'business'
  | 'agriculture';

/** Students still finishing under the pre-2023 plan. Kept so the app serves them honestly. */
export type LegacyBranchId =
  | 'scientific'
  | 'literary'
  | 'informatics'
  | 'sharia'
  | 'industrial'
  | 'commercial'
  | 'hotel'
  | 'agricultural';

export interface StudyPath {
  track: TrackId;
  field?: AcademicFieldId;
  program?: VocationalProgramId;
  branch?: LegacyBranchId;
}

export type Eligibility =
  | {
      status: 'eligible';
      degree: 'bachelor';
      officialCollege: string;
      /** false = the Ministry named a broader college that covers this major; see coveredBy. */
      explicit: boolean;
      coveredBy?: string;
    }
  | {
      status: 'eligible-technical';
      degree: 'technical-bachelor';
      via: VocationalProgramId;
      officialCollege: string;
      noteAr: string;
      noteEn: string;
    }
  | { status: 'not-eligible'; reasonAr: string; reasonEn: string }
  | { status: 'unpublished'; reasonAr: string; reasonEn: string };

export const TRACKS: { id: TrackId; nameAr: string; nameEn: string }[] = [
  { id: 'academic', nameAr: 'المسار الأكاديمي', nameEn: 'Academic track' },
  { id: 'vocational', nameAr: 'المسار المهني (BTEC)', nameEn: 'Vocational track (BTEC)' },
  { id: 'legacy', nameAr: 'الخطة القديمة', nameEn: 'Previous plan' },
];

export const LEGACY_BRANCHES: { id: LegacyBranchId; nameAr: string; nameEn: string }[] = [
  { id: 'scientific', nameAr: 'العلمي', nameEn: 'Scientific' },
  { id: 'literary', nameAr: 'الأدبي', nameEn: 'Literary' },
  { id: 'informatics', nameAr: 'إدارة المعلومات', nameEn: 'Information Management' },
  { id: 'sharia', nameAr: 'الشرعي', nameEn: 'Sharia' },
  { id: 'industrial', nameAr: 'الصناعي', nameEn: 'Industrial' },
  { id: 'commercial', nameAr: 'التجاري', nameEn: 'Commercial' },
  { id: 'hotel', nameAr: 'الفندقي', nameEn: 'Hotel' },
  { id: 'agricultural', nameAr: 'الزراعي', nameEn: 'Agricultural' },
];

export function academicFields(): AcademicFieldRecord[] {
  return ACADEMIC_FIELDS;
}

export function vocationalPrograms(): VocationalProgramRecord[] {
  return [...VOCATIONAL_PROGRAMS].sort((a, b) => a.order - b.order);
}

export function findField(id: string | undefined): AcademicFieldRecord | undefined {
  return ACADEMIC_FIELDS.find((f) => f.id === id);
}

export function findProgram(id: string | undefined): VocationalProgramRecord | undefined {
  return VOCATIONAL_PROGRAMS.find((p) => p.id === id);
}

/** True when the path is complete enough to answer eligibility questions. */
export function isPathComplete(path: StudyPath | null | undefined): boolean {
  if (!path) return false;
  if (path.track === 'academic') return Boolean(findField(path.field));
  if (path.track === 'vocational') return Boolean(findProgram(path.program));
  if (path.track === 'legacy') return Boolean(path.branch);
  return false;
}

/**
 * True only when this path can actually narrow a list of majors.
 *
 * `isPathComplete` answers "did the student finish choosing?", which is true for
 * a previous-plan student who picked العلمي. But the Higher Education Council
 * published its college table for the NEW plan only, so for `legacy` every major
 * comes back `unpublished` — and code that filters on "eligible or technical"
 * then produces an empty list and tells that student nothing is open to them.
 * Filter on this instead: no published table means no filtering, not no options.
 */
export function pathConstrainsChoices(path: StudyPath | null | undefined): boolean {
  if (!isPathComplete(path) || !path) return false;
  return path.track === 'academic' || path.track === 'vocational';
}

export function pathLabel(path: StudyPath | null | undefined, lang: 'ar' | 'en'): string {
  if (!path) return lang === 'ar' ? 'غير محدّد' : 'Not set';
  if (path.track === 'academic') {
    const f = findField(path.field);
    if (!f) return lang === 'ar' ? 'المسار الأكاديمي' : 'Academic track';
    return lang === 'ar' ? f.nameAr : f.nameEn;
  }
  if (path.track === 'vocational') {
    const p = findProgram(path.program);
    if (!p) return lang === 'ar' ? 'المسار المهني (BTEC)' : 'Vocational track (BTEC)';
    return lang === 'ar' ? p.nameAr : p.nameEn;
  }
  const b = LEGACY_BRANCHES.find((x) => x.id === path.branch);
  if (!b) return lang === 'ar' ? 'الخطة القديمة' : 'Previous plan';
  return lang === 'ar' ? `${b.nameAr} (الخطة القديمة)` : `${b.nameEn} (previous plan)`;
}

const UNPUBLISHED_LEGACY = {
  status: 'unpublished' as const,
  reasonAr:
    'جدول الكليات المسموح بها الصادر عن مجلس التعليم العالي يخصّ طلبة الخطة الجديدة اعتباراً من 2026/2027. لم نعثر على جدول رسميّ مكافئ لفروع الخطة القديمة، لذلك لا نعرض تقديراً هنا.',
  reasonEn:
    'The Higher Education Council table of permitted colleges covers new-plan students from 2026/2027. We found no equivalent official table for the previous plan’s branches, so we show no estimate here.',
};

const UNKNOWN_MAJOR = {
  status: 'unpublished' as const,
  reasonAr: 'لا يوجد ربط رسميّ موثّق لهذا التخصّص في جدول مجلس التعليم العالي.',
  reasonEn: 'This major has no documented mapping in the Higher Education Council table.',
};

const INCOMPLETE_PATH = {
  status: 'unpublished' as const,
  reasonAr: 'اختر مسارك وحقلك أولاً لعرض الكليات المتاحة لك.',
  reasonEn: 'Choose your track and field first to see which colleges are open to you.',
};

/**
 * What the student's own track and field actually open for this major.
 * Never guesses: anything the Ministry did not publish comes back as `unpublished`.
 */
export function eligibilityFor(majorId: string, path: StudyPath | null | undefined): Eligibility {
  const record = MAJOR_ELIGIBILITY[majorId];
  if (!record) return UNKNOWN_MAJOR;
  if (!isPathComplete(path) || !path) return INCOMPLETE_PATH;
  if (path.track === 'legacy') return UNPUBLISHED_LEGACY;

  if (path.track === 'academic') {
    const field = path.field as string;
    if (record.academicFields.includes(field)) {
      return {
        status: 'eligible',
        degree: 'bachelor',
        officialCollege: record.officialCollege,
        explicit: record.explicit,
        ...(record.coveredBy ? { coveredBy: record.coveredBy } : {}),
      };
    }
    const open = record.academicFields
      .map((id) => findField(id))
      .filter((f): f is AcademicFieldRecord => Boolean(f));
    const openAr = open.map((f) => f.nameAr).join('، ');
    const openEn = open.map((f) => f.nameEn).join(', ');
    return {
      status: 'not-eligible',
      reasonAr: openAr
        ? `هذا التخصّص متاح من ${openAr} وليس من حقلك الحالي، بحسب جدول مجلس التعليم العالي 2026/2027.`
        : 'هذا التخصّص غير مدرج لأيّ حقل أكاديمي في جدول مجلس التعليم العالي 2026/2027.',
      reasonEn: openEn
        ? `Open from ${openEn}, not from your current field, per the Higher Education Council table for 2026/2027.`
        : 'Not listed for any academic field in the Higher Education Council table for 2026/2027.',
    };
  }

  // Vocational
  const program = path.program as VocationalProgramId;
  if (record.vocationalPrograms.includes(program)) {
    return {
      status: 'eligible-technical',
      degree: 'technical-bachelor',
      via: program,
      officialCollege: record.vocationalDegree || record.officialCollege,
      noteAr: record.vocationalNote,
      noteEn:
        'Reached through the vocational track as an intermediate diploma or a technical/applied bachelor — a different degree from the academic bachelor.',
    };
  }
  const viaPrograms = record.vocationalPrograms
    .map((id) => findProgram(id))
    .filter((p): p is VocationalProgramRecord => Boolean(p));
  if (viaPrograms.length) {
    return {
      status: 'not-eligible',
      reasonAr: `هذا التخصّص متاح من ${viaPrograms.map((p) => p.nameAr).join('، ')} وليس من برنامجك الحالي.`,
      reasonEn: `Open from ${viaPrograms.map((p) => p.nameEn).join(', ')}, not from your current programme.`,
    };
  }
  return {
    status: 'not-eligible',
    reasonAr: record.vocationalNote,
    reasonEn: 'Not available through any vocational programme in the Higher Education Council table.',
  };
}

/** Every college the Ministry lists for this path, for the "my field" screen. */
export function collegesFor(path: StudyPath | null | undefined): {
  bachelor: string[];
  diploma: string[];
  technicalBachelor: string[];
} {
  const empty = { bachelor: [], diploma: [], technicalBachelor: [] };
  if (!isPathComplete(path) || !path) return empty;
  if (path.track === 'academic') {
    const f = findField(path.field);
    return f ? { bachelor: f.colleges, diploma: [], technicalBachelor: [] } : empty;
  }
  if (path.track === 'vocational') {
    const p = findProgram(path.program);
    return p
      ? { bachelor: [], diploma: p.diploma, technicalBachelor: p.technicalBachelor }
      : empty;
  }
  return empty;
}

/** Which of the app's majors this path can reach, partitioned for the UI and for the AI. */
export function majorsFor(path: StudyPath | null | undefined): {
  eligible: string[];
  technical: string[];
  blocked: string[];
  unknown: string[];
} {
  const out = { eligible: [] as string[], technical: [] as string[], blocked: [] as string[], unknown: [] as string[] };
  for (const majorId of Object.keys(MAJOR_ELIGIBILITY)) {
    const e = eligibilityFor(majorId, path);
    if (e.status === 'eligible') out.eligible.push(majorId);
    else if (e.status === 'eligible-technical') out.technical.push(majorId);
    else if (e.status === 'not-eligible') out.blocked.push(majorId);
    else out.unknown.push(majorId);
  }
  return out;
}

/** True when the Ministry named a broader college rather than this major by name. */
export function isCoveredByBroaderCollege(majorId: string): string | null {
  const record = MAJOR_ELIGIBILITY[majorId];
  if (!record || record.explicit) return null;
  return record.coveredBy || record.officialCollege;
}

// ─────────────────────────────────────────────────────────────────────────────
// Admission minimums
//
// Two different numbers are routinely confused, and the app must never conflate
// them:
//   • الحد الأدنى للالتحاق — the published floor to be ALLOWED to apply. Fixed by
//     قرار مجلس التعليم العالي 295/2026. Known, sourced, in this module.
//   • الحد الأدنى التنافسي — the mark the last admitted student actually scored.
//     Set after applications close, per programme, and for 2026/2027 it had NOT
//     been published as of 16 Sep 2026. It is always higher, often far higher.
// ─────────────────────────────────────────────────────────────────────────────

export type Sector = 'public' | 'private';

export interface MinimumAverageAnswer {
  /** Published floor to be allowed to apply, as a percentage. */
  percent: number;
  /** The Ministry's own wording for the tier this major falls in. */
  tierAr: string;
  /** null when the caller passed no grade. */
  meets: boolean | null;
  /** How far the student is from the floor; negative means short. */
  marginPoints: number | null;
}

export function minimumAverageFor(
  majorId: string,
  sector: Sector = 'public',
  grade?: number | null,
): MinimumAverageAnswer | null {
  const record = MAJOR_ELIGIBILITY[majorId];
  if (!record?.minimumAverage) return null;
  const percent = record.minimumAverage[sector];
  const hasGrade = typeof grade === 'number' && Number.isFinite(grade);
  return {
    percent,
    tierAr: record.minimumAverage.tierAr,
    meets: hasGrade ? grade >= percent : null,
    marginPoints: hasGrade ? Math.round((grade - percent) * 10) / 10 : null,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// The average — تعليمات رقم (12) لسنة 2024, published in the Official Gazette.
//
// ⚠ BOTH tracks weight 30/70 out of 1000 marks, and the two 30/70s mean
// COMPLETELY DIFFERENT THINGS. Conflating them is a real error:
//
//   Academic  (Art. 15): 30% = the grade-11 national exam in four shared-culture
//                        subjects · 70% = the grade-12 national exam in four
//                        field subjects (4 × 175).
//   Vocational (Art. 16ب): 30% = the SAME grade-11 shared-culture national exam
//                        · 70% = assessment of the BTEC Level 3 units studied
//                        across grades 11 and 12 (720 guided hours) — coursework
//                        graded Pass/Merit/Distinction with external verification,
//                        not a written national paper.
// ─────────────────────────────────────────────────────────────────────────────

/** The four مباحث الثقافة العامة المشتركة — identical for both tracks, 300 marks. */
export const SHARED_CULTURE_SUBJECTS = [
  { ar: 'التربية الإسلامية', en: 'Islamic Education', max: 60 },
  { ar: 'اللغة العربية', en: 'Arabic', max: 100 },
  { ar: 'اللغة الإنجليزية', en: 'English', max: 100 },
  { ar: 'تاريخ الأردن', en: 'Jordan History', max: 40 },
] as const;

export const AVERAGE_RULES = {
  partOneWeight: 0.3,
  partOneMaxMarks: 300,
  partTwoWeight: 0.7,
  partTwoMaxMarks: 700,
  totalMarks: 1000,
  /** Art. 11(ب): a subject is passed at 40% of its own maximum. */
  subjectPassPercent: 40,
  sourceAr:
    'تعليمات رقم (12) لسنة 2024 — تعليمات امتحان شهادة الدراسة الثانوية العامة، المواد (11) و(12) و(15) و(16)',
  sourceUrl: 'https://moe.gov.jo/sites/default/files/tlymt_mthn_lthnwy_lm_0.pdf',
  academic: {
    articleAr: 'المادة (15)',
    partOneAr: 'الجزء الأول من الامتحان العام — نهاية الصف الحادي عشر، أربعة مباحث ثقافة عامة مشتركة',
    partTwoAr: 'الجزء الثاني من الامتحان العام — نهاية الصف الثاني عشر، أربعة مباحث تخصصية حسب الحقل',
    partTwoSubjectMax: 175,
    partTwoSubjectCount: 4,
  },
  vocational: {
    articleAr: 'المادة (16) الفقرة (ب)',
    partOneAr: 'الامتحان العام لمباحث الثقافة العامة المشتركة الأربعة',
    partTwoAr:
      'تقييمات وحدات المستوى الثالث من البرنامج المهني التقني في الحادي عشر والثاني عشر (720 ساعة موجهة)',
    partTwoIsCoursework: true,
    partTwoNoteAr:
      'الـ70% هنا تقييم وحدات عملية بدرجات Pass/Merit/Distinction مع تدقيق خارجي، وليست امتحاناً وطنياً كتابياً.',
  },
} as const;

export interface AverageInput {
  partOneMarks: number | null;
  partTwoMarks: number | null;
}

export type AverageResult =
  | { status: 'ok'; percent: number; totalMarks: number }
  | { status: 'incomplete'; reasonAr: string; reasonEn: string };

/**
 * The new-plan average, out of 100.
 *
 * Art. 12(ب): a candidate who falls below the pass mark in any subject receives a
 * statement of marks with **no** total and **no** average at all — "no average
 * exists" is a real state, not a zero, and callers must render it as such.
 */
export function computeAverage(input: AverageInput): AverageResult {
  const { partOneMarks, partTwoMarks } = input;
  const ready =
    typeof partOneMarks === 'number' &&
    Number.isFinite(partOneMarks) &&
    typeof partTwoMarks === 'number' &&
    Number.isFinite(partTwoMarks);
  if (!ready) {
    return {
      status: 'incomplete',
      reasonAr: 'يلزم مجموع الجزأين معاً لاحتساب المعدل.',
      reasonEn: 'Both components are needed before an average exists.',
    };
  }
  const one = Math.min(Math.max(partOneMarks, 0), AVERAGE_RULES.partOneMaxMarks);
  const two = Math.min(Math.max(partTwoMarks, 0), AVERAGE_RULES.partTwoMaxMarks);
  const total = one + two;
  return {
    status: 'ok',
    percent: Math.round((total / AVERAGE_RULES.totalMarks) * 1000) / 10,
    totalMarks: total,
  };
}

/**
 * What the 70% component is called for this track — so a screen never labels a
 * BTEC student's coursework as a national exam, or vice versa.
 */
export function partTwoLabel(track: TrackId, lang: 'ar' | 'en'): string {
  if (track === 'vocational') {
    return lang === 'ar'
      ? 'تقييمات وحدات المستوى الثالث (المهني التقني)'
      : 'BTEC Level 3 unit assessments';
  }
  if (track === 'academic') {
    return lang === 'ar'
      ? 'الجزء الثاني من الامتحان العام (مباحث الحقل)'
      : 'Part Two of the national exam (field subjects)';
  }
  return lang === 'ar' ? 'المباحث التخصصية' : 'Specialised subjects';
}

/**
 * Facts about the vocational track the app is allowed to state, each traceable.
 * Deliberately includes the two things it must NOT say.
 */
export const BTEC_FACTS = {
  entryGrade: 10,
  years: 3,
  levelsAr: 'المستوى الثاني في الصف العاشر، والمستوى الثالث في الحادي عشر والثاني عشر',
  guidedHoursLevel3: 720,
  certificateAr:
    'يحمل الطالب شهادة الدراسة الثانوية العامة الأردنية (المسار المهني) وإلى جانبها دبلوم BTEC الدولي من Pearson — المسار المهني جزء من التوجيهي وليس بديلاً عنه.',
  certificateEn:
    'The student holds the Jordanian General Secondary Certificate (vocational track) alongside a Pearson BTEC International Diploma. BTEC is a track inside Tawjihi, not a replacement for it.',
  /** 14 are taught in schools for 2026/2027; the legal instruments still name 10. */
  specializationsInSchools: 14,
  specializationsInLaw: 10,
  specializationsNoteAr:
    'المدارس تطرح 14 تخصصاً للعام 2026/2027، بينما تعليمات 2024 وملحق مجلس التعليم العالي يسمّيان 10 فقط — التخصصات الأحدث لا جدول قبول جامعي منشور لها بعد.',
  /** Things that are NOT true and must never be rendered. */
  mustNotClaim: {
    ofqualAr:
      'لا توصف الشهادة بأنها «معتمدة من Ofqual» — المنشور رسمياً مقارنة مرجعية عبر ENIC مقابل أطر RQF/EQF فقط.',
    quotaAr:
      'حصّة 20–25% من المقاعد التنافسية لطلبة المسار المهني اقتراح متداول ولم يُعتمد؛ لا ذكر له في السياسة العامة للقبول 2026/2027.',
  },
} as const;

/**
 * Resitting to raise the average is capped at two subjects already at 50%+, once.
 * Which mark then counts is genuinely disputed: the Official Gazette text of
 * Art. 23(أ) says «تحسب له العلامة الأحدث» (the most recent), while Ministry
 * guidance reported in the press says «العلامة الأعلى» (the higher). The
 * difference decides whether a resit can LOWER a student's average, so the app
 * states both readings and advises confirming with إدارة الامتحانات rather than
 * picking one silently.
 */
export const RESIT_RULE = {
  maxSubjectsToRaiseAverage: 2,
  eligibleAtPercent: 50,
  timesAllowed: 1,
  unlimitedForCompletingPass: true,
  disputed: true,
  gazetteReadingAr: 'نصّ الجريدة الرسمية، المادة 23(أ): «وتحسب له العلامة الأحدث».',
  pressReadingAr: 'توجيه منسوب للوزارة في الصحافة: «وتُحتسب له العلامة الأعلى».',
  adviceAr: 'القراءتان مختلفتان في النتيجة — راجع إدارة الامتحانات والاختبارات قبل الاعتماد على أيّهما.',
  adviceEn:
    'The two readings differ in outcome — confirm with the Examinations Directorate before relying on either.',
} as const;
