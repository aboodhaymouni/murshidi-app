// Rule-based offline advisor — the last link in the fallback chain.
//
// When every remote model fails (the free Gemma pool returns HTTP 429 often
// enough that this is a normal path, not an edge case) the chat still has to
// answer. These answers are deterministic and read every figure out of
// src/data/majors.ts by field name, so nothing here can drift away from the
// dataset the rest of the app renders. No figure is typed into this file.
//
// It also has to give the same TRACK answer the online advisor gives. A
// vocational-track student asking «معدلي ٨٥ وبدي طب» needs to hear that the
// Higher Education Council's table does not open Medicine to their programme at
// any average — and that answer must not depend on a network. So the eligibility
// verdict, its official wording and the real alternatives all come from
// src/lib/tawjihi.ts here exactly as they do in the grounding block.

import { majorsData } from '../../data/majors';
import type { Major } from '../../data/majors';
import { num } from '../numerals';
import {
  ADMISSION_MINIMUMS,
  TAWJIHI_SOURCE,
  eligibilityFor,
  isPathComplete,
  majorsFor,
  pathConstrainsChoices,
  minimumAverageFor,
  partTwoLabel,
  pathLabel,
} from '../tawjihi';
import type { StudyPath } from '../tawjihi';
import { categoryLabel, majorName } from './grounding';
import { readStudyPath, safeGrade } from './student';
import type { AiProfileContext } from './types';

type Lang = 'ar' | 'en';

/** Strips Arabic diacritics and folds the letter variants students actually type. */
function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[ً-ْٰـ]/g, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .replace(/\s+/g, ' ')
    .trim();
}

function hasAny(text: string, needles: string[]): boolean {
  return needles.some((needle) => text.includes(normalize(needle)));
}

/** Pulls a plausible Tawjihi average (55–100) out of free text. */
function extractGrade(text: string): number | null {
  const matches = text.match(/\d{2,3}(?:[.,]\d)?/g);
  if (!matches) return null;
  for (const raw of matches) {
    const value = Number(raw.replace(',', '.'));
    if (Number.isFinite(value) && value >= 55 && value <= 100) return value;
  }
  return null;
}

/**
 * What students actually type. A student writes «بدي طب», not «الطب البشري»,
 * and the earlier full-name match missed that — which mattered far more once the
 * track answer existed, because a missed major meant the app quietly answered
 * around a programme the student's path does not open instead of saying so.
 *
 * Matched on whole tokens, never as substrings: «طبعاً» and «مطبخ» contain «طب»
 * and must not be read as a question about medicine.
 */
const MAJOR_ALIASES: Record<string, string[]> = {
  medicine: ['طب', 'بشري', 'medicine'],
  pharmacy: ['صيدله', 'صيدلانيه', 'pharmacy'],
  nursing: ['تمريض', 'nursing'],
  law: ['حقوق', 'قانون', 'law'],
  'civil-eng': ['مدنيه', 'مدني', 'civil'],
  architecture: ['عماره', 'architecture'],
  cs: ['حاسوب', 'برمجه', 'كمبيوتر', 'computer', 'programming'],
  'data-science': ['بيانات', 'data'],
  cyber: ['سيبراني', 'cyber', 'cybersecurity'],
  media: ['اعلام', 'صحافه', 'media', 'journalism'],
  business: ['اداره', 'اعمال', 'business'],
  accounting: ['محاسبه', 'accounting'],
};

function tokensOf(text: string): Set<string> {
  return new Set(text.split(/[^\p{L}\p{N}]+/u).filter(Boolean));
}

function matchMajors(text: string): Major[] {
  const tokens = tokensOf(text);
  return majorsData.filter((major) => {
    const ar = normalize(major.nameAr);
    const en = normalize(major.nameEn);
    if ((ar.length > 3 && text.includes(ar)) || (en.length > 3 && text.includes(en))) return true;
    const aliases = MAJOR_ALIASES[major.id] ?? [];
    return aliases.some((alias) => tokens.has(alias) || tokens.has(`ال${alias}`));
  });
}

function byAcceptance(a: Major, b: Major): number {
  return b.averageAcceptance - a.averageAcceptance;
}

const SOURCE_NOTE: Record<Lang, string> = {
  ar: 'المصدر: قاعدة بيانات تطبيق مُرشِدي. معدّلات القبول المذكورة استرشاديّة وليست الحدود التنافسيّة الرسميّة للقبول الموحّد 2026/2027.',
  en: 'Source: the Murshidi app dataset. The acceptance averages quoted are indicative, not the official 2026/2027 unified-admission minimums.',
};

