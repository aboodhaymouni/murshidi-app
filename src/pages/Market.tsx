import { ArrowLeft, ArrowRight, BarChart3, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import DataStatus from '../components/DataStatus';
import { usePublicData } from '../data/PublicDataContext';
import { useLang } from '../i18n/LangContext';

export default function Market() {
  const { lang } = useLang();
  const { data } = usePublicData();
  const navigate = useNavigate();
  const ar = lang === 'ar';
  const Arrow = ar ? ArrowLeft : ArrowRight;
  const metrics = data.metrics.filter(m => m.sourceId === 'dos-unemployment');
  const graduates = data.metrics.filter(m => m.sourceId === 'higher-education-graduates');
  return <div className="min-h-screen bg-gov-bg pb-28">
    <PageHeader title={ar ? 'سوق العمل الأردني' : 'Jordan’s labour market'} subtitle={ar ? 'المؤشر مع سياقه ومصدره' : 'Every indicator, in context'} />
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <section className="rounded-2xl bg-gov-navy text-white p-5"><BarChart3 size={26} className="text-gov-gold mb-3"/><h2 className="text-xl font-bold">{ar ? 'افهم الصورة الكبيرة.' : 'Understand the bigger picture.'}</h2><p className="text-sm text-white/85 leading-loose mt-2">{ar ? 'معدلات البطالة الرسمية تساعدك على فهم السوق. لا تمثل احتمال توظيفك أو بطالة تخصص بعينه.' : 'Official unemployment rates help explain the market. They do not represent your employment probability or a specific major’s unemployment rate.'}</p></section>
      <DataStatus sourceId="dos-unemployment" />
      <div className="grid md:grid-cols-2 gap-4">{metrics.map(m=><article key={m.id} className="gov-card p-5">
        <p className="text-xs text-gov-muted">{m.referencePeriod}</p><h2 className="text-base font-bold text-gov-ink mt-1">{ar ? m.labelAr : m.labelEn}</h2>
        <p className="text-4xl font-bold text-gov-navy my-3 tabular" dir="ltr">{m.value.toLocaleString(ar ? 'ar-JO' : 'en-US')}{m.unit === 'percent' ? '%' : ''}</p>
        <p className="text-sm text-gov-body">{ar ? m.populationAr : m.populationEn}</p>
        {m.unit === 'percent' && <div className="h-2 rounded-full bg-gov-bg mt-4 overflow-hidden" aria-hidden="true"><div className="h-full rounded-full bg-gov-navy" style={{width:m.value + '%'}}/></div>}
      </article>)}</div>
      {metrics.length===0 && <p className="gov-card p-5 text-sm">{ar ? 'لا تتوفر مؤشرات في النسخة الحالية. استخدم زر التحديث أو ارجع للمصدر.' : 'No indicators are available in this version. Refresh or open the original source.'}</p>}
      <section className="gov-card p-5"><div className="flex gap-2"><Info size={20} className="text-gov-navy shrink-0 mt-1"/><div><h2 className="font-bold text-sm">{ar ? 'كيف تقرأ الأرقام؟' : 'How to read these figures'}</h2><p className="text-sm text-gov-body mt-2 leading-loose">{ar ? 'قارن المؤشرات ذات الفترة والسكان نفسيهما. الإجمالي يشمل الأردنيين وغير الأردنيين؛ لذلك يختلف عن مؤشر الأردنيين. تاريخ التحقق لا يغيّر فترة القياس.' : 'Compare figures with the same reference period and population. The total includes Jordanians and non-Jordanians, so it differs from the Jordanian rate. A new check date does not change the measurement period.'}</p></div></div></section>
      {graduates.length > 0 && <section className="space-y-3">
        <div><h2 className="text-base font-bold text-gov-navy">{ar ? 'آخر خلاصة منشورة لخريجي التعليم العالي' : 'Latest published graduate summary'}</h2><p className="text-xs text-gov-muted mt-1">{ar ? 'الفترة المرجعية 2022/2023؛ هذه ليست أعداد خريجي 2026.' : 'Reference period 2022/2023; these are not 2026 graduate counts.'}</p></div>
        <div className="grid md:grid-cols-2 gap-3">{graduates.map(m=><article key={m.id} className="gov-card p-4">
          <p className="text-xs font-semibold text-gov-body">{m.id === 'bachelor-graduates' ? (ar ? 'منهم خريجو البكالوريوس' : 'Of whom bachelor graduates') : (ar ? 'إجمالي الخريجين' : 'Total graduates')}</p>
          <p className="text-3xl font-bold text-gov-navy my-2 tabular" dir="ltr">{m.value.toLocaleString(ar ? 'ar-JO' : 'en-US')}</p>
          <p className="text-xs text-gov-muted leading-relaxed">{ar ? m.populationAr : m.populationEn}</p>
        </article>)}</div>
        <DataStatus sourceId="higher-education-graduates" compact />
      </section>}
      <button className="btn-secondary w-full" onClick={()=>navigate('/future')}>{ar ? 'استكشف المهارات واتجاهات المستقبل' : 'Explore skills and future trends'}<Arrow size={16}/></button>
    </main>
  </div>;
}
