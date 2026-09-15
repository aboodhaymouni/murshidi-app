import { ExternalLink, TrendingUp, BookOpen } from 'lucide-react';
import PageHeader from '../components/PageHeader';
import { useLang } from '../i18n/LangContext';

const source = 'https://www.weforum.org/publications/the-future-of-jobs-report-2025/digest/';

export default function Future() {
  const { lang } = useLang();
  const ar = lang === 'ar';
  const skills = ar ? ['الذكاء الاصطناعي والبيانات', 'الشبكات والأمن السيبراني', 'التفكير التحليلي والتعلّم المستمر'] : ['AI and data', 'Networks and cybersecurity', 'Analytical thinking and lifelong learning'];
  return <div className="min-h-screen bg-gov-bg pb-28">
    <PageHeader title={ar ? 'مستقبل الوظائف' : 'The future of jobs'} subtitle={ar ? 'اتجاهات عالمية حتى 2030' : 'Global trends through 2030'} />
    <main className="max-w-5xl mx-auto p-4 space-y-4">
      <section className="rounded-2xl bg-gov-navy text-white p-5"><span className="text-xs text-gov-gold font-bold">WEF • 2025–2030</span><h2 className="text-xl font-bold mt-2">{ar ? 'تعلّم مهارة قابلة للتطوير.' : 'Build skills that can evolve.'}</h2><p className="text-sm text-white/85 leading-loose mt-2">{ar ? 'توقعات تقرير مستقبل الوظائف 2025 عالمية، ولا تمثل أعداد وظائف أو فرص توظيف فردية في الأردن.' : 'The Future of Jobs Report 2025 offers global projections, not Jordanian vacancies or individual job prospects.'}</p></section>
      <section className="gov-card p-5"><h2 className="font-bold text-base mb-4">{ar ? 'التغير المتوقع عالميًا حتى 2030' : 'Projected global change by 2030'}</h2><div className="grid grid-cols-3 gap-3">
        {[['170', ar ? 'مليون وظيفة جديدة' : 'million jobs created'], ['92', ar ? 'مليون وظيفة مزاحة' : 'million jobs displaced'], ['78', ar ? 'مليون صافي زيادة' : 'million net increase']].map(([v,l]) => <div key={v} className="text-center"><p className="text-2xl font-bold text-gov-navy tabular" dir="ltr">{v}</p><p className="text-xs text-gov-body mt-1">{l}</p></div>)}
      </div><p className="text-xs text-gov-muted leading-relaxed mt-4">{ar ? 'إسقاطات مبنية على توقعات أصحاب العمل في استطلاع التقرير.' : 'Projections based on employers’ expectations in the report’s survey.'}</p></section>
      <section className="gov-card p-5"><TrendingUp size={23} className="text-gov-green" /><h2 className="font-bold text-base mt-3 mb-3">{ar ? 'مهارات تستحق المتابعة' : 'Skills to keep developing'}</h2><div className="space-y-3">{skills.map((s,i)=><div key={s} className="flex gap-3 items-center"><span className="w-8 h-8 rounded-lg bg-gov-bg text-gov-navy flex items-center justify-center text-sm font-bold">{i+1}</span><p className="text-sm text-gov-body">{s}</p></div>)}</div></section>
      <section className="bg-gov-green/5 border border-gov-green/20 rounded-xl p-5"><BookOpen size={22} className="text-gov-green" /><h2 className="text-base font-bold mt-2">{ar ? 'حوّل الاتجاه إلى خطوة' : 'Turn a trend into an action'}</h2><p className="text-sm leading-loose text-gov-body mt-2">{ar ? 'اقتراح مُرشِدي: اقرأ خطة التخصص، جرّب مشروعًا صغيرًا، واسأل عن التدريب العملي قبل بناء قرارك.' : 'Murshidi suggests reviewing the curriculum, trying a small project and asking about practical training before deciding.'}</p></section>
      <a href={source} target="_blank" rel="noopener noreferrer" className="btn-secondary w-full">{ar ? 'اقرأ التقرير الأصلي' : 'Read the original report'}<ExternalLink size={16}/></a>
      <p className="text-xs text-gov-muted">{ar ? 'المصدر: المنتدى الاقتصادي العالمي • نُشر 7 كانون الثاني 2025 • راجعنا الرابط في 10 أيلول 2026.' : 'Source: World Economic Forum • Published 7 January 2025 • Link reviewed 10 September 2026.'}</p>
    </main>
  </div>;
}