function compose(lang: Lang, lines: string[], tool: string): string {
  return [...lines, '', tool, SOURCE_NOTE[lang]].join('\n');
}

const TOOL: Record<Lang, Record<'roi' | 'compare' | 'market' | 'interests' | 'alternatives' | 'field', string>> = {
  ar: {
    field: 'الخطوة التالية: افتح «حقلي وكلياتي» لترى جدول الكليّات الرسميّ لمسارك كاملاً.',
    roi: 'الخطوة التالية: افتح «حاسبة عائد التعليم» لتقارن الكلفة والعائد رقميّاً.',
    compare: 'الخطوة التالية: افتح «مقارنة التخصّصات» وضع هذه الخيارات جنباً إلى جنب.',
    market: 'الخطوة التالية: افتح صفحة «سوق العمل» — كلّ رقم فيها مرفق بمصدره أو بشارة «مثال توضيحي».',
    interests: 'الخطوة التالية: ابدأ بـ«اختبار الميول» فهو يضيّق الخيارات قبل أن تقارن الأرقام.',
    alternatives: 'الخطوة التالية: راجع «المسارات البديلة» (دبلوم مهني و BTEC) قبل استبعاد أيّ خيار.',
  },
  en: {
    field: 'Next step: open “My field and colleges” to see the full official college table for your path.',
    roi: 'Next step: open the Education ROI Calculator to compare cost against return.',
    compare: 'Next step: open Compare Majors and put these options side by side.',
    market: 'Next step: open the Job Market page — every figure there carries its source or an "illustrative" badge.',
    interests: 'Next step: start with the Interests Test; it narrows the field before you compare numbers.',
    alternatives: 'Next step: review Alternative Paths (vocational diplomas and BTEC) before ruling anything out.',
  },
};

// ─────────────────────────────────────────────────────────────────────────────
// The track answer — the Higher Education Council's own row for this student
// ─────────────────────────────────────────────────────────────────────────────

/** Resolves major ids from tawjihi.ts back to the app's own major records. */
function majorsByIds(ids: string[]): Major[] {
  return ids.flatMap((id) => {
    const major = majorsData.find((m) => m.id === id);
    return major ? [major] : [];
  });
}

const SOURCE_LINE: Record<Lang, string> = {
  ar: `المصدر: ${TAWJIHI_SOURCE.authorityAr}، قرار بتاريخ ${TAWJIHI_SOURCE.pageDate}، يسري من العام الجامعي ${TAWJIHI_SOURCE.appliesFrom}.`,
  en: `Source: ${TAWJIHI_SOURCE.authorityEn}, decision dated ${TAWJIHI_SOURCE.pageDate}, effective from the ${TAWJIHI_SOURCE.appliesFrom} academic year.`,
};

/**
 * What this student's path actually opens, ordered so the closest options come
 * first: the academic bachelors their field allows, then the technical/applied
 * bachelors — kept as a separate, named group, because they are a different
 * degree and the app may never merge the two.
 */
function reachBlock(path: StudyPath, grade: number | null, lang: Lang, limit = 4): string[] {
  // No published college table for this path means nothing to list here — and
  // listing nothing is not the same as saying nothing is open.
  if (!pathConstrainsChoices(path)) return [];
  const reach = majorsFor(path);
  const order = (items: Major[]) =>
    [...items].sort((a, b) => {
      if (grade !== null) {
        const aWithin = Number(a.averageAcceptance <= grade);
        const bWithin = Number(b.averageAcceptance <= grade);
        if (aWithin !== bWithin) return bWithin - aWithin;
      }
      return byAcceptance(a, b);
    });

  const lines: string[] = [];
  const eligible = order(majorsByIds(reach.eligible)).slice(0, limit);
  const technical = order(majorsByIds(reach.technical)).slice(0, limit);

  if (eligible.length > 0) {
    lines.push(
      '',
      lang === 'ar'
        ? 'ما يفتحه مسارك فعليّاً في هذا التطبيق (بكالوريوس أكاديمي):'
        : 'What your path does open in this app (academic bachelor):',
      ...eligible.map(
        (m) =>
          `- ${majorName(m, lang)} — ${
            lang === 'ar'
              ? `معدّل استرشادي ${num(m.averageAcceptance)}، ${num(m.duration)} سنوات`
              : `indicative ${num(m.averageAcceptance)}, ${num(m.duration)} years`
          }`,
      ),
    );
  }

  if (technical.length > 0) {
    lines.push(
      '',
      lang === 'ar'
        ? 'وما يفتحه بدرجة البكالوريوس التقني/التطبيقي — وهي درجة غير البكالوريوس الأكاديمي:'
        : 'And what it opens as a technical/applied bachelor — a different degree from an academic bachelor:',
      ...technical.map(
        (m) =>
          `- ${majorName(m, lang)} — ${
            lang === 'ar'
              ? `معدّل استرشادي ${num(m.averageAcceptance)}، ${num(m.duration)} سنوات`
              : `indicative ${num(m.averageAcceptance)}, ${num(m.duration)} years`
          }`,
      ),
    );
  }

  if (lines.length === 0) {
    lines.push(
      '',
      lang === 'ar'
        ? 'لا يقابل أيّ تخصّص من تخصّصات هذا التطبيق ما يفتحه مسارك — افتح «حقلي وكلياتي» لترى قائمة الكليّات الرسميّة كاملة، فهي أوسع من جدول التطبيق.'
        : 'None of this app’s majors match what your path opens — open “My field and colleges” for the full official college list, which is wider than the app’s table.',
    );
  }

  return lines;
}

