import { useState } from 'react';
import { Brain, RotateCcw, ArrowLeft, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { useLang } from '../i18n/LangContext';
import { majorsData } from '../data/majors';

const activities = [
  { id:'R', ar:'أستمتع بإصلاح شيء أو صنعه بيدي.', en:'I enjoy fixing or building something with my hands.', labelAr:'عملي', labelEn:'Practical' },
  { id:'I', ar:'أستمتع بالبحث وتحليل سبب المشكلة.', en:'I enjoy investigating and analysing why a problem occurs.', labelAr:'تحليلي', labelEn:'Analytical' },
  { id:'A', ar:'أستمتع بالتصميم والكتابة وصناعة أفكار جديدة.', en:'I enjoy design, writing and creating new ideas.', labelAr:'إبداعي', labelEn:'Creative' },
  { id:'S', ar:'أستمتع بتعليم الآخرين ومساعدتهم.', en:'I enjoy teaching and helping other people.', labelAr:'اجتماعي', labelEn:'Social' },
  { id:'E', ar:'أستمتع بقيادة المبادرات وعرض الأفكار.', en:'I enjoy leading initiatives and presenting ideas.', labelAr:'ريادي', labelEn:'Enterprising' },
  { id:'C', ar:'أستمتع بتنظيم التفاصيل والأرقام والخطط.', en:'I enjoy organising details, numbers and plans.', labelAr:'منظّم', labelEn:'Organised' },
] as const;

export default function Personality() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const navigate = useNavigate();
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const [answers, setAnswers] = useState<number[]>([]);
  const done = answers.length === activities.length;
  const step = answers.length;
  const current = activities[step];
  const max = Math.max(0,...answers);
  const top = done && max > 0 ? activities.filter((_,i)=>answers[i]===max) : [];
  const examples = majorsData.filter(m=>m.matchedPersonality.some(p=>top.some(t=>t.id===p[0]))).slice(0,4);
  return <div className="min-h-screen bg-gov-bg pb-28">
    <PageHeader title={ar?'استكشف ميولك':'Explore your interests'} subtitle={ar?'تمرين تأمّل، وليس اختبارًا نفسيًا معتمدًا':'A reflection exercise, not a validated psychological test'}/>
    <main className="max-w-3xl mx-auto p-4 space-y-4">
      <section className="rounded-2xl bg-gov-navy text-white p-5"><Brain size={27} className="text-gov-gold mb-3"/><h1 className="text-xl font-bold">{done?(ar?'ما الذي تستمتع به؟':'What do you enjoy?'):(ar?'ابدأ بما تحب فعله.':'Start with what you enjoy doing.')}</h1><p className="text-sm text-white/85 leading-loose mt-2">{ar?'ست أنشطة لتفتح نقاشًا مع نفسك ومرشدك. لا تحدد النتيجة قدرتك أو تخصصك المناسب وحدها.':'Six activities to begin a conversation with yourself and a counsellor. The result alone does not determine ability or the right major.'}</p></section>
      {!done && <>
        <div className="flex items-center justify-between text-xs text-gov-muted"><span>{ar?'التقدّم':'Progress'}</span><span>{step+1} {ar?'من':'of'} {activities.length}</span></div>
        <div className="h-2 bg-gov-line rounded-full overflow-hidden" role="progressbar" aria-label={ar?'الأنشطة المكتملة':'Completed activities'} aria-valuenow={step} aria-valuemin={0} aria-valuemax={activities.length}><div className="h-full bg-gov-navy transition-all" style={{width:(step/activities.length*100)+'%'}}/></div>
        <section className="gov-card p-5"><p className="text-xs text-gov-navy font-semibold mb-3">{ar?'قيّم مدى اهتمامك بهذا النشاط':'How interested are you in this activity?'}</p><h2 className="text-lg font-bold leading-loose mb-5">{ar?current.ar:current.en}</h2><div className="space-y-3">{[2,1,0].map(value=><button key={value} onClick={()=>setAnswers([...answers,value])} className="w-full min-h-[52px] px-4 py-3 rounded-lg border border-gov-line text-start flex justify-between items-center hover:border-gov-navy hover:bg-gov-bg-soft font-semibold text-sm"><span>{value===2?(ar?'أستمتع به':'I enjoy it'):value===1?(ar?'قد أجرّبه':'I might try it'):(ar?'لا يجذبني حاليًا':'It does not interest me right now')}</span><Arrow size={17} className="text-gov-navy"/></button>)}</div></section>
        {step>0 && <button className="btn-secondary w-full" onClick={()=>setAnswers(answers.slice(0,-1))}>{ar?'تعديل الإجابة السابقة':'Edit previous answer'}</button>}
      </>}
      {done && <>
        <section className="gov-card p-5"><h2 className="font-bold text-base mb-4">{ar?'اهتماماتك بحسب إجاباتك':'Your self-reported interests'}</h2><div className="space-y-4">{activities.map((a,i)=><div key={a.id}><div className="flex justify-between text-sm mb-1"><span>{ar?a.labelAr:a.labelEn}</span><span className="text-gov-muted text-xs">{answers[i]===2?(ar?'أستمتع به':'Enjoy'):answers[i]===1?(ar?'قد أجرّبه':'Might try'):(ar?'ليس حاليًا':'Not now')}</span></div><div className="h-2 rounded-full bg-gov-bg"><div className="h-2 rounded-full bg-gov-navy" style={{width:answers[i]*50+'%'}}/></div></div>)}</div></section>
        {top.length>0 ? <section className="gov-card p-5"><h2 className="font-bold text-base">{ar?'أمثلة لتبدأ الاستكشاف':'Examples to start exploring'}</h2><p className="text-xs text-gov-muted leading-loose mt-2 mb-4">{ar?'ربط توضيحي من فريق مُرشِدي، وليس توصية قبول أو قياس انسجام علميًا. راجع الخطة والأنشطة الفعلية لكل برنامج.':'Illustrative connections by the Murshidi team, not admission advice or a scientific match score. Review each program’s curriculum and activities.'}</p><div className="flex gap-2 flex-wrap">{examples.map(m=><span className="gov-badge gov-badge-info" key={m.id}>{ar?m.nameAr:m.nameEn}</span>)}</div><button className="btn-primary w-full mt-4" onClick={()=>navigate('/compare')}>{ar?'استكشف البرامج وقارن':'Explore and compare programs'}<Arrow size={16}/></button></section>:<section className="gov-card p-5"><h2 className="text-base font-bold">{ar?'لا بأس أن تكون في مرحلة الاستكشاف.':'It is fine to still be exploring.'}</h2><p className="text-sm text-gov-body leading-loose mt-2">{ar?'جرّب نشاطًا قصيرًا أو تحدث مع مرشدك، ثم عد للتمرين عندما تتضح لك اهتمامات جديدة.':'Try a short activity or talk to a counsellor, then revisit this exercise as new interests emerge.'}</p></section>}
        <button onClick={()=>setAnswers([])} className="btn-secondary w-full"><RotateCcw size={16}/>{ar?'إعادة التمرين':'Restart the exercise'}</button>
      </>}
    </main>
  </div>;
}
