import { useState } from 'react';
import { BookOpen, Search, ChevronDown, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useLang } from '../i18n/LangContext';

function normalise(text: string) {
  return text.toLowerCase().normalize('NFKD').replace(/[\u064B-\u065F\u0670\u0640]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي');
}

export default function Chat() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<number | null>(0);
  const questions = ar ? [
    { q: 'معدّلي 78 وأرغب بدراسة الطبّ، كيف أراجع خياراتي؟', a: 'ابدأ بحدّ أهلية التقديم المنشور للبرنامج وفرع شهادتك. الحدود التنافسية للأعوام السابقة للمقارنة فقط؛ لا تعني قبولًا مضمونًا. استكشف برامج صحية أخرى وقارن رسومها ومتطلباتها قبل اتخاذ القرار.', url: 'https://www.admhec.gov.jo/', source: 'وحدة تنسيق القبول الموحد', tags: 'طبيب طب قبول معدل' },
    { q: 'ما الفرق بين أهلية التقديم والحد التنافسي؟', a: 'أهلية التقديم هي شرط لتقديم الطلب. أما الحد التنافسي فهو نتيجة قبول لدورة وفئة محددتين، ويتغير مع المقاعد والمنافسة. راجع سنة الحد وفئة الشهادة ولا تعتبره حدًا لدورة جديدة.', url: 'https://www.admhec.gov.jo/', source: 'وحدة تنسيق القبول الموحد', tags: 'قبول تنافسي اهلية جامعة' },
    { q: 'كيف أعرف الكلفة التي تتحملها عائلتي؟', a: 'احسب رسوم الساعة × الساعات المعتمدة، ثم أضف الرسوم الأخرى والنقل والسكن. في الحاسبة تستطيع تعديل افتراضاتك ومقارنتها بالميزانية. أكّد الساعات والرسوم النهائية مع الجامعة.', url: 'https://www.admhec.gov.jo/', source: 'الرسوم والبرامج في القبول الموحد', tags: 'مال كلفة ميزانية رسوم تكلفة' },
    { q: 'أين أبحث عن المنح والقروض؟', a: 'ابدأ بمديرية البعثات والمكاتب الثقافية. اقرأ الإعلان الحالي والوثائق المطلوبة ومواعيد الطلب؛ وجود برنامج دعم لا يعني أنك مؤهل له أو أن بابه مفتوح الآن.', url: 'https://www.dsamohe.gov.jo/', source: 'مديرية البعثات والمكاتب الثقافية', tags: 'منحة دعم قرض قروض' },
    { q: 'كيف أناقش أهلي عندما نختلف على التخصص؟', a: 'اقتراح مُرشِدي: حدّدوا معًا ثلاثة معايير: الميول والكلفة ومتطلبات البرنامج. اعرض بديلين أو ثلاثة مكتوبين، وجرّب نشاطًا قصيرًا في المجال. اطلبوا جلسة مع المرشد المدرسي عند الحاجة.', url: null, source: 'اقتراح إرشادي من فريق مُرشِدي', tags: 'اهل ضغط هندسة مقارنة ميول' },
    { q: 'هل البطالة العامة تتنبأ بفرصتي بعد التخرج؟', a: 'لا. مؤشرات السوق تصف مجموعة سكانية وفترة محددة؛ لا تحوّلها إلى احتمال توظيف شخصي أو راتب مضمون. استكشف خطة البرنامج والتدريب والمهارات، ثم تابع فرصًا فعلية في المجال.', url: 'https://dosweb.dos.gov.jo/', source: 'دائرة الإحصاءات العامة', tags: 'بطالة راتب سوق توظيف خليج سفر عمل اعلام' },
  ] : [
    { q: 'My grade is 78 and I want medicine. Where do I start?', a: 'Check the published eligibility threshold and your school stream. Historical competitive cutoffs are a reference, not an admission guarantee. Explore other health programs and compare their requirements and fees.', url: 'https://www.admhec.gov.jo/', source: 'Unified Admission Coordination Unit', tags: 'doctor medicine admission grade' },
    { q: 'How is eligibility different from a competitive cutoff?', a: 'Eligibility is a condition for applying. A competitive cutoff is an admission outcome for a particular cycle and applicant group. Check its year and certificate category before using it as a reference.', url: 'https://www.admhec.gov.jo/', source: 'Unified Admission Coordination Unit', tags: 'cutoff university eligible' },
    { q: 'How can I estimate the cost for my family?', a: 'Multiply the credit fee by the number of credits, then add other fees, transport and housing. Edit assumptions in the calculator and compare them with your budget. Confirm final credits and fees with the university.', url: 'https://www.admhec.gov.jo/', source: 'Official admission programs and fees', tags: 'money cost budget fees' },
    { q: 'Where can I look for scholarships and loans?', a: 'Start with the Scholarships and Cultural Affairs Directorate. Read the current announcement, required documents and deadlines. A listed program does not mean you are eligible or applications are open.', url: 'https://www.dsamohe.gov.jo/', source: 'Scholarships and Cultural Affairs Directorate', tags: 'grant funding loan scholarship' },
    { q: 'How can I discuss a different choice with my family?', a: 'Murshidi suggests agreeing on interests, cost and program requirements. Put two or three alternatives in writing and try a short activity in the field. Ask a school counsellor for help if needed.', url: null, source: 'Guidance suggestion from the Murshidi team', tags: 'family pressure engineering interests' },
    { q: 'Does general unemployment predict my future job prospects?', a: 'No. A market indicator describes a population and period, not your employment probability or a guaranteed salary. Review curricula, practical training and skills, then look at actual opportunities in your field.', url: 'https://dosweb.dos.gov.jo/', source: 'Department of Statistics', tags: 'salary jobs gulf travel market media work unemployment' },
  ];
  const filtered = questions.map((q,id)=>({...q,id})).filter(q=>normalise(q.q+' '+q.tags).includes(normalise(query.trim())));
  return <div className="min-h-screen bg-gov-bg pb-28">
    <PageHeader title={ar ? 'دليل الأسئلة الأكاديمية' : 'Academic questions guide'} subtitle={ar ? 'إجابات إرشادية وروابط للمصدر' : 'Guidance with links to original sources'} />
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <section className="rounded-2xl bg-gov-navy text-white p-5"><BookOpen size={25} className="text-gov-gold mb-3"/><h2 className="text-xl font-bold">{ar ? 'ابدأ بالسؤال الصحيح.' : 'Start with the right question.'}</h2><p className="text-sm text-white/85 leading-loose mt-2">{ar ? 'دليل أعدّه فريق مُرشِدي للأسئلة الشائعة؛ يساعدك على فهم الخطوة التالية والرجوع للجهة المختصة.' : 'A guide prepared by the Murshidi team to explain your next step and point you to the relevant institution.'}</p></section>
      <div><label htmlFor="guide-search" className="gov-label">{ar ? 'ابحث في الدليل' : 'Search the guide'}</label><div className="relative"><input id="guide-search" value={query} onChange={e=>setQuery(e.target.value)} type="search" className="gov-input pe-10" placeholder={ar ? 'مثل: الطب، الرسوم، المنح' : 'Try medicine, fees or scholarships'}/><Search size={18} className="absolute end-3 top-3 text-gov-muted pointer-events-none"/></div></div>
      <div className="space-y-3">{filtered.map(q=><article key={q.id} className="gov-card overflow-hidden">
        <button onClick={()=>setOpen(open===q.id?null:q.id)} aria-expanded={open===q.id} aria-controls={'answer-'+q.id} className="w-full p-4 flex gap-3 text-start items-center"><span className="text-sm font-bold text-gov-ink flex-1">{q.q}</span><ChevronDown size={19} className={'text-gov-navy shrink-0 transition-transform '+(open===q.id?'rotate-180':'')}/></button>
        {open===q.id && <div id={'answer-'+q.id} className="px-4 pb-4"><p className="text-sm text-gov-body leading-loose">{q.a}</p>{q.url ? <a className="inline-flex gap-2 items-center text-xs font-bold text-gov-navy mt-3 min-h-[44px]" href={q.url} target="_blank" rel="noopener noreferrer">{q.source}<ExternalLink size={14}/></a> : <p className="text-xs text-gov-muted mt-3">{q.source}</p>}</div>}
      </article>)}</div>
      {filtered.length===0 && <div className="gov-card p-5"><p className="text-sm">{ar ? 'لم نجد سؤالًا مطابقًا. جرّب «قبول» أو «كلفة» أو «منح».' : 'No matching question. Try admission, cost or scholarships.'}</p><button className="btn-secondary mt-3" onClick={()=>setQuery('')}>{ar ? 'عرض جميع الأسئلة' : 'Show all questions'}</button></div>}
      <button onClick={()=>navigate('/roi')} className="btn-primary w-full">{ar ? 'انتقل لمقارنة الخيارات' : 'Compare your options'}</button>
    </main>
  </div>;
}