/** The published floor to be allowed to apply — never a prediction of admission. */
function floorLines(major: Major, grade: number | null, lang: Lang): string[] {
  const floor = minimumAverageFor(major.id, 'public', grade);
  if (!floor) return [];
  const lines = [
    lang === 'ar'
      ? `الحدّ الأدنى المنشور للالتحاق بهذا التخصّص: ${num(floor.percent)}% (${floor.tierAr}) — ${ADMISSION_MINIMUMS.source.decisionAr}.`
      : `Published minimum to be allowed to apply: ${num(floor.percent)}% — Higher Education Council decision 295/2026.`,
  ];
  if (floor.meets !== null && grade !== null) {
    lines.push(
      floor.meets
        ? lang === 'ar'
          ? `معدّلك ${num(grade)} يتجاوز هذا الحدّ المنشور للتقدّم، وهذا ليس وعداً بالقبول.`
          : `Your ${num(grade)} clears that published floor to apply, which is not a promise of admission.`
        : lang === 'ar'
          ? `معدّلك ${num(grade)} دون هذا الحدّ المنشور للتقدّم.`
          : `Your ${num(grade)} is below that published floor to apply.`,
    );
  }
  lines.push(
    lang === 'ar'
      ? 'الحدّ الأدنى التنافسي لعام 2026/2027 لم يُنشر بعد، وهو عادةً أعلى من الحدّ المنشور للتقدّم ويصدر بعد إغلاق باب التقديم.'
      : 'The competitive minimum for 2026/2027 has not been published; it is normally higher than the floor to apply and is set after applications close.',
  );
  return lines;
}

/**
 * The answer a student gets when their own track is the binding constraint.
 * It leads with the track, because an average cannot open a college the
 * Ministry's table does not list for that path at all.
 */
function trackBlock(major: Major, path: StudyPath, grade: number | null, lang: Lang): string[] {
  const verdict = eligibilityFor(major.id, path);
  const name = majorName(major, lang);
  const ar = lang === 'ar';

  if (verdict.status === 'not-eligible') {
    return [
      ar
        ? `مسارك الحالي: ${pathLabel(path, 'ar')}.`
        : `Your current path: ${pathLabel(path, 'en')}.`,
      ar
        ? `${name}: ${verdict.reasonAr}`
        : `${name}: ${verdict.reasonEn}`,
      ar
        ? 'هذا قيد مسار وليس قيد معدّل — أي معدّل مهما ارتفع لا يفتح كليّة لا يسمح بها جدول المسار.'
        : 'This is a track constraint, not an average constraint — no average, however high, opens a college the track table does not list.',
      SOURCE_LINE[lang],
      ...reachBlock(path, grade, lang),
    ];
  }

  if (verdict.status === 'eligible-technical') {
    return [
      ar ? `مسارك الحالي: ${pathLabel(path, 'ar')}.` : `Your current path: ${pathLabel(path, 'en')}.`,
      ar
        ? `${name}: متاح لمسارك بدرجة البكالوريوس التقني/التطبيقي ضمن «${verdict.officialCollege}» — ${verdict.noteAr}`
        : `${name}: open to your path as a technical/applied bachelor within «${verdict.officialCollege}» — ${verdict.noteEn}`,
      SOURCE_LINE[lang],
    ];
  }

  if (verdict.status === 'eligible') {
    const within = verdict.coveredBy ?? verdict.officialCollege;
    return [
      ar ? `مسارك الحالي: ${pathLabel(path, 'ar')}.` : `Your current path: ${pathLabel(path, 'en')}.`,
      verdict.explicit
        ? ar
          ? `${name}: يسمح به جدول مسارك ضمن كليّة «${verdict.officialCollege}».`
          : `${name}: your path’s table allows it under the college «${verdict.officialCollege}».`
        : ar
          ? `${name}: يسمح به جدول مسارك ضمن «${within}» — الجدول سمّى الكليّة الأوسع ولم يسمّ التخصّص بذاته.`
          : `${name}: allowed under «${within}» — the table names the broader college, not this major by name.`,
      SOURCE_LINE[lang],
    ];
  }

  // 'unpublished' — legacy plan, an incomplete path, or a major with no mapping.
  return [ar ? verdict.reasonAr : verdict.reasonEn];
}

