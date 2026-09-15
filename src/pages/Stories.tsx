import { useState } from 'react';
import { BookOpen, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useLang } from '../i18n/LangContext';

export default function Stories() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const navigate = useNavigate();
  const [filter, setFilter] = useState('all');
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const cases = ar ? [
    { id: 'budget', title: 'تخصص مناسب… وكلفة تحتاج مراجعة', situation: 'طالب يحب التقنية، لكنه يقارن بين جامعة قريبة وأخرى تحتاج سكنًا.', lesson: 'لا تتوقف عند رسم الساعة. أدخل النقل والسكن والرسوم الأخرى، وناقش الميزانية الكاملة مع الأسرة.', action: 'قارن الكلفة', route: '/roi' },
    { id: 'interests', title: 'اسم التخصص أم طبيعة دراسته؟', situation: 'طالبة تحتار بين تخصص تفضّله أسرتها ومجال تستمتع بمشاريعه.', lesson: 'اقرأ الخطتين الدراسيتين وجرّب نشاطًا في كل مجال. استخدم تمرين الميول لفتح النقاش، ثم قارن المتطلبات.', action: 'استكشف الميول', route: '/personality' },
    { id: 'paths', title: 'أكثر من طريق لبناء مهارة', situation: 'طالب يفضّل التعلّم العملي ويريد مقارنة الدبلوم والتدريب بالبكالوريوس.', lesson: 'راجع الجهة المانحة للشهادة وشروط الاستكمال والمدة والتدريب العملي. لا تختَر بناء على وعد براتب.', action: 'استكشف المسارات', route: '/alternatives' },
  ] : [
    { id: 'budget', title: 'A good fit… but check the full cost', situation: 'A student interested in technology compares a nearby university with one that requires housing.', lesson: 'Look beyond the credit fee. Add transport, housing and other fees, and discuss the complete budget with your family.', action: 'Compare costs', route: '/roi' },
    { id: 'interests', title: 'The title or the work behind it?', situation: 'A student weighs a family preference against a field whose projects she enjoys.', lesson: 'Read both curricula and try an activity in each field. Use the interests exercise to begin a conversation, then compare requirements.', action: 'Explore interests', route: '/personality' },
    { id: 'paths', title: 'More than one way to build a skill', situation: 'A practical learner compares diploma and training routes with a bachelor’s degree.', lesson: 'Check the awarding institution, progression rules, duration and hands-on training. Do not choose based on a promised salary.', action: 'Explore paths', route: '/alternatives' },
  ];
  const filters = [['all',ar?'الكل':'All'],['budget',ar?'الكلفة':'Cost'],['interests',ar?'الميول':'Interests'],['paths',ar?'المسارات':'Paths']];
  return <div className="min-h-screen bg-gov-bg pb-28">
    <PageHeader title={ar ? 'حالات للتعلّم' : 'Learning cases'} subtitle={ar ? 'أمثلة توضيحية أعدّها فريق مُرشِدي' : 'Illustrative examples by the Murshidi team'}/>
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <section className="rounded-2xl bg-gov-navy text-white p-5"><BookOpen size={25} className="text-gov-gold mb-3"/><h2 className="text-xl font-bold">{ar ? 'جرّب التفكير قبل القرار.' : 'Think it through before deciding.'}</h2><p className="text-sm leading-loose text-white/85 mt-2">{ar ? 'حالات افتراضية للتعلّم، وليست شهادات خريجين حقيقيين أو دليلًا على نتائج مُرشِدي.' : 'Fictional learning scenarios, not testimonials from real graduates or evidence of Murshidi outcomes.'}</p></section>
      <div className="flex flex-wrap gap-2" aria-label={ar?'تصفية الحالات':'Filter cases'}>{filters.map(([id,label])=><button key={id} onClick={()=>setFilter(id)} aria-pressed={filter===id} className={'min-h-[44px] px-4 rounded-lg text-sm font-semibold border '+(filter===id?'bg-gov-navy text-white border-gov-navy':'bg-white text-gov-body border-gov-line')}>{label}</button>)}</div>
      <div className="grid md:grid-cols-3 gap-4">{cases.filter(c=>filter==='all'||c.id===filter).map(c=><article key={c.id} className="gov-card p-5 flex flex-col"><span className="gov-badge gov-badge-neutral self-start">{ar?'حالة افتراضية':'Fictional case'}</span><h2 className="text-base font-bold text-gov-navy mt-3">{c.title}</h2><p className="text-sm text-gov-body leading-loose my-3">{c.situation}</p><div className="bg-gov-bg-soft rounded-lg p-3 flex-1"><p className="text-xs font-bold text-gov-navy mb-2">{ar?'الفكرة التي تتعلمها':'What to take from this'}</p><p className="text-sm text-gov-body leading-loose">{c.lesson}</p></div><button onClick={()=>navigate(c.route)} className="btn-secondary w-full mt-4">{c.action}<Arrow size={16}/></button></article>)}</div>
    </main>
  </div>;
}
