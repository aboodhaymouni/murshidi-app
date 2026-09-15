import { ExternalLink, Wrench, GraduationCap, CheckCircle2 } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useLang } from '../i18n/LangContext';

export default function Alternatives() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const paths = [
    { icon: GraduationCap, title: ar ? 'الدبلوم المتوسط' : 'Intermediate diploma', subtitle: ar ? 'وحدة تنسيق القبول الموحد' : 'Unified Admission Coordination Unit', url: 'https://www.admhec.gov.jo/Diplom/Home', desc: ar ? 'استعرض تخصصات الكليات وسياسة القبول للدورة 2026/2027، ثم راجع المدة والرسوم وشروط البرنامج الذي يناسبك.' : 'Browse college programs and admission policy for 2026/2027, then check duration, fees and entry requirements.' },
    { icon: Wrench, title: ar ? 'التدريب المهني' : 'Vocational training', subtitle: ar ? 'مؤسسة التدريب المهني' : 'Vocational Training Corporation', url: 'https://www.vtc.gov.jo/Ar/List/البرامج__التدريبية', desc: ar ? 'تعرّف إلى البرامج والمعاهد، ومنها الإلكترونيات والتكييف والتبريد والحرف. استفسر من المعهد عن المواعيد والكلفة والشهادة.' : 'Explore programs including electronics, refrigeration and crafts. Ask the institute about dates, fees and qualifications.' },
  ];
  const checks = ar ? ['الشهادة والجهة التي تمنحها', 'الكلفة الكاملة والمدة الفعلية', 'التدريب العملي وفرص استكمال الدراسة', 'شروط التسجيل والموعد الحالي'] : ['Qualification and awarding institution', 'Full cost and actual duration', 'Practical training and progression options', 'Entry requirements and current deadline'];
  return <div className="min-h-screen bg-gov-bg pb-28">
    <PageHeader title={ar ? 'مسارات تتسع لطموحك' : 'More paths to your future'} subtitle={ar ? 'قارن الجامعة والدبلوم والتدريب' : 'Compare university, diplomas and training'} />
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <section className="rounded-2xl bg-gov-navy p-5 text-white"><h2 className="text-xl font-bold">{ar ? 'اختر المسار المناسب لك.' : 'Choose the path that fits you.'}</h2><p className="text-sm leading-loose text-white/85 mt-2">{ar ? 'الميول والميزانية وطبيعة التعلم أهم من اسم المسار وحده. ابدأ بمعلومة من الجهة التي تقدّمه.' : 'Interests, budget and learning style matter. Start with information from the institution offering the program.'}</p></section>
      <div className="grid md:grid-cols-2 gap-4">{paths.map(p => <article key={p.url} className="gov-card p-5 flex flex-col"><p.icon size={25} className="text-gov-navy mb-3" /><h2 className="text-lg font-bold text-gov-navy">{p.title}</h2><p className="text-xs text-gov-muted mt-1">{p.subtitle}</p><p className="text-sm text-gov-body leading-loose mt-3 mb-4 flex-1">{p.desc}</p><a className="btn-primary w-full" href={p.url} target="_blank" rel="noopener noreferrer">{ar ? 'استكشف البرامج الرسمية' : 'Explore official programs'}<ExternalLink size={16} /></a></article>)}</div>
      <section className="gov-card p-5"><h2 className="text-base font-bold mb-3">{ar ? 'أسئلة تساعدك على المقارنة' : 'Questions for a fair comparison'}</h2><ul className="space-y-3">{checks.map(t => <li key={t} className="flex gap-2 text-sm text-gov-body"><CheckCircle2 size={18} className="text-gov-green shrink-0 mt-1" /><span>{t}</span></li>)}</ul></section>
      <p className="text-xs text-gov-muted leading-loose">{ar ? 'روابط راجعناها في 10 أيلول 2026. تختلف الرسوم والمدة والاعتماد حسب البرنامج؛ لا نفترض راتبًا أو فرصة توظيف.' : 'Links reviewed on 10 September 2026. Fees, duration and accreditation vary by program; salary and employment are not assumed.'}</p>
    </main>
  </div>;
}