function factsheet(major: Major, lang: Lang, grade: number | null): string[] {
  const name = majorName(major, lang);
  const lines =
    lang === 'ar'
      ? [
          `${name}:`,
          `1) معدّل القبول الاسترشادي: ${major.averageAcceptance}`,
          `2) مدّة الدراسة: ${major.duration} سنوات`,
          `3) الرسوم الحكوميّة التقديريّة: ${major.yearlyTuitionGov} د.أ للسنة`,
          `4) المجال: ${categoryLabel(major.category, lang)}`,
        ]
      : [
          `${name}:`,
          `1) Indicative acceptance average: ${major.averageAcceptance}`,
          `2) Duration: ${major.duration} years`,
          `3) Estimated public tuition: ${major.yearlyTuitionGov} JOD per year`,
          `4) Field: ${categoryLabel(major.category, lang)}`,
        ];

  if (grade !== null) {
    const gap = Number((major.averageAcceptance - grade).toFixed(1));
    if (gap <= 0) {
      lines.push(
        lang === 'ar'
          ? `5) بمعدّلك ${grade} أنت ضمن المعدّل الاسترشادي لهذا التخصّص.`
          : `5) With your ${grade} average you are within this major's indicative range.`,
      );
    } else if (gap <= 3) {
      lines.push(
        lang === 'ar'
          ? `5) معدّلك ${grade} أقلّ بـ${gap} نقطة من المعدّل الاسترشادي — الفرصة قائمة وتعتمد على تنافس هذا العام.`
          : `5) Your ${grade} is ${gap} points below the indicative average — still possible, depending on this year's competition.`,
      );
    } else {
      lines.push(
        lang === 'ar'
          ? `5) معدّلك ${grade} أقلّ بـ${gap} نقطة من المعدّل الاسترشادي، لذلك ادرس البدائل أدناه بجدّيّة.`
          : `5) Your ${grade} is ${gap} points below the indicative average, so weigh the alternatives below seriously.`,
      );
    }
  }
  return lines;
}

function nearestAlternatives(major: Major, grade: number | null, path: StudyPath | null, limit = 4): Major[] {
  const ceiling = grade ?? major.averageAcceptance - 5;
  // An alternative the student's own track does not open is not an alternative.
  const reach = pathConstrainsChoices(path) ? majorsFor(path) : null;
  const open = reach ? new Set([...reach.eligible, ...reach.technical]) : null;
  return majorsData
    .filter((m) => m.id !== major.id && m.averageAcceptance <= ceiling && (!open || open.has(m.id)))
    .sort((a, b) => {
      const sameField = Number(b.category === major.category) - Number(a.category === major.category);
      return sameField !== 0 ? sameField : byAcceptance(a, b);
    })
    .slice(0, limit);
}

function alternativesBlock(items: Major[], lang: Lang): string[] {
  if (items.length === 0) return [];
  return [
    '',
    lang === 'ar' ? 'خيارات ضمن المتناول حسب بيانات التطبيق:' : 'Options within reach per the app dataset:',
    ...items.map(
      (m) =>
        `- ${majorName(m, lang)} — ${
          lang === 'ar'
            ? `معدّل استرشادي ${m.averageAcceptance}، ${m.duration} سنوات`
            : `indicative ${m.averageAcceptance}, ${m.duration} years`
        }`,
    ),
  ];
}

