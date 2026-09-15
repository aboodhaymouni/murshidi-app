import { useNavigate } from 'react-router-dom';
import { Calculator, BarChart3, Brain, BookOpen, TrendingUp, GraduationCap, Wallet, ArrowLeft, ArrowRight, CheckCircle2, Compass } from 'lucide-react';
import OfficialHeader from '../components/OfficialHeader';
import DataStatus from '../components/DataStatus';
import { usePublicData } from '../data/PublicDataContext';
import { useLang } from '../i18n/LangContext';

export default function Home() {
  const navigate = useNavigate();
  const { lang } = useLang();
  const { data } = usePublicData();
  const ar = lang === 'ar';
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const services = [
    { to: '/personality', icon: Brain, title: ar ? 'اكتشف ميولك' : 'Explore your interests', desc: ar ? 'تمرين تأمّل قبل الاختيار' : 'A reflection exercise' },
    { to: '/scholarships', icon: Wallet, title: ar ? 'ابحث عن دعم' : 'Find study support', desc: ar ? 'بوابات المنح الرسمية' : 'Official funding portals' },
    { to: '/market', icon: BarChart3, title: ar ? 'افهم سوق العمل' : 'Understand the market', desc: ar ? 'مؤشرات الأردن بمصادرها' : 'Sourced Jordan indicators' },
    { to: '/alternatives', icon: GraduationCap, title: ar ? 'اكتشف مسارًا بديلًا' : 'Explore other paths', desc: ar ? 'الدبلوم والتدريب المهني' : 'Diplomas and vocational training' },
  ];
  const other = [
    { to: '/chat', icon: BookOpen, title: ar ? 'دليل الأسئلة الأكاديمية' : 'Academic questions guide' },
    { to: '/future', icon: TrendingUp, title: ar ? 'اتجاهات مستقبل الوظائف' : 'The future of jobs' },
    { to: '/stories', icon: Compass, title: ar ? 'حالات تساعدك على التفكير' : 'Cases to think through' },
    { to: '/simulate', icon: Calculator, title: ar ? 'جرّب سيناريو ماليًا' : 'Try a financial scenario' },
  ];
  const exam = data.metrics.find(m => m.id === 'tawjihi-passed');
  return <div className="min-h-screen bg-gov-bg pb-28">
    <OfficialHeader />
    <main className="max-w-5xl mx-auto p-4 space-y-5">
      <section className="relative overflow-hidden rounded-2xl bg-gov-navy p-5 md:p-8 text-white">
        <div className="absolute -top-12 -end-10 w-40 h-40 rounded-full border-[24px] border-white/5 pointer-events-none" />
        <div className="relative">
          <p className="text-xs font-semibold text-gov-gold">{ar ? 'مُرشِدي • من الحيرة إلى قرار' : 'MURSHIDI • FROM QUESTIONS TO CHOICES'}</p>
          <h1 className="text-[28px] md:text-4xl font-bold leading-snug mt-3">{ar ? 'تخصص يناسب طموحك.' : 'A major that fits your ambition.'}<br/><span className="text-gov-gold">{ar ? 'وكلفة تناسب واقعك.' : 'A cost that fits your life.'}</span></h1>
          <p className="text-sm text-white/85 leading-loose mt-3 max-w-xl">{ar ? 'قارن البرامج والرسوم، افهم شروط التقديم، وخذ قرارك على معلومة واضحة.' : 'Compare programs and fees, understand entry requirements, and make an informed choice.'}</p>
          <button className="mt-5 w-full md:w-auto bg-white text-gov-navy rounded-lg px-5 min-h-[48px] font-bold flex items-center justify-center gap-2 text-sm" onClick={() => navigate('/roi')}><Calculator size={18}/>{ar ? 'ابدأ مقارنة خياراتك' : 'Compare your options'}<Arrow size={18}/></button>
          <div className="flex items-center gap-2 mt-4 text-xs text-white/85"><CheckCircle2 size={15} className="text-gov-gold shrink-0"/>{ar ? 'المصدر والفترة ظاهرَان • افتراضاتك قابلة للتعديل' : 'Visible sources and periods • Editable assumptions'}</div>
        </div>
      </section>
      <DataStatus sourceId="admhec-programs" compact />
      <section>
        <div className="flex items-center justify-between gap-2 mb-3"><h2 className="text-base font-bold text-gov-ink">{ar ? 'قرارك، من كل زاوية' : 'See the whole decision'}</h2><span className="text-xs text-gov-muted" dir="ltr">Vcoders</span></div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{services.map(s=><button key={s.to} onClick={()=>navigate(s.to)} className="gov-card-interactive p-4 text-start"><s.icon size={23} className="text-gov-navy mb-3"/><h3 className="text-sm font-bold text-gov-ink">{s.title}</h3><p className="text-xs text-gov-muted mt-1 leading-relaxed">{s.desc}</p></button>)}</div>
      </section>
      <section className="gov-card p-5">
        <span className="gov-badge gov-badge-info">{ar ? 'بيانات عامة، ومصدر لكل رقم' : 'Public data, with a source for every fact'}</span>
        <div className="grid grid-cols-2 gap-4 mt-4">
          <div><p className="text-2xl font-bold text-gov-navy tabular">{data.programs.length.toLocaleString(ar ? 'ar-JO' : 'en-US')}</p><p className="text-xs text-gov-body mt-1">{ar ? 'برنامج جامعي ضمن دليل الفرع العلمي' : 'Program listings for the scientific stream'}</p></div>
          {exam && <div><p className="text-2xl font-bold text-gov-navy tabular">{exam.value.toLocaleString(ar ? 'ar-JO' : 'en-US')}</p><p className="text-xs text-gov-body mt-1">{ar ? exam.labelAr : exam.labelEn}</p><p className="text-[11px] text-gov-muted">{exam.referencePeriod}</p></div>}
        </div>
        <button onClick={()=>navigate('/compare')} className="btn-secondary w-full mt-4">{ar ? 'تصفّح البرامج وقارنها' : 'Browse and compare programs'}<Arrow size={16}/></button>
        {exam && <div className="mt-3"><DataStatus sourceId="tawjihi-2026" compact/></div>}
      </section>
      <div className="gov-card divide-y divide-gov-line">{other.map(s=><button key={s.to} onClick={()=>navigate(s.to)} className="w-full px-4 py-3 min-h-[56px] flex items-center gap-3 text-start"><s.icon size={18} className="text-gov-navy"/><span className="text-sm font-semibold flex-1">{s.title}</span><Arrow size={16} className="text-gov-muted"/></button>)}</div>
      <p className="text-xs text-gov-muted leading-loose text-center">{ar ? 'مُرشِدي مشروع طلابي مستقل من Vcoders. نساعدك على المقارنة؛ القبول النهائي لدى الجهة المختصة.' : 'Murshidi is an independent student project by Vcoders. We help you compare; institutions make final admission decisions.'}</p>
    </main>
  </div>;
}
