// A ready demo identity, seeded once on a device that has never been used.
//
// The app is shown to people in short live demos, where "create an account,
// answer twelve questions, run a calculation" is three minutes nobody has. So a
// first launch lands signed in, on a profile that already has history: saved
// majors, a finished interests report, past calculations, a conversation with
// the advisor. Every screen therefore has something real to render immediately.
//
// It is seeded ONLY when no account exists at all. Signing out, deleting the
// account, or creating a second one leaves it alone, and a real account behaves
// exactly as it always did — starting empty, which is correct for a real user.

import { REPORT_VERSION } from './riasec';
import {
  DEMO_ACCOUNT_ID,
  seedAccount,
  type Account,
  type StudyPath,
} from './account';

const ACTIVITY_PREFIX = 'murshidi.activity.';
const REPORT_PREFIX = 'murshidi.riasec.';
const SEEDED_FLAG = 'murshidi.demo.v2';

/** Academic track, science-and-technology field: the most instructive path to
 *  open on, because it opens computing and closes medicine — so the eligibility
 *  engine has something to say on the first screen a visitor sees. */
const DEMO_PATH: StudyPath = { track: 'academic', field: 'science-tech' };
const DEMO_GRADE = 87;

/** Days back from now, as an ISO string — so seeded history is never in the future. */
function daysAgo(days: number, hour = 10): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(hour, (days * 7) % 60, 0, 0);
  return d.toISOString();
}

function write(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage is optional; a demo that cannot seed still runs empty */
  }
}

function activityStore() {
  return {
    events: [
      { kind: 'visit', at: daysAgo(11), label: '/roi' },
      { kind: 'calculation', at: daysAgo(11, 11), label: 'cs' },
      { kind: 'calculation', at: daysAgo(11, 12), label: 'data-science' },
      { kind: 'calculation', at: daysAgo(10, 9), label: 'cyber' },
      { kind: 'visit', at: daysAgo(10), label: '/compare' },
      { kind: 'comparison', at: daysAgo(10, 12), label: 'cs · data-science · cyber' },
      { kind: 'calculation', at: daysAgo(9, 10), label: 'architecture' },
      { kind: 'calculation', at: daysAgo(9, 14), label: 'cs' },
      { kind: 'visit', at: daysAgo(8), label: '/market' },
      { kind: 'calculation', at: daysAgo(8, 11), label: 'business' },
      { kind: 'visit', at: daysAgo(7), label: '/scholarships' },
      { kind: 'calculation', at: daysAgo(7, 13), label: 'accounting' },
      { kind: 'visit', at: daysAgo(6), label: '/personality' },
      { kind: 'interestsTest', at: daysAgo(6, 13), label: 'RIASEC' },
      { kind: 'calculation', at: daysAgo(5, 10), label: 'cs' },
      { kind: 'visit', at: daysAgo(4), label: '/chat' },
      { kind: 'aiQuestion', at: daysAgo(4, 15), label: 'الطب والمسار' },
      { kind: 'aiQuestion', at: daysAgo(4, 16), label: 'علوم الحاسوب' },
      { kind: 'calculation', at: daysAgo(3, 9), label: 'data-science' },
      { kind: 'visit', at: daysAgo(3), label: '/simulate' },
      { kind: 'simulation', at: daysAgo(3, 12), label: 'cs' },
      { kind: 'calculation', at: daysAgo(2, 16), label: 'cyber' },
      { kind: 'visit', at: daysAgo(1), label: '/alternatives' },
      { kind: 'calculation', at: daysAgo(1, 10), label: 'cs' },
      { kind: 'calculation', at: daysAgo(1, 17), label: 'nursing' },
    ],
    savedMajors: ['cs', 'data-science', 'cyber', 'architecture'],
    reports: [
      { id: 'demo-interests', kind: 'interests', title: 'تقرير الميول', at: daysAgo(6, 13) },
      { id: 'demo-roi', kind: 'roi', title: 'عائد التعليم — علوم الحاسوب', at: daysAgo(11, 11) },
      { id: 'demo-compare', kind: 'compare', title: 'مقارنة ثلاثة تخصّصات', at: daysAgo(10, 12) },
    ],
  };
}

/** A finished interests report, so Profile and the test both open with a result. */
function interestsReport() {
  return {
    version: REPORT_VERSION,
    at: daysAgo(6, 13),
    lang: 'ar',
    coreScores: { R: 6, I: 18, A: 7, S: 5, E: 8, C: 11 },
    adaptiveScores: { R: 0, I: 6, A: 0, S: 0, E: 3, C: 3 },
    adaptiveAnswers: [],
    adaptiveUsed: false,
    top: ['I', 'C', 'E'],
    shortlist: [
      { id: 'cs', fit: 92 },
      { id: 'data-science', fit: 88 },
      { id: 'cyber', fit: 84 },
      { id: 'accounting', fit: 71 },
      { id: 'business', fit: 66 },
    ],
    blocked: [{ id: 'medicine', fit: 74 }],
    grade: DEMO_GRADE,
    path: DEMO_PATH,
    narrative:
      'نمطك الغالب تحليليّ ومنظّم: تميل إلى تفكيك المسألة قبل حلّها، وتفضّل العمل الذي تُقاس نتيجته. ' +
      'بمعدّل 87 في الحقل الأكاديمي — العلوم والتكنولوجيا، أنت فوق الحدّ الأدنى المنشور لتخصّصات كليّة ' +
      'تكنولوجيا المعلومات والذكاء الاصطناعي (75%)، وهذه أقرب مجموعة إلى نمطك.\n\n' +
      'انتبه إلى أمرين: الحدّ الأدنى للالتحاق ليس الحدّ التنافسي — وهذا الأخير لم يُنشر بعد لعام 2026/2027 ' +
      'وهو عادةً أعلى. والطبّ البشري، وإن ظهر كتطابق قويّ مع ميولك، ليس ضمن قوائم حقلك بحسب جدول مجلس ' +
      'التعليم العالي؛ فهو متاح من الحقل الصحّي.\n\n' +
      'هذا التحليل إرشاديّ وليس تقييماً نفسيّاً معتمداً.',
    narrativeModel: 'demo',
  };
}

/**
 * Seeds the demo identity if — and only if — this device has no account yet.
 * Returns the account when it seeds one, null when it leaves things alone.
 */
export async function seedDemoIdentity(): Promise<Account | null> {
  try {
    if (localStorage.getItem(SEEDED_FLAG) === '1') return null;
  } catch {
    return null;
  }

  const account = await seedAccount({
    id: DEMO_ACCOUNT_ID,
    name: 'عبد الرحمن الهيموني',
    grade: DEMO_GRADE,
    city: 'عمّان',
    path: DEMO_PATH,
    createdAt: daysAgo(14, 9),
  });
  if (!account) return null;

  write(`${ACTIVITY_PREFIX}${account.id}`, activityStore());
  write(`${REPORT_PREFIX}${account.id}`, interestsReport());
  try {
    localStorage.setItem(SEEDED_FLAG, '1');
  } catch {
    /* the flag is best-effort; worst case it seeds again on a device that cannot store */
  }
  return account;
}

/** True when this profile is the seeded demo rather than one a person created. */
export function isDemoAccount(id: string | null | undefined): boolean {
  return id === DEMO_ACCOUNT_ID;
}