function eligibilityAnswer(grade: number, lang: Lang, path: StudyPath | null): string {
  // With a known path the list is drawn only from what that path opens: an
  // average cannot put a student into a college their track does not reach.
  const reach = pathConstrainsChoices(path) ? majorsFor(path) : null;
  const open = reach ? new Set([...reach.eligible, ...reach.technical]) : null;
  const pool = open ? majorsData.filter((m) => open.has(m.id)) : majorsData;

  const within = pool.filter((m) => m.averageAcceptance <= grade).sort(byAcceptance).slice(0, 6);
  const borderline = pool
    .filter((m) => m.averageAcceptance > grade && m.averageAcceptance - grade <= 3)
    .sort(byAcceptance)
    .slice(0, 3);

  const lines: string[] =
    lang === 'ar'
      ? [`بمعدّل ${num(grade)}، وبالاعتماد على المعدّلات الاسترشاديّة في قاعدة بيانات التطبيق:`]
      : [`With an average of ${num(grade)}, based on the indicative averages in the app dataset:`];

  if (path) {
    lines.push(
      lang === 'ar'
        ? `القائمة أدناه مقتصرة على ما يفتحه مسارك (${pathLabel(path, 'ar')}) في جدول مجلس التعليم العالي.`
        : `The list below is limited to what your path (${pathLabel(path, 'en')}) opens in the Higher Education Council table.`,
    );
    if (path.track === 'academic' || path.track === 'vocational') {
      lines.push(
        lang === 'ar'
          ? `ملاحظة على احتساب معدّلك: 30% امتحان الصف الحادي عشر + 70% ${partTwoLabel(path.track, 'ar')}.`
          : `How your average is built: 30% the grade-11 exam + 70% ${partTwoLabel(path.track, 'en')}.`,
      );
    }
  }

  if (within.length > 0) {
    lines.push('', lang === 'ar' ? 'ضمن المتناول:' : 'Within reach:');
    within.forEach((m, i) =>
      lines.push(
        `${i + 1}) ${majorName(m, lang)} — ${
          lang === 'ar'
            ? `معدّل استرشادي ${m.averageAcceptance}، ${m.duration} سنوات، ${m.yearlyTuitionGov} د.أ/سنة حكومي`
            : `indicative ${m.averageAcceptance}, ${m.duration} years, ${m.yearlyTuitionGov} JOD/year public`
        }`,
      ),
    );
  } else {
    lines.push(
      '',
      lang === 'ar'
        ? 'لا يوجد تخصّص في قاعدة البيانات ضمن هذا المعدّل — راجع «المسارات البديلة» فهي مصمّمة لهذه الحالة.'
        : 'No major in the dataset sits at that average — check Alternative Paths, which exist for exactly this case.',
    );
  }

  if (borderline.length > 0) {
    lines.push(
      '',
      lang === 'ar' ? 'على الحدّ (فرق ثلاث نقاط أو أقلّ):' : 'Borderline (within three points):',
      ...borderline.map(
        (m) => `- ${majorName(m, lang)} — ${lang === 'ar' ? `معدّل استرشادي ${m.averageAcceptance}` : `indicative ${m.averageAcceptance}`}`,
      ),
    );
  }

  return compose(lang, lines, TOOL[lang].roi);
}

function tuitionAnswer(targets: Major[], lang: Lang, path: StudyPath | null): string {
  const items = targets.length > 0 ? targets : [...majorsData].sort(byAcceptance).slice(0, 5);
  const lines = [
    lang === 'ar'
      ? 'الرسوم التقديريّة لسنة دراسيّة واحدة كما هي مسجّلة في قاعدة بيانات التطبيق:'
      : 'Estimated tuition for one academic year as recorded in the app dataset:',
    '',
    ...items.map(
      (m, i) =>
        `${i + 1}) ${majorName(m, lang)} — ${
          lang === 'ar'
            ? `حكومي ${num(m.yearlyTuitionGov)} د.أ، خاصّ ${num(m.yearlyTuitionPrivate)} د.أ، لمدّة ${num(m.duration)} سنوات`
            : `public ${num(m.yearlyTuitionGov)} JOD, private ${num(m.yearlyTuitionPrivate)} JOD, over ${num(m.duration)} years`
        }${eligibilityTag(m, path, lang)}`,
    ),
    '',
    lang === 'ar'
      ? 'اضرب الرسوم في عدد سنوات الدراسة وأضف النقل والسكن للحصول على الكلفة الحقيقيّة.'
      : 'Multiply by the number of years and add transport and housing for the real cost.',
  ];
  return compose(lang, lines, TOOL[lang].roi);
}

