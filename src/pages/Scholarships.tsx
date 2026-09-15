import { ExternalLink, Wallet, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useLang } from '../i18n/LangContext';

export default function Scholarships() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const portals = [
    { title: ar ? 'المنح والقروض الداخلية' : 'Domestic grants and loans', subtitle: ar ? 'مديرية البعثات والمكاتب الثقافية' : 'Scholarships and Cultural Affairs Directorate', url: 'https://www.dsamohe.gov.jo/', desc: ar ? 'تابع إعلانات الدعم المالي للطلبة في الجامعات والكليات الرسمية، واقرأ شروط كل برنامج قبل التقديم.' : 'Follow financial support announcements for public university and college students. Read each program’s conditions before applying.', tag: ar ? 'بوابة رسمية' : 'Official portal' },
    { title: ar ? 'المنح الخارجية 2026/2027' : 'Overseas scholarships 2026/2027', subtitle: ar ? 'دليل الدورة الجامعية الحالية' : 'Current academic cycle guide', url: 'https://dsamohe.gov.jo/external2026/', desc: ar ? 'الإعلانات والنشرة الإرشادية والوثائق المطلوبة للدول المانحة في مكان واحد.' : 'Find announcements, application guidance and the documents required by host countries.', tag: '2026/2027' },
  ];
  const checklist = ar ? ['اقرأ موعد فتح وإغلاق الطلب في الإعلان الأصلي.', 'راجع شروط البرنامج والجامعة وفرع الثانوية.', 'تحقّق مما تغطيه المنحة: الرسوم أو المعيشة أو كليهما.', 'قدّم عبر الجهة الرسمية واحتفظ بإثبات الطلب.'] : ['Check opening and closing dates in the original announcement.', 'Review program, university and school-stream requirements.', 'Check whether tuition, living costs or both are covered.', 'Apply through the official institution and keep a receipt.'];
  return (
    <div className="min-h-screen bg-gov-bg pb-28">
      <PageHeader title={ar ? 'المنح والدعم الدراسي' : 'Scholarships & study support'} subtitle={ar ? 'ابدأ من الجهة الرسمية' : 'Start with the official institution'} />
      <main className="max-w-5xl mx-auto p-4 space-y-4">
        <section className="rounded-2xl bg-gov-navy p-5 text-white">
          <Wallet size={26} className="text-gov-gold mb-3" />
          <h2 className="text-xl font-bold">{ar ? 'وسّع خياراتك المالية.' : 'Explore your funding options.'}</h2>
          <p className="text-sm leading-loose text-white/85 mt-2">{ar ? 'روابط مباشرة تساعدك على البحث عن الدعم. الأهلية وقيمة المنحة ومواعيدها تحددها الجهة المانحة.' : 'Direct links to help you find support. The funding institution determines eligibility, amounts and deadlines.'}</p>
        </section>
        <div className="grid md:grid-cols-2 gap-4">{portals.map(p => <article key={p.url} className="gov-card p-5 flex flex-col">
          <span className="gov-badge gov-badge-info self-start">{p.tag}</span>
          <h2 className="text-base font-bold text-gov-navy mt-3">{p.title}</h2><p className="text-xs text-gov-muted mt-1">{p.subtitle}</p>
          <p className="text-sm text-gov-body leading-loose mt-3 mb-4 flex-1">{p.desc}</p>
          <a className="btn-primary w-full" href={p.url} target="_blank" rel="noopener noreferrer">{ar ? 'زيارة البوابة الرسمية' : 'Visit official portal'}<ExternalLink size={16} /></a>
        </article>)}</div>
        <section className="gov-card p-5"><h2 className="text-base font-bold text-gov-ink mb-3">{ar ? 'قبل تقديم الطلب' : 'Before you apply'}</h2><ul className="space-y-3">{checklist.map(t => <li className="flex gap-2 text-sm text-gov-body" key={t}><CheckCircle2 size={18} className="text-gov-green shrink-0 mt-1" /><span>{t}</span></li>)}</ul></section>
        <p className="text-xs text-gov-muted leading-loose">{ar ? 'روابط راجعناها في 10 أيلول 2026. ظهور البوابة هنا لا يعني أن التقديم مفتوح الآن؛ الحالة الحالية في إعلان الجهة.' : 'Links reviewed on 10 September 2026. A listing here does not mean applications are currently open; check the institution’s announcement.'}</p>
      </main>
    </div>
  );
}