function marketAnswer(targets: Major[], lang: Lang, path: StudyPath | null): string {
  const items = targets.length > 0 ? targets : [];
  const lines =
    lang === 'ar'
      ? [
          'أرقام التشغيل والبطالة والرواتب لا تُعرض في المحادثة بلا مصدر.',
          '',
          '1) صفحة «سوق العمل» تعرض هذه المؤشّرات، وكلّ رقم فيها إمّا منسوب إلى جهة مُسمّاة أو يحمل شارة «مثال توضيحي • ليست بيانات رسميّة».',
          '2) اقرأ الشارة قبل أن تبني قرارك على الرقم.',
          '3) للأرقام الرسميّة الأحدث: دائرة الإحصاءات العامّة ووزارة التعليم العالي والبحث العلمي.',
        ]
      : [
          'Employment, unemployment and salary figures are not quoted in chat without a source.',
          '',
          '1) The Job Market page shows these indicators, and each figure is either attributed to a named body or badged "Illustrative example • not official data".',
          '2) Read the badge before you build a decision on the number.',
          '3) For the latest official figures: the Department of Statistics and the Ministry of Higher Education.',
        ];

  if (items.length > 0) {
    lines.push(
      '',
      lang === 'ar' ? 'ما يمكنني تأكيده من بيانات التطبيق:' : 'What I can confirm from the app dataset:',
      ...items.map(
        (m) =>
          `- ${majorName(m, lang)} — ${
            lang === 'ar'
              ? `معدّل قبول استرشادي ${num(m.averageAcceptance)}، ${num(m.duration)} سنوات`
              : `indicative acceptance ${num(m.averageAcceptance)}, ${num(m.duration)} years`
          }${eligibilityTag(m, path, lang)}`,
      ),
    );
  }
  return compose(lang, lines, TOOL[lang].market);
}

/** One short, sourced marker per compared major: open / technical / not on your list. */
function eligibilityTag(major: Major, path: StudyPath | null, lang: Lang): string {
  if (!path) return '';
  const verdict = eligibilityFor(major.id, path);
  if (verdict.status === 'eligible') return lang === 'ar' ? ' — متاح لمسارك' : ' — open to your path';
  if (verdict.status === 'eligible-technical') {
    return lang === 'ar' ? ' — بكالوريوس تقني/تطبيقي لمسارك' : ' — technical/applied bachelor for your path';
  }
  if (verdict.status === 'not-eligible') return lang === 'ar' ? ' — غير متاح لمسارك' : ' — not open to your path';
  return '';
}

function compareAnswer(targets: Major[], lang: Lang, grade: number | null, path: StudyPath | null): string {
  const items = targets.slice(0, 3);
  const lines = [
    lang === 'ar' ? 'مقارنة سريعة من بيانات التطبيق:' : 'Quick comparison from the app dataset:',
    '',
    ...items.flatMap((m, i) => [
      `${i + 1}) ${majorName(m, lang)} — ${
        lang === 'ar'
          ? `معدّل استرشادي ${num(m.averageAcceptance)}، ${num(m.duration)} سنوات، ${num(m.yearlyTuitionGov)} د.أ/سنة حكومي`
          : `indicative ${num(m.averageAcceptance)}, ${num(m.duration)} years, ${num(m.yearlyTuitionGov)} JOD/year public`
      }${eligibilityTag(m, path, lang)}`,
    ]),
  ];
  if (path && items.some((m) => eligibilityFor(m.id, path).status === 'not-eligible')) {
    lines.push(
      '',
      lang === 'ar'
        ? `ما وُسم بأنّه غير متاح لمسارك (${pathLabel(path, 'ar')}) لا يفتحه جدول مجلس التعليم العالي لهذا المسار، مهما كان معدّلك.`
        : `Anything marked as not open to your path (${pathLabel(path, 'en')}) is not opened by the Higher Education Council table for that path, whatever your average is.`,
      SOURCE_LINE[lang],
    );
  }
  if (grade !== null) {
    const reachable = items.filter((m) => m.averageAcceptance <= grade).map((m) => majorName(m, lang));
    lines.push(
      '',
      reachable.length > 0
        ? lang === 'ar'
          ? `بمعدّلك ${grade}، ما يقع ضمن المعدّل الاسترشادي: ${reachable.join('، ')}.`
          : `With your ${grade}, within the indicative range: ${reachable.join(', ')}.`
        : lang === 'ar'
          ? `بمعدّلك ${grade}، جميع الخيارات أعلاه فوق المعدّل الاسترشادي — وسّع القائمة قبل أن تقرّر.`
          : `With your ${grade}, all of the above sit above the indicative average — widen the list before deciding.`,
    );
  }
  return compose(lang, lines, TOOL[lang].compare);
}

function abroadAnswer(lang: Lang): string {
  const lines =
    lang === 'ar'
      ? [
          'لا أملك بيانات موثّقة عن رواتب أو شروط التوظيف خارج الأردن، ولن أذكر رقماً لا أستطيع نسبته إلى مصدر.',
          '',
          '1) تحقّق من شروط الترخيص المهني في الدولة المقصودة قبل اختيار التخصّص — كثير من المهن الصحّيّة والهندسيّة تشترط امتحان معادلة.',
          '2) معظم الإعلانات في دول الخليج تطلب خبرة عمليّة، فخطّط لسنوات العمل الأولى داخل الأردن.',
          '3) اختر تخصّصاً يصلح محلّيّاً أوّلاً؛ خطّة مبنيّة على السفر وحده خطّة هشّة.',
        ]
      : [
          'I have no verified data on salaries or hiring conditions outside Jordan, and I will not quote a figure I cannot attribute.',
          '',
          '1) Check professional licensing rules in the destination country first — many health and engineering roles require an equivalency exam.',
          '2) Most Gulf postings ask for prior experience, so plan your first working years inside Jordan.',
          '3) Pick a major that works locally first; a plan that depends on emigration alone is fragile.',
        ];
  return compose(lang, lines, TOOL[lang].compare);
}

function pressureAnswer(lang: Lang, grade: number | null): string {
  const lines =
    lang === 'ar'
      ? [
          'الخلاف مع الأهل حول التخصّص يُحلّ بالأرقام أكثر ممّا يُحلّ بالجدال:',
          '',
          '1) اعرض عليهم صفحة المقارنة داخل التطبيق بدل النقاش الشفوي — الأرقام المكتوبة تخفّض حدّة النقاش.',
          '2) اسأل نفسك أوّلاً: ما الذي يقلقهم فعلاً؟ الدخل، أم الاستقرار الوظيفي، أم رأي المحيط؟ لكلّ قلق ردّ مختلف.',
          '3) اعرض خيار وسط: تخصّص يجمع ميولك بمجال يطمئنهم، أو مسار دبلوم قصير يثبت جدّيّتك.',
          '4) اطلب مهلة قرار محدّدة بأسبوع بدل الرفض الفوري من الطرفين.',
        ]
      : [
          'Disagreement with family over a major is settled with figures more often than with argument:',
          '',
          '1) Show them the comparison page instead of debating verbally — written numbers lower the temperature.',
          '2) Ask yourself what actually worries them: income, job security, or what relatives will say. Each needs a different answer.',
          '3) Offer a middle option: a major that joins your interest to a field that reassures them, or a short diploma that proves you are serious.',
          '4) Ask for a one-week decision window instead of an immediate no from either side.',
        ];
  if (grade !== null) {
    lines.push(
      '',
      lang === 'ar'
        ? `معدّلك ${grade} — استخدم قائمة «ضمن المتناول» في الحاسبة كأرضيّة موضوعيّة للنقاش.`
        : `Your average is ${grade} — use the calculator's "within reach" list as the objective basis for the conversation.`,
    );
  }
  return compose(lang, lines, TOOL[lang].compare);
}

function defaultAnswer(lang: Lang): string {
  const lines =
    lang === 'ar'
      ? [
          'لأساعدك بشكل مفيد، هذا ترتيب الخطوات الذي ننصح به:',
          '',
          '1) ابدأ بـ«اختبار الميول» لتضييق المجالات المحتملة.',
          '2) اختر ثلاثة تخصّصات وقارنها في «مقارنة التخصّصات».',
          '3) مرّرها على «حاسبة عائد التعليم» لترى الكلفة مقابل العائد.',
          '4) راجع «سوق العمل» و«المنح الدراسيّة» قبل الحسم.',
          '',
          'واذكر لي معدّلك أو اسم التخصّص الذي تفكّر به لأعطيك إجابة أدقّ.',
        ]
      : [
          'To help you usefully, this is the order we recommend:',
          '',
          '1) Start with the Interests Test to narrow the possible fields.',
          '2) Pick three majors and put them through Compare Majors.',
          '3) Run them through the Education ROI Calculator to see cost against return.',
          '4) Review the Job Market page and Scholarships before committing.',
          '',
          'Tell me your average or the major you are considering and I can be more specific.',
        ];
  return compose(lang, lines, TOOL[lang].interests);
}

/**
 * Deterministic answer used when every remote model attempt has failed.
 * Pure function of (prompt, language, profile, majorsData) — no network, no clock.
 */
export function localAnswer(prompt: string, lang: Lang, profile?: AiProfileContext): string {
  const text = normalize(prompt);
  const grade = extractGrade(text) ?? safeGrade(profile?.grade);
  // Validated here rather than trusted: the path decides what this layer is
  // allowed to say is open to the student, so it is read through the same
  // checker the online path uses. An incomplete path answers nothing at all.
  const candidate = readStudyPath(profile);
  const path = isPathComplete(candidate) ? candidate : null;
  const named = matchMajors(text);

  // The track verdict outranks every other branch. A student who asks what
  // Medicine costs, or whether their average reaches it, while their programme
  // cannot enter it at all, is owed the track answer first — and the question
  // they asked is still answered underneath it, from the same dataset.
  if (path && named.length === 1 && eligibilityFor(named[0].id, path).status === 'not-eligible') {
    return compose(
      lang,
      // grade deliberately dropped here: comparing an average against a college
      // the path cannot enter would imply the average is what decides it.
      [...trackBlock(named[0], path, grade, lang), '', ...factsheet(named[0], lang, null)],
      TOOL[lang].field,
    );
  }

  if (hasAny(text, ['قارن', 'مقارنه', 'الفرق بين', 'compare', ' vs ', 'versus', 'difference between']) && named.length >= 2) {
    return compareAnswer(named, lang, grade, path);
  }

  if (hasAny(text, ['كلفه', 'تكلفه', 'رسوم', 'اقساط', 'سعر', 'cost', 'tuition', 'fees', 'price', 'how much'])) {
    return tuitionAnswer(named, lang, path);
  }

  if (hasAny(text, ['الخليج', 'خليج', 'سفر', 'اسافر', 'الهجره', 'الخارج', 'برا', 'gulf', 'abroad', 'emigrat', 'overseas', 'saudi', 'emirates', 'qatar'])) {
    return abroadAnswer(lang);
  }

  if (hasAny(text, ['بطاله', 'وظايف', 'وظائف', 'شواغر', 'راتب', 'رواتب', 'سوق العمل', 'unemploy', 'salary', 'salaries', 'wage', 'vacanc', 'job market', 'hiring'])) {
    return marketAnswer(named, lang, path);
  }

  if (hasAny(text, ['اهلي', 'الاهل', 'ابوي', 'امي', 'ضغط', 'يجبرو', 'يرفضو', 'family', 'parents', 'pressure', 'force me', 'against my'])) {
    return pressureAnswer(lang, grade);
  }

  if (named.length >= 2) return compareAnswer(named, lang, grade, path);

  if (named.length === 1) {
    const major = named[0];

    // The track answer comes first and, when the track is the binding
    // constraint, it IS the answer: quoting an acceptance average for a college
    // the student's programme cannot enter would be the app's worst failure.
    if (path) {
      const lines = [...trackBlock(major, path, grade, lang), '', ...factsheet(major, lang, grade), '', ...floorLines(major, grade, lang)];
      if (grade !== null && grade < major.averageAcceptance) {
        lines.push(...alternativesBlock(nearestAlternatives(major, grade, path), lang));
      }
      return compose(lang, lines, TOOL[lang].compare);
    }

    const lines = [
      ...factsheet(major, lang, grade),
      '',
      ...floorLines(major, grade, lang),
      '',
      lang === 'ar'
        ? 'لم تحدّد مسارك بعد (أكاديمي / مهني BTEC / الخطة القديمة)، ولذلك لا أستطيع أن أقول إن كان هذا التخصّص متاحاً لك في جدول مجلس التعليم العالي. حدّد مسارك ليصبح الجواب دقيقاً.'
        : 'You have not set your track yet (academic / vocational BTEC / previous plan), so I cannot say whether the Higher Education Council table opens this major to you. Set it and the answer becomes precise.',
    ];
    if (grade !== null && grade < major.averageAcceptance) {
      lines.push(...alternativesBlock(nearestAlternatives(major, grade, null), lang));
    }
    return compose(lang, lines, TOOL[lang].field);
  }

  if (grade !== null) return eligibilityAnswer(grade, lang, path);

  return defaultAnswer(lang);
}
